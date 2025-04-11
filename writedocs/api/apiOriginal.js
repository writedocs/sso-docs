const fs = require("fs");
const path = require("path");

const referenceDir = path.join(__dirname, "../../docs/reference");
const userPagesDir = path.join(__dirname, "../../apiPages");

/**
 * Extract YAML front matter metadata as a key/value object.
 */
const extractMetadata = (content) => {
  const match = content.match(/^\s*---[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (match) {
    const yamlContent = match[1];
    const metadata = {};
    yamlContent.split(/\r?\n/).forEach((line) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(":").trim();
        metadata[key] = value;
      }
    });
    return metadata;
  }
  return {};
};

/**
 * Extract the content after YAML front matter.
 */
const extractContentAfterMetadata = (content) => {
  const matches = content.match(/^\s*---[\r\n]+([\s\S]*?)[\r\n]+\s*---[\r\n]+([\s\S]*)/);
  let processedContent = matches ? matches[2].trim() : content;

  // Remove only specific import statements
  processedContent = processedContent.replace(
    /import.*?from\s+["']@site\/src\/components["'](\s*\/\/\s*apiFiles import\s*)?;\n?/g,
    ""
  );

  return processedContent.trim();
};

/**
 * Update the YAML front matter of the API content with description and slug
 * from the endpoint metadata.
 */
const updateApiMetadata = (apiContent, endpointMetadata) => {
  const yamlRegex = /^\s*---[\r\n]+([\s\S]*?)[\r\n]+---/;
  const match = apiContent.match(yamlRegex);
  let updatedYaml = "";
  if (match) {
    let yamlContent = match[1];
    // Update or add each key (description and slug) if provided
    ["description", "slug", "title"].forEach((key) => {
      if (endpointMetadata[key]) {
        const keyRegex = new RegExp(`^(${key}\\s*:\\s*).*$`, "m");
        if (yamlContent.match(keyRegex)) {
          // Replace the existing key's value.
          yamlContent = yamlContent.replace(keyRegex, `$1${endpointMetadata[key]}`);
        } else {
          // Append the key if it doesn't exist.
          yamlContent += `\n${key}: ${endpointMetadata[key]}`;
        }
      }
    });
    updatedYaml = `---\n${yamlContent}\n---`;
    // Replace the old YAML front matter with the updated one.
    apiContent = apiContent.replace(yamlRegex, updatedYaml);
  } else {
    // If no YAML front matter exists, create one.
    updatedYaml = "---\n";
    ["description", "slug"].forEach((key) => {
      if (endpointMetadata[key]) {
        updatedYaml += `${key}: ${endpointMetadata[key]}\n`;
      }
    });
    updatedYaml += "---";
    apiContent = `${updatedYaml}\n\n${apiContent}`;
  }
  return apiContent;
};

/**
 * Process the apiPages directory: for each endpoint file, merge its content into
 * the corresponding .api.mdx file in the reference directory and update the YAML
 * metadata with description and slug values.
 */
const processDirectory = (dirPath, isApiPagesDir = true) => {
  try {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const fullPath = path.join(dirPath, item);

      if (fs.statSync(fullPath).isDirectory()) {
        // Process subdirectories (relative path calculation can be extended if needed)
        processDirectory(fullPath, isApiPagesDir);
      } else if (item.endsWith(".endpoint.mdx") && !item.endsWith(".api.mdx") && !item.endsWith("info.mdx")) {
        const baseName = item.slice(0, -13);
        // Calculate the path for the .api.mdx file in the reference directory.
        const relativePath = path.relative(userPagesDir, dirPath);
        const correspondingRefPath = path.join(referenceDir, relativePath);
        const apiMdxFile = `${baseName}.api.mdx`;
        const apiMdxPath = path.join(correspondingRefPath, apiMdxFile);
        const userPagePath = fullPath;

        if (fs.existsSync(apiMdxPath)) {
          const mdxContent = fs.readFileSync(userPagePath, "utf-8");
          const apiMdxContent = fs.readFileSync(apiMdxPath, "utf-8");

          // Extract endpoint metadata from endpoint.mdx
          const endpointMetadata = extractMetadata(mdxContent);
          // Extract content (after YAML) to add.
          const contentToAdd = extractContentAfterMetadata(mdxContent);

          // Find the position to insert the content in the api.mdx file.
          const endpointIndex = apiMdxContent.indexOf("</MethodEndpoint>");
          if (endpointIndex === -1) {
            console.warn(`No </MethodEndpoint> tag found in ${apiMdxFile}`);
            return;
          }

          // Find the next opening tag after </MethodEndpoint>
          const remainingContent = apiMdxContent.slice(endpointIndex + "</MethodEndpoint>".length);
          const nextTagMatch = remainingContent.match(
            /<(ParamsDetails|RequestSchema|StatusCodes|OperationTabs|TabItem|Heading)[^>]*>/
          );
          const nextTagIndex = nextTagMatch ? nextTagMatch.index : -1;

          // Merge content: before the insertion point, then the content from the endpoint file,
          // then the remaining content starting at the next tag (if found).
          let newContent =
            apiMdxContent.slice(0, endpointIndex + "</MethodEndpoint>".length) +
            "\n\n" +
            contentToAdd +
            "\n\n" +
            (nextTagIndex !== -1 ? remainingContent.slice(nextTagIndex) : "");

          // Update the YAML metadata in the merged content.
          newContent = updateApiMetadata(newContent, endpointMetadata);

          fs.writeFileSync(apiMdxPath, newContent, "utf-8");
          console.log(`Successfully merged ${item} from apiPages into ${apiMdxFile}`);
        }
      }
    });
  } catch (error) {
    // Handle error as needed.
    return;
  }
};

module.exports = processDirectory;
