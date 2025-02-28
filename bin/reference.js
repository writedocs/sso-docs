const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const util = require("util");
const print = require("./utils/print");

const execAsync = util.promisify(spawn);

const clearCurrentDocsReference = () => {
  const destDocsPath = path.join(__dirname, "../docs/reference");

  try {
    fse.emptyDirSync(destDocsPath);
  } catch (err) {
    print.error(`Internal error clearing docs/reference folder`);
    process.exit(1);
  }
};

const copyReference = (projectRoot) => {
  const sourceReferencePath = path.join(projectRoot, "openAPI");
  const sourceReferencePath2 = path.join(projectRoot, "reference");
  const destReferencePath = path.join(__dirname, "../openAPI");

  const isOpenApiFolder = fs.existsSync(sourceReferencePath);
  const isRefFolder = fs.existsSync(sourceReferencePath2);

  if (!isOpenApiFolder && !isRefFolder) {
    // print.error("openAPI or Reference folder not found in the current directory.");
    return;
  }

  try {
    fse.removeSync(destReferencePath);

    if (isOpenApiFolder) {
      fse.copySync(sourceReferencePath, destReferencePath);
    } else if (isRefFolder) {
      fse.copySync(sourceReferencePath2, destReferencePath);
    }
  } catch (err) {
    // print.error(`Error copying openAPI folder: ${err.message}`);
    return;
  }
};

const removeImportStatements = (fileContent) => {
  return fileContent.replace(/import\s+.*?;[\r\n]*/g, "");
};

const processReferenceFiles = (sourceDir, destDir) => {
  const items = fs.readdirSync(sourceDir);

  items.forEach((item) => {
    const itemPath = path.join(sourceDir, item);
    const destItemPath = path.join(destDir, item);

    if (fs.lstatSync(itemPath).isDirectory()) {
      if (!fs.existsSync(destItemPath)) {
        fs.mkdirSync(destItemPath);
      }
      processReferenceFiles(itemPath, destItemPath);
    } else if (path.extname(item) === ".mdx" && !item.endsWith(".info.mdx")) {
      let fileContent = fs.readFileSync(itemPath, "utf-8");
      fileContent = removeImportStatements(fileContent);
      fs.writeFileSync(destItemPath, fileContent, "utf-8");
    }
  });
};

const validateAndProcessFiles = (referenceSourcePath, referenceDestPath) => {
  if (!fs.existsSync(referenceDestPath)) {
    fs.mkdirSync(referenceDestPath, { recursive: true });
  }
  processReferenceFiles(referenceSourcePath, referenceDestPath);
};

const resetApi = async (spinner) => {
  // await execAsync("npm run reset-api", { cwd: path.join(__dirname, "..") });

  return new Promise((resolve, reject) => {
    const npmPath = process.platform === "win32" ? "npm.cmd" : "npm";
    const env = { ...process.env };

    // Start the process
    const startupProcess = spawn(npmPath, ["run", "reset-api"], {
      cwd: path.join(__dirname, ".."),
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";
    let stderrBuffer = "";
    const errorMessages = new Set();

    // Capture standard output
    startupProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Capture standard error
    startupProcess.stderr.on("data", (data) => {
      stderrBuffer += data.toString();

      // Split the buffer into lines
      const lines = stderrBuffer.split(/\r?\n/);
      stderrBuffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        errorOutput += `${line}\n`;

        // Extract error messages after 'Error:'
        const errorRegex = /Error:(.*)/g;
        let match;
        while ((match = errorRegex.exec(line)) !== null) {
          const errorMessage = match[1].trim();
          errorMessages.add(errorMessage);
        }
      }
    });

    // Handle process exit
    startupProcess.on("close", (code) => {
      // Process any remaining data in stderrBuffer
      if (stderrBuffer.length > 0) {
        errorOutput += `${stderrBuffer}\n`;
        const errorRegex = /Error:(.*)/g;
        let match;
        while ((match = errorRegex.exec(stderrBuffer)) !== null) {
          const errorMessage = match[1].trim();
          errorMessages.add(errorMessage);
        }
      }

      if (errorMessages.size > 0) {
        let uniqueErrors = "";
        errorMessages.forEach((msg) => {
          if (msg === "Operation must have summary or operationId defined") {
            uniqueErrors += `- All endpoint paths must have summary or operationId defined.\n`;
          } else if (
            msg.startsWith("Docusaurus could not load module at path")
          ) {
            uniqueErrors += `- Could not load your config.json file. Validate it for possible errors. \n`;
          } else {
            uniqueErrors += `- ${msg}\n`;
          }
        });

        // spinner.fail(
        //   logColors.red +
        //     `[OAS_FILE_ERROR] Error generating API Files:\n${uniqueErrors}` +
        //     logColors.reset
        // );
        resolve({ uniqueErrors });
      } else {
        resolve({ output });
      }
    });

    // Handle process errors
    startupProcess.on("error", (err) => {
      spinner.fail(
        print.red +
          `[OAS_FILE_ERROR] Failed to start the process:\n${err.message}` +
          print.reset
      );
    });
  });
};

module.exports = {
  clearCurrentDocsReference,
  copyReference,
  processReferenceFiles,
  resetApi,
  validateAndProcessFiles,
};
