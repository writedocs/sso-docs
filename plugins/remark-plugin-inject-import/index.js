const { visit } = require("unist-util-visit");
const { parse } = require("@babel/parser");

const dontChange = {
  ApiTabs: "import ApiTabs from '@theme/ApiTabs';",
  DiscriminatorTabs: "import DiscriminatorTabs from '@theme/DiscriminatorTabs';",
  Heading: "import Heading from '@theme/Heading';",
  MethodEndpoint: "import MethodEndpoint from '@theme/ApiExplorer/MethodEndpoint';",
  MimeTabs: "import MimeTabs from '@theme/MimeTabs';",
  OperationTabs: "import OperationTabs from '@theme/OperationTabs';",
  ParamsItem: "import ParamsItem from '@theme/ParamsItem';",
  ResponseSamples: "import ResponseSamples from '@theme/ResponseSamples';",
  SchemaItem: "import SchemaItem from '@theme/SchemaItem';",
  SchemaTabs: "import SchemaTabs from '@theme/SchemaTabs';",
  SecuritySchemes: "import SecuritySchemes from '@theme/ApiExplorer/SecuritySchemes';",
  ParamsDetails: "import ParamsDetails from '@theme/ParamsDetails';",
  RequestSchema: "import RequestSchema from '@theme/RequestSchema';",
  StatusCodes: "import StatusCodes from '@theme/StatusCodes';",
  ApiLogo: "import ApiLogo from '@theme/ApiLogo';",
  Export: "import Export from '@theme/ApiExplorer/Export';",
  TabItem: "import TabItem from '@theme/TabItem';",
};

function parseCodeToEstree(code) {
  return parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  }).program;
}
function normalizeImport(importStr) {
  return importStr
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//gm, "")
    .trim();
}

function remarkDynamicImports({ componentImportMap = {} } = {}) {
  return (tree, file) => {
    // Determine the file path from the vFile.
    const filePath = file && file.history && file.history[0] ? file.history[0] : "";
    // If the file ends with .api.mdx or .info.mdx, mark it as an API file.
    const isAPIFile = filePath.endsWith(".api.mdx") || filePath.endsWith(".info.mdx");
    // For API files, don't protect the dontChange imports.
    const protectDontChange = !isAPIFile;

    // 1. Detect used components.
    const usedComponents = new Set();
    visit(
      tree,
      (node) => node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement",
      (node) => {
        // If API file, ignore "TabItem"
        if (isAPIFile && node.name === "TabItem") return;
        if (componentImportMap[node.name]) {
          usedComponents.add(node.name);
        }
      }
    );

    // 2. Build new import code from used components.
    let newImportsCode = "";
    for (const componentName of usedComponents) {
      const importLine = componentImportMap[componentName];
      if (importLine) {
        newImportsCode += importLine + "\n";
      }
    }
    if (!newImportsCode) return; // Nothing to inject.

    // 3. Remove only dynamic import nodes (and lines in mdxjsEsm nodes) that are in our map
    // or match a regex for imports ending with "@site/src/components".
    const dynamicImportRegex = /from\s+["']@site\/src\/components["'];?\s*(?:(?:\/\/.*)|(?:\/\*[\s\S]*?\*\/))?\s*$/;
    const dontChangeValues = Object.values(dontChange).map((s) => s.trim());

    tree.children = tree.children.filter((node) => {
      if (node.type === "import") {
        const trimmed = (node.value || "").trim();
        if (protectDontChange && dontChangeValues.includes(trimmed)) {
          // For non-API files, preserve dontChange imports.
          return true;
        }
        const inMap = Object.values(componentImportMap).some((mapImport) => mapImport.trim() === trimmed);
        if (inMap || dynamicImportRegex.test(trimmed)) {
          return false; // Remove dynamic import.
        }
      } else if (node.type === "mdxjsEsm") {
        if (node.value) {
          const lines = node.value.split("\n");
          const filteredLines = lines.filter((line) => {
            const trimmedLine = line.trim();
            if (protectDontChange && dontChangeValues.includes(trimmedLine)) {
              return true;
            }
            const inMapLine = Object.values(componentImportMap).some((mapImport) => mapImport.trim() === trimmedLine);
            return !(inMapLine || dynamicImportRegex.test(trimmedLine));
          });
          if (filteredLines.length === 0) {
            return false;
          } else {
            node.value = filteredLines.join("\n");
            node.data = node.data || {};
            node.data.estree = parseCodeToEstree(node.value);
          }
        }
      }
      return true;
    });

    // 4. Extract YAML nodes (front matter) from the beginning.
    let headerNodes = [];
    while (tree.children.length > 0 && tree.children[0].type === "yaml") {
      headerNodes.push(tree.children.shift());
    }

    // 5. Create a new mdxjsEsm node with the new import code.
    const newEsmNode = {
      type: "mdxjsEsm",
      value: newImportsCode,
      data: {
        estree: parseCodeToEstree(newImportsCode),
      },
    };

    // 6. Reassemble the AST: YAML nodes, then our new mdxjsEsm node, then the rest.
    tree.children = [...headerNodes, newEsmNode, ...tree.children];
  };
}

module.exports = remarkDynamicImports;
