const { visit } = require("unist-util-visit");
const { parse } = require("@babel/parser");
const generate = require("@babel/generator").default;

/**
 * Helper: Convert a code string into an ESTree Program node.
 * Returns the program node (which includes a body array).
 */
function parseCodeToEstree(code) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });
  return ast.program;
}

/**
 * Process an import node: remove any import declarations or specifiers
 * if they correspond to components in the componentsMap.
 *
 * - If the import's source is "@site/src/components", remove the whole declaration.
 * - Otherwise, remove only specifiers whose imported (or local) name exists in componentsMap.
 *
 * Returns the modified node, or null if the entire node should be removed.
 */
function processImportNode(node, componentsMap) {
  if (typeof node.value !== "string") return node;

  try {
    const ast = parse(node.value, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    // Process each import declaration in the node.
    ast.program.body = ast.program.body.filter((decl) => {
      if (decl.type !== "ImportDeclaration") return true;

      // If the source is "@site/src/components", remove the entire declaration.
      if (decl.source.value === "@site/src/components") {
        return false;
      }

      // Otherwise, filter out any specifier whose name is in componentsMap.
      decl.specifiers = decl.specifiers.filter((spec) => {
        let name = null;
        if (spec.type === "ImportSpecifier") {
          name = spec.imported.name;
        } else if (spec.type === "ImportDefaultSpecifier" || spec.type === "ImportNamespaceSpecifier") {
          name = spec.local.name;
        }
        // Remove the specifier if its name is in the componentsMap.
        return !componentsMap.hasOwnProperty(name);
      });

      // If no specifiers remain, remove the declaration.
      return decl.specifiers.length > 0;
    });

    // If no declarations remain, remove the node entirely.
    if (ast.program.body.length === 0) {
      return null;
    }

    // Otherwise, regenerate the code and update the node.
    const newCode = generate(ast, {}, node.value).code;
    node.value = newCode;
    return node;
  } catch (err) {
    // If parsing fails, leave the node unchanged.
    return node;
  }
}

module.exports = function componentsImportPlugin(options) {
  const { componentsMap } = options;

  return (tree) => {
    // 1. Process all import (or mdxjsEsm starting with "import") nodes.
    tree.children = tree.children
      .map((node) => {
        if (node.type === "import" || (node.type === "mdxjsEsm" && node.value.trim().startsWith("import"))) {
          return processImportNode(node, componentsMap);
        }
        return node;
      })
      .filter(Boolean);

    // 2. Traverse the AST to detect usage of components from the componentsMap.
    const usedComponents = new Set();

    // Helper: Extract a component name from a node.
    function extractComponentName(node) {
      if (node.type === "jsx" && typeof node.value === "string") {
        const match = node.value.match(/<([A-Za-z][A-Za-z0-9_]*)\b/);
        return match ? match[1] : null;
      }
      if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
        return node.name || null;
      }
      return null;
    }

    visit(tree, (node) => {
      const componentName = extractComponentName(node);
      if (componentName && componentsMap.hasOwnProperty(componentName)) {
        usedComponents.add(componentName);
      }
    });

    // 3. If used components are found, build the new import code.
    if (usedComponents.size > 0) {
      const newImportsCode = Array.from(usedComponents)
        .map((component) => componentsMap[component])
        .join("\n");

      // 4. Extract YAML frontmatter header nodes (if any).
      const headerNodes = [];
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

      // 6. Reassemble the AST: header nodes first, then the new import node, then the rest.
      tree.children = [...headerNodes, newEsmNode, ...tree.children];
    }
  };
};
