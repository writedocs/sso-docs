const { visit } = require("unist-util-visit");

function rehypeWrapTables() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "table" && parent) {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrapper"] },
          children: [node],
        };
      }
    });
  };
}

module.exports = rehypeWrapTables;
