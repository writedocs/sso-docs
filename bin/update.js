const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const glob = require("glob");
const checkDuplicates = require("./utils/validateSidebar");
const { referenceImports } = require("./utils/variables");
const { processFile } = require("./utils/processFile");
const print = require("./utils/print");

const projectRoot = process.cwd();

const copyFile = (path, dest) => {
  if (fs.existsSync(path)) {
    try {
      fse.copySync(path, dest);
    } catch (err) {
      print.error(`Error copying ${path} file: ${err.message}`);
      process.exit(1);
    }
  }
};

const checkAndCopyConfig = () => {
  const configPath = path.join(projectRoot, "config.json");
  const destConfigPath = path.join(__dirname, "../config.json");

  if (!fs.existsSync(configPath)) {
    print.error("config.json not found in the current directory.");
    process.exit(1);
  }

  try {
    fse.copySync(configPath, destConfigPath);
  } catch (err) {
    print.error(`Error copying config.json: ${err.message}`);
    process.exit(1);
  }

  checkDuplicates(destConfigPath);

  const translationPath = path.join(projectRoot, "translations.json");
  const destTranslationPath = path.join(__dirname, "../translations.json");

  copyFile(translationPath, destTranslationPath);

  const cssPath = path.join(projectRoot, "custom.css");
  const destCssPath = path.join(__dirname, "../src/css/_custom.css");

  copyFile(cssPath, destCssPath);

  const homePath = path.join(projectRoot, "homepage.html");
  const destHomePath = path.join(__dirname, "../homepage.html");

  copyFile(homePath, destHomePath);
};

const clearCurrentMdx = (destPath) => {
  const destMdxPath = path.join(__dirname, destPath);

  try {
    fse.emptyDirSync(destMdxPath);
  } catch (err) {
    print.error(`Internal error copying ${destPath} folder`);
    process.exit(1);
  }
};

const copyMdx = (sourcePath, destPath) => {
  const sourceMdxPath = path.join(projectRoot, sourcePath);
  const destMdxPath = path.join(__dirname, destPath);

  if (!fs.existsSync(sourceMdxPath)) {
    print.error(`Folder ${sourcePath} not found in the current directory.`);
    if (sourcePath === "docs") {
      process.exit(1);
    }
  }

  try {
    fse.copySync(sourceMdxPath, destMdxPath);
  } catch (err) {
    print.error(`Error copying ${sourcePath} folder: ${err.message}`);
    process.exit(1);
  }
};

// const reloadMdxFiles = (sourcePath, destPath) => {
//   clearCurrentMdx(destPath);
//   copyMdx(sourcePath, destPath);
// }

const reloadMdxFiles = (sourcePath, destPath) => {
  clearCurrentMdx(destPath);

  // Handle reference files separately
  if (sourcePath === "docs") {
    const sourceDocsPath = path.join(projectRoot, sourcePath);
    const destDocsPath = path.join(__dirname, destPath);
    const sourceReferencePath = path.join(sourceDocsPath, "reference");
    const destApiPagesPath = path.join(__dirname, "../apiPages");

    // Copy non-reference docs normally
    try {
      // Copy everything except the reference folder
      fse.copySync(sourceDocsPath, destDocsPath, {
        filter: (src) => !src.includes(path.join("docs", "reference")),
      });
    } catch (err) {
      print.error(`Error copying ${sourcePath} folder: ${err.message}`);
      process.exit(1);
    }

    // Copy reference files to apiPages or docs based on file extension
    if (fs.existsSync(sourceReferencePath)) {
      try {
        // Walk through all files in reference directory
        const walkSync = (dir, relativePath = "") => {
          const files = fs.readdirSync(dir);
          files.forEach((file) => {
            const fullPath = path.join(dir, file);
            const relativeFilePath = path.join(relativePath, file);

            if (fs.statSync(fullPath).isDirectory()) {
              // If it's a directory, recurse into it
              walkSync(fullPath, relativeFilePath);
            } else if (file.endsWith(".endpoint.mdx")) {
              // Copy .endpoint.mdx files to apiPages maintaining folder structure
              const targetPath = path.join(destApiPagesPath, relativeFilePath);
              fse.ensureDirSync(path.dirname(targetPath));
              fse.copyFileSync(fullPath, targetPath);
            } else {
              // Copy other files to docs/reference maintaining folder structure
              const targetPath = path.join(
                destDocsPath,
                "reference",
                relativeFilePath
              );
              fse.ensureDirSync(path.dirname(targetPath));
              fse.copyFileSync(fullPath, targetPath);
            }
          });
        };

        walkSync(sourceReferencePath);
      } catch (err) {
        print.error(`Error processing reference folder: ${err.message}`);
        process.exit(1);
      }
    }
  } else {
    // For non-docs folders, proceed with normal copy
    copyMdx(sourcePath, destPath);
  }
};

const updateMdxFiles = (folderPath) => {
  const docsPath = path.join(__dirname, folderPath);
  const mdxFiles = glob.sync(`${docsPath}/**/*.mdx`);

  mdxFiles.forEach(processFile);
};

const updateReferenceFiles = () => {
  const referencePath = path.join(__dirname, "../docs/reference");
  const mdxFiles = glob.sync(`${referencePath}/**/*.mdx`);

  mdxFiles.forEach((file) => {
    let fileContent = fs.readFileSync(file, "utf-8");

    // Check if the additional import lines are already there to avoid duplicates
    if (!fileContent.includes(referenceImports)) {
      // Insert the additional import lines after the metadata block (usually after the first `---`)
      const updatedContent = fileContent.replace(
        /^---\s*[\s\S]*?---\s*/,
        (match) => `${match}\n${referenceImports}\n`
      );
      fs.writeFileSync(file, updatedContent, "utf-8");
    }
  });
};

const copyMedia = () => {
  const sourceMediaPath = path.join(projectRoot, "media");
  const destMediaPath = path.join(__dirname, "../static/media");

  if (!fs.existsSync(sourceMediaPath)) {
    return;
  }

  try {
    fse.copySync(sourceMediaPath, destMediaPath, {
      overwrite: true,
      errorOnExist: false,
      recursive: true,
    });
  } catch (err) {
    print.error(`Error copying media folder: ${err.message}`);
    process.exit(1);
  }
};

const copyData = () => {
  const sourceMediaPath = path.join(projectRoot, "data");
  const destMediaPath = path.join(__dirname, "../data");

  if (!fs.existsSync(sourceMediaPath)) {
    return;
  }

  try {
    fse.copySync(sourceMediaPath, destMediaPath, {
      overwrite: true,
      errorOnExist: false,
      recursive: true,
    });
  } catch (err) {
    print.error(`Error copying data folder: ${err.message}`);
    process.exit(1);
  }
};

const copyComponents = () => {
  const sourceComponentsPath = path.join(projectRoot, "components");
  const destComponentsPath = path.join(__dirname, "../src/components");

  if (!fs.existsSync(sourceComponentsPath)) {
    return;
  }

  try {
    fse.copySync(sourceComponentsPath, destComponentsPath);
  } catch (err) {
    print.error(`Error copying components folder: ${err.message}`);
    process.exit(1);
  }
};

module.exports = {
  checkAndCopyConfig,
  reloadMdxFiles,
  updateMdxFiles,
  updateReferenceFiles,
  copyMedia,
  copyComponents,
  copyData,
};
