const fs = require("fs");
const path = require("path");

const COMPONENTS_IMPORT =
  'import { Video, Accordion, AccordionGroup, Callout, Card, CardList, Image, Tabs } from "@site/src/components"; // apiFiles import';

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else if (file.endsWith(".mdx")) {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

// Function to extract components from the index.js file
function extractComponents(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const exportRegex = /export\s*\{\s*([\s\S]*?)\s*\};/;
  const match = fileContent.match(exportRegex);

  if (match && match[1]) {
    const filteredComponents = match[1]
      .split(",")
      .filter((component) => component.trim() !== "TabItem");

    const components = filteredComponents
      .map((component) => component.trim())
      .join(", ");

    // Construct the import string
    const importString = `import { ${components} } from "@site/src/components"; // apiFiles import`;

    return importString;
  } else {
    return COMPONENTS_IMPORT;
  }
}

// Function to edit the files
function editFiles(files, importString) {
  files.forEach((file) => {
    let fileContent = fs.readFileSync(file, "utf-8");

    fileContent = fileContent.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

    // Check for any import statement from @site/src/components
    const hasComponentImport = /^import.*from "@site\/src\/components";/m.test(
      fileContent
    );

    // Split file content into lines
    const parts = fileContent.split("---");
    if (parts.length >= 3) {
      const metadata = parts[1];
      // Remove info_path: line from metadata
      const updatedMetadata = metadata
        .split("\n")
        .filter((line) => !line.trim().startsWith("info_path:"))
        .join("\n");

      const body = parts.slice(2).join("---");

      // Only add import string if there's no existing component import
      const newContent = !hasComponentImport
        ? `---${updatedMetadata}---\n\n${importString}${body}`
        : `---${updatedMetadata}---${body}`;

      fs.writeFileSync(file, newContent, "utf-8");
    }
  });
}

function runAddContent(dirPath) {
  const componentsFilePath = path.join(__dirname, "src/components/index.js");
  // Get all mdx files in the directory
  const files = getAllFiles(dirPath);

  // Generate the import string
  const importString = extractComponents(componentsFilePath);

  // Edit each file by adding the import string after the metadata
  editFiles(files, importString);
}

function main() {
  // const { languages } = getJson('./config.json');
  const paths = [path.join(__dirname, "docs/reference")];
  // if (languages && languages.length > 1) {
  //   languages.slice(1).forEach((lang) => {
  //     paths.push(path.join(__dirname,`i18n/${lang}/docusaurus-plugin-content-docs/current/reference`));
  //   });
  // }
  paths.forEach((path) => {
    runAddContent(path);
  });
}

main();
