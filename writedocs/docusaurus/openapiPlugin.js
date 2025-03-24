import fs from "fs";
import path from "path";

function defineApiOptions(apiOptions) {
  return {
    ...(apiOptions && "hideSendButton" in apiOptions && { hideSendButton: apiOptions.hideSendButton }),
  };
}

function createOpenApiConfig(configurations, planConfig) {
  const directoryPath = "openAPI";
  const proxyUrl = "https://proxy.writechoice.io/";
  const defaultOutputBaseDir = "docs/reference";

  // Check if there are any default or translated API files.
  const hasDefaultFiles = configurations.apiFiles && configurations.apiFiles.length > 0;
  const hasTranslatedFiles =
    configurations.translatedApiFiles && Object.keys(configurations.translatedApiFiles).length > 0;
  if (!hasDefaultFiles && !hasTranslatedFiles) {
    return null;
  }

  // Helper function to recursively get all file paths in a directory.
  function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        fileList = getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  const allFiles = getAllFiles(directoryPath);
  const config = {};

  // Process default API files.
  if (hasDefaultFiles) {
    const normalizedFileNames = configurations.apiFiles.map((fileName) => {
      // If the path doesn't start with "openAPI/", add the directoryPath prefix
      if (!fileName.startsWith(`${directoryPath}/`)) {
        return path.join(directoryPath, fileName);
      }
      return fileName;
    });
    const validFiles = normalizedFileNames.filter((file) => allFiles.includes(file));
    validFiles.forEach((file) => {
      const fileName = path.parse(file).name;
      const specPath = file;
      const relativePath = path.relative(directoryPath, path.dirname(file));
      const outputDir =
        relativePath && relativePath !== "."
          ? path.join(defaultOutputBaseDir, relativePath, fileName.replace("_", "-"))
          : path.join(defaultOutputBaseDir, fileName.replace("_", "-"));
      const keyName = relativePath && relativePath !== "." ? `${relativePath}-${fileName}` : fileName;

      config[keyName] = { specPath, outputDir, ...defineApiOptions(configurations.apiOptions) };
      if (!(configurations.proxy === false || planConfig.proxy === false)) {
        config[keyName].proxy = proxyUrl;
      }
    });
  }

  // Process translated API files.
  if (hasTranslatedFiles) {
    Object.keys(configurations.translatedApiFiles).forEach((locale) => {
      const fileNames = configurations.translatedApiFiles[locale];
      if (!fileNames || fileNames.length === 0) return;
      const normalizedFileNames = fileNames.map((fileName) => {
        if (!fileName.startsWith(`${directoryPath}/`)) {
          return path.join(directoryPath, fileName);
        }
        return fileName;
      });
      const validFiles = normalizedFileNames.filter((file) => allFiles.includes(file));
      validFiles.forEach((file) => {
        const fileName = path.parse(file).name;
        const specPath = file;
        const relativePath = path.relative(directoryPath, path.dirname(file));
        // Build the output directory using the i18n structure.
        const baseOutputDir = path.join("i18n", locale, "docusaurus-plugin-content-docs", "current", "reference");
        const outputDir = path.join(baseOutputDir, fileName.replace("_", "-"));
        const keyName = relativePath && relativePath !== "." ? `${relativePath}-${fileName}` : fileName;
        // Suffix the key with the locale to avoid collisions.
        const combinedKey = `${keyName}-${locale}`;

        config[combinedKey] = { specPath, outputDir, ...defineApiOptions(configurations.apiOptions) };
        if (!(configurations.proxy === false || planConfig.proxy === false)) {
          config[combinedKey].proxy = proxyUrl;
        }
      });
    });
  }

  return [
    "docusaurus-plugin-openapi-docs",
    {
      id: "openapi",
      docsPluginId: "classic",
      config,
    },
  ];
}

export default createOpenApiConfig;
