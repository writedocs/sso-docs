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
};

function parseCodeToEstree(code) {
  return parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  }).program;
}

/**
 * Normalize an import string by removing inline (//) and block (/* ... * /) comments,
 * and trimming extra whitespace.
 */
function normalizeImport(importStr) {
  return importStr
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//gm, "")
    .trim();
}

/**
 * The dynamic imports plugin:
 * - It scans for used components (based on your componentImportMap).
 * - It builds new import statements from that map.
 * - When cleaning header nodes, it removes only those import lines that:
 *    • exactly match one of the componentImportMap values or
 *    • match a regex for imports ending with "@site/src/components"
 *   unless they exactly match one of the dontChange import strings.
 */
function remarkDynamicImports({ componentImportMap = {} } = {}) {
  return (tree) => {
    // 1. Detect used components (using MDX v2 node types)
    const usedComponents = new Set();
    visit(
      tree,
      (node) => node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement",
      (node) => {
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

    // 3. Remove only import nodes (and lines in mdxjsEsm nodes) that are dynamic.
    // Only remove if the import exactly matches one of our componentImportMap values
    // or if it matches a regex for imports ending with "@site/src/components".
    // But leave unchanged any import that exactly matches one of the dontChange values.
    const dynamicImportRegex = /from\s+["']@site\/src\/components["'];?\s*(?:(?:\/\/.*)|(?:\/\*[\s\S]*?\*\/))?\s*$/;
    const dontChangeValues = Object.values(dontChange).map((s) => s.trim());

    tree.children = tree.children.filter((node) => {
      if (node.type === "import") {
        const trimmed = (node.value || "").trim();
        if (dontChangeValues.includes(trimmed)) {
          // Do not remove imports that belong to dontChange.
          return true;
        }
        const inMap = Object.values(componentImportMap).some((mapImport) => mapImport.trim() === trimmed);
        if (inMap || dynamicImportRegex.test(trimmed)) {
          return false; // Remove this dynamic import.
        }
      } else if (node.type === "mdxjsEsm") {
        if (node.value) {
          // Process each line individually.
          const lines = node.value.split("\n");
          const filteredLines = lines.filter((line) => {
            const trimmedLine = line.trim();
            if (dontChangeValues.includes(trimmedLine)) {
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

    // 6. Reassemble the AST so that the header (YAML) comes first,
    // then our new mdxjsEsm node, then the rest.
    tree.children = [...headerNodes, newEsmNode, ...tree.children];
  };
}

module.exports = remarkDynamicImports;
