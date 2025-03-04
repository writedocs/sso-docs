const { visit } = require("unist-util-visit");
const { parse } = require("@babel/parser");

function parseCodeToEstree(code) {
  return parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  }).program;
}

function remarkDynamicImports({ componentImportMap = {} } = {}) {
  return (tree) => {
    // 1. Detect used components (using MDX v2 node types)
    const usedComponents = new Set();
    visit(
      tree,
      (node) =>
        node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement",
      (node) => {
        if (componentImportMap[node.name]) {
          // console.log("Found usage of component:", node.name);
          usedComponents.add(node.name);
        }
      }
    );

    // 2. Build new import code from used components.
    let newImportsCode = "";
    for (const componentName of usedComponents) {
      const importLine = componentImportMap[componentName];
      if (importLine) {
        // console.log("Injecting import for:", componentName, importLine);
        newImportsCode += importLine + "\n";
      }
    }

    if (!newImportsCode) return; // Nothing to inject.

    // 3. Remove all existing import nodes and mdxjsEsm nodes that contain import declarations.
    tree.children = tree.children.filter((node) => {
      if (node.type === "import") return false;
      if (node.type === "mdxjsEsm") {
        // Remove mdxjsEsm nodes that start with "import"
        const trimmed = (node.value || "").trim();
        if (trimmed.startsWith("import")) return false;
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

    // 6. Reassemble the AST so the header (YAML) comes first, then our new mdxjsEsm node, then the rest.
    tree.children = [...headerNodes, newEsmNode, ...tree.children];
  };
}

module.exports = remarkDynamicImports;
