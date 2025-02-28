const fs = require("fs");
const path = require("path");
const { truncateChangelog } = require("./changelog");
const { importLine } = require("./variables");

const processFile = (filePath) => {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  let updatedContent = fileContent;

  // Check if the import line is already there to avoid duplicates
  if (!fileContent.includes(importLine)) {
    // Insert the import line after the metadata block (usually after the first '---')
    updatedContent = updatedContent.replace(
      /^---\s*[\s\S]*?---\s*/,
      (match) => `${match}\n${importLine}\n\n`
    );
  }

  // Additional processing for 'changelog' folder
  if (filePath.includes(`changelog`)) {
    updatedContent = truncateChangelog(fileContent, updatedContent);
  }

  // Write the updated content back to the file if changes were made
  if (updatedContent !== fileContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
  }
};

const processFileOnUpdate = (projectRoot, filePath) => {
  const relativeFilePath = path.relative(projectRoot, filePath);
  const destMdxPath = path.join(__dirname, `../../${relativeFilePath}`);

  // Ensure the destination directory exists
  fs.mkdirSync(path.dirname(destMdxPath), { recursive: true });

  let fileContent = fs.readFileSync(filePath, 'utf-8');
  let updatedContent = fileContent;

  // Check if the import line is already there to avoid duplicates
  if (!fileContent.includes(importLine)) {
    // Insert the import line after the metadata block (usually after the first '---')
    updatedContent = updatedContent.replace(
      /^---\s*[\s\S]*?---\s*/,
      (match) => `${match}\n${importLine}\n\n`
    );
  }

  // Additional processing for 'changelog' folder
  if (relativeFilePath.includes(`changelog`)) {
    updatedContent = truncateChangelog(fileContent, updatedContent);
  }

  // Write the updated content to the destination file
  fs.writeFileSync(destMdxPath, updatedContent, 'utf-8');
};


module.exports = {
  processFile,
  processFileOnUpdate
}