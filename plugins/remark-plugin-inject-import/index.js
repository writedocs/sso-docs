const { visit } = require("unist-util-visit");
const { parse } = require("@babel/parser");

/**
 * Parse code to an ESTree Program.
 */
function parseCodeToEstree(code) {
  return parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  }).program;
}

/**
 * Remove all import nodes (or lines within mdxjsEsm nodes)
 * that reference "@site/src/components".
 */
function removeBulkImports(tree) {
  const bulkImportRegex = /from\s+["']@site\/src\/components["']/;
  // Remove standalone import nodes.
  tree.children = tree.children.filter((node) => {
    if (node.type === "import" && node.value) {
      return !bulkImportRegex.test(node.value);
    }
    return true;
  });
  // Process mdxjsEsm nodes.
  visit(tree, "mdxjsEsm", (node) => {
    if (node.value) {
      const filteredLines = node.value.split("\n").filter((line) => !bulkImportRegex.test(line));
      node.value = filteredLines.join("\n");
      if (node.data) {
        node.data.estree = parseCodeToEstree(node.value);
      }
    }
  });
}

/**
 * remarkDynamicImports:
 *
 * 1. Uses visit() to remove any existing header import statements referencing "@site/src/components".
 * 2. Extracts YAML front matter nodes from the top of the AST.
 * 3. Determines whether the file is an API file by checking file.history.
 *    (If file.history isn’t available, it defaults to doc mode.)
 * 4. Selects a new import block from your components mapping:
 *      - For API files, uses componentsMap.api.
 *      - For doc files, uses componentsMap.doc.
 * 5. Inserts a new mdxjsEsm node with that import block right after YAML.
 *
 * Your components mapping should be an object such as:
 *
 *    export default {
 *      api: "import { Accordion, AccordionGroup, APICard, Callout, Card, CardList, Image, Request, Response, Searchbar, Tabs, Video } from '@site/src/components';",
 *      doc: "import { Accordion, AccordionGroup, APICard, Callout, Card, CardList, Image, Request, Response, Searchbar, Tabs, Tab, TabItem, Video } from '@site/src/components';",
 *    };
 */
function remarkDynamicImports({ componentsMap = {} } = {}) {
  return (tree, file) => {
    // Step 1: Remove existing bulk imports.
    removeBulkImports(tree);

    // Step 2: Extract YAML front matter from the top.
    const yamlNodes = [];
    while (tree.children.length > 0 && tree.children[0].type === "yaml") {
      yamlNodes.push(tree.children.shift());
    }

    // Step 3: Determine file type.
    let filePath = "";
    if (file && file.history && file.history[0]) {
      filePath = file.history[0];
    }
    const isAPIFile = filePath && (filePath.endsWith(".api.mdx") || filePath.endsWith(".info.mdx"));
    // console.log("Processing file:", filePath || "<unknown>");
    // console.log("File type:", isAPIFile ? "API" : "Doc");

    // Step 4: Select new import block.
    const newImportBlock = isAPIFile ? componentsMap.api : componentsMap.doc;
    if (!newImportBlock) {
      console.warn("No import block defined for", isAPIFile ? "API" : "Doc");
      return;
    }
    // console.log("Injecting import block:", newImportBlock);

    // Step 5: Create a new mdxjsEsm node with the new import block.
    const newEsmNode = {
      type: "mdxjsEsm",
      value: newImportBlock,
      data: {
        estree: parseCodeToEstree(newImportBlock),
      },
    };

    // Step 6: Reassemble the AST: YAML front matter first, then new import node, then the rest.
    tree.children = [...yamlNodes, newEsmNode, ...tree.children];
  };
}

module.exports = remarkDynamicImports;
