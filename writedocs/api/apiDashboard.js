const fs = require("fs");
const path = require("path");

// Base directories
const docsBaseDir = path.join(__dirname, "../../docs");
const userPagesDir = path.join(__dirname, "../../apiPages");

/**
 * Recursively search for files in a directory that satisfy a predicate.
 */
const findFilesRecursively = (dir, predicate) => {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(findFilesRecursively(fullPath, predicate));
    } else {
      if (predicate(item, fullPath)) {
        results.push(fullPath);
      }
    }
  }
  return results;
};

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
 * Parse the <MethodEndpoint> tag in an API file and extract its attributes.
 */
const parseMethodEndpoint = (content) => {
  const tagMatch = content.match(/<MethodEndpoint\s+([^>]+)>/);
  if (!tagMatch) return null;
  const attrsStr = tagMatch[1];
  const methodMatch = attrsStr.match(/method=\{"([^"]+)"\}/i);
  const pathMatch = attrsStr.match(/path=\{"([^"]+)"\}/);
  if (methodMatch && pathMatch) {
    return {
      method: methodMatch[1].toLowerCase(),
      path: pathMatch[1],
    };
  }
  return null;
};

/**
 * Search the entire docs folder for a matching API file (ending with .api.mdx) that
 * has the same base name and matching metadata.
 */
const searchForMatchingApiFile = (baseName, routeMethod, routePath) => {
  const predicate = (fileName, fullPath) => {
    return fileName.endsWith(".api.mdx") && path.basename(fileName, ".api.mdx") === baseName;
  };
  const candidates = findFilesRecursively(docsBaseDir, predicate);
  for (const candidatePath of candidates) {
    const apiContent = fs.readFileSync(candidatePath, "utf-8");
    const endpointData = parseMethodEndpoint(apiContent);
    if (endpointData) {
      if (endpointData.method === routeMethod.toLowerCase() && endpointData.path === routePath) {
        return candidatePath;
      } else {
        console.log(
          `Candidate ${candidatePath} metadata mismatch: expected ${routeMethod.toLowerCase()} ${routePath}, got ${
            endpointData.method
          } ${endpointData.path}`
        );
      }
    } else {
      console.log(`Candidate ${candidatePath} missing <MethodEndpoint> tag.`);
    }
  }
  return null;
};

/**
 * Update the YAML front matter of the API file with description and slug from endpoint metadata.
 */
const updateApiMetadata = (apiContent, endpointMetadata) => {
  const yamlRegex = /^\s*---[\r\n]+([\s\S]*?)[\r\n]+---/;
  const match = apiContent.match(yamlRegex);
  let updatedYaml = "";
  if (match) {
    let yamlContent = match[1];

    // For each key (description and slug), replace or add if provided in endpoint metadata.
    ["description", "slug"].forEach((key) => {
      if (endpointMetadata[key]) {
        const keyRegex = new RegExp(`^(${key}\\s*:\\s*).*$`, "m");
        if (yamlContent.match(keyRegex)) {
          // Replace the value for the key.
          yamlContent = yamlContent.replace(keyRegex, `$1${endpointMetadata[key]}`);
        } else {
          // Append the key if it doesn't exist.
          yamlContent += `\n${key}: ${endpointMetadata[key]}`;
        }
      }
    });

    updatedYaml = `---\n${yamlContent}\n---`;
    // Replace old YAML front matter with updated YAML.
    apiContent = apiContent.replace(yamlRegex, updatedYaml);
  } else {
    // If there is no YAML front matter, add one.
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
 * Process the apiPages directory: for each endpoint file, find the matching API file,
 * merge the content, update YAML metadata, write the merged file to the destination folder in docs (preserving the relative structure),
 * and then remove the original API file if it’s in a different location.
 */
const processDirectory = (dirPath) => {
  try {
    const items = fs.readdirSync(dirPath);
    items.forEach((item) => {
      const fullPath = path.join(dirPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith(".endpoint.mdx") && !item.endsWith(".api.mdx") && !item.endsWith("info.mdx")) {
        // Processing endpoint file
        const baseName = item.slice(0, -".endpoint.mdx".length);
        const userPageContent = fs.readFileSync(fullPath, "utf-8");

        // Extract YAML metadata from the endpoint file.
        const metadata = extractMetadata(userPageContent);
        if (!metadata.route) {
          console.warn(`No route metadata found in ${item}`);
          return;
        }
        // Example: "POST /encrypted/v1/{clientRef}"
        const [routeMethod, ...routePathParts] = metadata.route.split(" ");
        const routePath = routePathParts.join(" ").trim();

        // Find the matching API file anywhere under docs.
        const matchingApiPath = searchForMatchingApiFile(baseName, routeMethod, routePath);
        if (!matchingApiPath) {
          console.warn(`No matching API file found for ${item} (expected route: ${metadata.route})`);
          return;
        }

        const apiContent = fs.readFileSync(matchingApiPath, "utf-8");
        const contentToAdd = extractContentAfterMetadata(userPageContent);

        // Locate the insertion point: immediately after </MethodEndpoint>
        const endpointIndex = apiContent.indexOf("</MethodEndpoint>");
        if (endpointIndex === -1) {
          console.warn(`No </MethodEndpoint> tag found in ${matchingApiPath}`);
          return;
        }

        // Find the next tag (if any) after </MethodEndpoint>
        const remainingContent = apiContent.slice(endpointIndex + "</MethodEndpoint>".length);
        const nextTagMatch = remainingContent.match(
          /<(ParamsDetails|RequestSchema|StatusCodes|OperationTabs|TabItem|Heading)[^>]*>/
        );
        const nextTagIndex = nextTagMatch ? nextTagMatch.index : -1;

        // Merge the content (non-metadata portion).
        let mergedContent =
          apiContent.slice(0, endpointIndex + "</MethodEndpoint>".length) +
          "\n\n" +
          contentToAdd +
          "\n\n" +
          (nextTagIndex !== -1 ? remainingContent.slice(nextTagIndex) : "");

        // Update YAML metadata in the merged content with the endpoint description and slug.
        mergedContent = updateApiMetadata(mergedContent, metadata);

        // Compute destination folder:
        // Use the relative path of the endpoint file (from apiPages) and replace its base with docs.
        const relativePath = path.relative(userPagesDir, path.dirname(fullPath));
        const destinationDir = path.join(docsBaseDir, relativePath);
        fs.mkdirSync(destinationDir, { recursive: true });
        const destinationPath = path.join(destinationDir, `${baseName}.api.mdx`);

        fs.writeFileSync(destinationPath, mergedContent, "utf-8");

        // Remove the original API file only if it is not already in the correct location.
        if (path.resolve(matchingApiPath) !== path.resolve(destinationPath)) {
          fs.unlinkSync(matchingApiPath);
        }
      }
    });
  } catch (error) {
    console.error(`Error processing directory ${dirPath}: ${error.message}`);
    process.exit(1);
  }
};

module.exports = processDirectory;
