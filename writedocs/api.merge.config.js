const fs = require("fs");
const path = require("path");

const referenceDir = path.join(__dirname, "../docs/reference");
const userPagesDir = path.join(__dirname, "../apiPages");

const extractContentAfterMetadata = (content) => {
  const matches = content.match(
    /^\s*---[\r\n]+([\s\S]*?)[\r\n]+\s*---[\r\n]+([\s\S]*)/
  );
  let processedContent = matches ? matches[2].trim() : content;

  // Remove only specific import statements
  processedContent = processedContent.replace(
    /import.*?from\s+["']@site\/src\/components["'](\s*\/\/\s*apiFiles import\s*)?;\n?/g,
    ""
  );

  return processedContent.trim();
};

const processDirectory = (dirPath, isApiPagesDir = true) => {
  try {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const fullPath = path.join(dirPath, item);

      if (fs.statSync(fullPath).isDirectory()) {
        // Calculate relative path for subdirectories
        const relativePath = path.relative(userPagesDir, fullPath);
        const correspondingRefPath = path.join(referenceDir, relativePath);
        processDirectory(fullPath, isApiPagesDir);
      } else if (
        item.endsWith(".endpoint.mdx") &&
        !item.endsWith(".api.mdx") &&
        !item.endsWith("info.mdx")
      ) {
        const baseName = item.slice(0, -13);
        // Calculate the path for the .api.mdx file in the reference directory
        const relativePath = path.relative(userPagesDir, dirPath);
        const correspondingRefPath = path.join(referenceDir, relativePath);
        const apiMdxFile = `${baseName}.api.mdx`;
        const apiMdxPath = path.join(correspondingRefPath, apiMdxFile);
        const userPagePath = fullPath;

        if (fs.existsSync(apiMdxPath)) {
          const mdxContent = fs.readFileSync(userPagePath, "utf-8");
          const apiMdxContent = fs.readFileSync(apiMdxPath, "utf-8");

          // Extract content after metadata
          const contentToAdd = extractContentAfterMetadata(mdxContent);

          // Find the position to insert the content
          const endpointIndex = apiMdxContent.indexOf("</MethodEndpoint>");
          if (endpointIndex === -1) {
            console.warn(`No </MethodEndpoint> tag found in ${apiMdxFile}`);
            return;
          }

          // Find the next opening tag after </MethodEndpoint>
          const remainingContent = apiMdxContent.slice(
            endpointIndex + "</MethodEndpoint>".length
          );
          const nextTagMatch = remainingContent.match(
            /<(ParamsDetails|RequestSchema|StatusCodes|OperationTabs|TabItem|Heading)[^>]*>/
          );
          const nextTagIndex = nextTagMatch ? nextTagMatch.index : -1;

          // Create the new content by combining the parts
          const newContent =
            apiMdxContent.slice(0, endpointIndex + "</MethodEndpoint>".length) +
            "\n\n" +
            contentToAdd +
            "\n\n" +
            (nextTagIndex !== -1 ? remainingContent.slice(nextTagIndex) : "");

          fs.writeFileSync(apiMdxPath, newContent, "utf-8");
          console.log(
            `Successfully merged ${item} from apiPages into ${apiMdxFile}`
          );
        }
      }
    });
  } catch (error) {
    // console.error(`Error processing directory ${dirPath}: ${error.message}`);
    // process.exit(1);
    return;
  }
};

try {
  processDirectory(userPagesDir);
  // console.log("[API Generation] API documentation merge completed");
} catch (error) {
  // console.error(`Error merging API documentation: ${error.message}`);
  process.exit(1);
}
