const fs = require("fs");
const path = require("path");

function deleteAllApiMdxFiles(directory) {
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    if (fs.statSync(fullPath).isDirectory()) {
      deleteAllApiMdxFiles(fullPath);
    } else if (item.endsWith(".api.mdx")) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted: ${fullPath}`);
    }
  }
}

const docsDir = path.join(__dirname, "../docs");

try {
  deleteAllApiMdxFiles(docsDir);
} catch (error) {
  console.error("Error deleting api files:", error);
  process.exit(1);
}
