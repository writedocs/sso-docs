#!/usr/bin/env node

const yaml = require("js-yaml");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const util = require("util");
const { generateTranslationBoilerplate } = require("./translations");
const {
  resetApi,
  copyReference,
  clearCurrentDocsReference,
} = require("./reference");
const logColors = require("./utils/logColors");
const {
  checkAndCopyConfig,
  reloadMdxFiles,
  updateMdxFiles,
  copyMedia,
  copyComponents,
  copyData,
} = require("./update");
const { startProject } = require("./start");
const pkg = require("../package.json");
const semver = require("semver");
const fetch = require("npm-registry-fetch");
const { checkLinks } = require("./links");
const VARIABLES = require("./utils/variables");
const { getJson } = require("./utils/jsonHandler");
const generateSidebars = require("./generate-sidebars");
const promptUser = require("./utils/promptUser");
const print = require("./utils/print");
const { sanitizeFileName } = require("./utils/fileNameSanitizer");
// const { startFileWatcher } = require("./utils/fileWatcher");

const execAsync = util.promisify(exec);

const args = process.argv.slice(2);

const command = args[0];
const projectRoot = process.cwd();
const referenceDestPath = path.join(projectRoot, "docs/reference");
const referenceSourcePath = path.join(__dirname, "../docs/reference");

const updateDocProject = async () => {
  const configData = getJson("config.json");

  try {
    checkAndCopyConfig();
    reloadMdxFiles("docs", "../docs");
    updateMdxFiles("../docs");
    if (configData.changelog) {
      reloadMdxFiles("changelog", "../changelog");
      updateMdxFiles("../changelog");
    }
    copyReference(projectRoot);
    // updateReferenceFiles();
    copyMedia();
    copyData();
    copyComponents();
    return true;
  } catch (error) {
    print.error(error.message);
  }
};

const startWritedocs = async () => {
  console.log("");
  const ora = (await import("ora")).default;
  const spinner = ora("Starting...").start();
  const config = getJson("config.json");

  try {
    await execAsync("npx docusaurus clear", {
      cwd: path.join(__dirname, ".."),
    });

    if (
      config.apiFiles &&
      Array.isArray(config.apiFiles) &&
      config.apiFiles.length > 0
    ) {
      const { uniqueErrors } = await resetApi(spinner);
      if (uniqueErrors) {
        spinner.fail(
          print.red +
            `[OAS_FILE_ERROR] Error generating API Files:\n${uniqueErrors}` +
            print.reset
        );
        process.exit(1);
      }
    }

    await execAsync("npm run precli", { cwd: path.join(__dirname, "..") });

    startProject(spinner);
  } catch (err) {
    spinner.fail(
      print.red + `Error starting WriteDocs: ${err.message}` + print.reset
    );
    process.exit(1);
  }
};

// const runApi = async () => {
//   const ora = (await import('ora')).default;
//   const spinner = ora('Generating API pages...').start();
//   try {
//     clearCurrentDocsReference();
//     checkAndCopyConfig();
//     copyReference(projectRoot);
//     const {uniqueErrors} = await resetApi(spinner);
//     validateAndProcessFiles(referenceSourcePath, referenceDestPath);

//     if (uniqueErrors) {
//       spinner.fail(
//           print.red +
//             `[OAS_FILE_ERROR] Error generating API Files:\n${uniqueErrors}` +
//             print.reset
//         );
//       process.exit(1);
//     }
//     spinner.succeed(print.green + `API pages have been successfully created in the /docs/reference folder.` + print.reset);
//   } catch (error) {
//     spinner.fail(print.red + `Error generating API Files: ${error.message}` + print.reset);
//     process.exit(1);
//   }
// };

const runApi = async () => {
  const ora = (await import("ora")).default;
  const spinner = ora("Generating API pages...").start();
  try {
    const configData = getJson("config.json");
    const apiFiles = configData.apiFiles || [];

    if (!apiFiles.length) {
      spinner.fail(
        print.red + "No API files specified in config.json" + print.reset
      );
      process.exit(1);
    }

    clearCurrentDocsReference();

    for (const apiFile of apiFiles) {
      const apiPath = path.join(projectRoot, "openAPI", apiFile);
      try {
        const fileContent = fs.readFileSync(apiPath, "utf8");
        const apiContent = apiPath.endsWith(".json")
          ? JSON.parse(fileContent)
          : yaml.load(fileContent);

        // Create subfolder name from the API file name without extension
        const folderName = path.basename(apiFile, path.extname(apiFile));
        const referenceSubFolder = path.join(referenceDestPath, folderName);

        // Create the subfolder
        await fs.promises.mkdir(referenceSubFolder, { recursive: true });

        const paths = apiContent.paths;

        for (const [pathUrl, pathMethods] of Object.entries(paths)) {
          for (const [method, endpoint] of Object.entries(pathMethods)) {
            const fileName =
              endpoint.operationId ||
              endpoint.summary ||
              `${method}-${pathUrl.replace(/\//g, "-")}`;
            const sanitizedFileName = sanitizeFileName(fileName);
            const description =
              endpoint.description || `{/* You can add a description here */}`;
            // Create minimal MDX content with just the route metadata
            const mdxContent = `---
route: ${method.toUpperCase()} ${pathUrl}
---

{/* Don't change the file name or the metadata in this file */}
${description}
`;

            // Write MDX file to the subfolder
            const outputPath = path.join(
              referenceSubFolder,
              `${sanitizedFileName}.endpoint.mdx`
            );
            await fs.promises.writeFile(outputPath, mdxContent, "utf8");
          }
        }
      } catch (error) {
        spinner.warn(
          print.yellow +
            `Error processing ${apiFile}: ${error.message}` +
            print.reset
        );
        continue;
      }
    }

    spinner.succeed(
      print.green +
        `API pages have been successfully created in the /docs/reference folder.` +
        print.reset
    );
  } catch (error) {
    spinner.fail(
      print.red + `Error generating API Files: ${error.message}` + print.reset
    );
    process.exit(1);
  }
};

const generateTranslationsJson = async () => {
  const ora = (await import("ora")).default;
  const spinner = ora("Generating translation.json file...").start();
  try {
    checkAndCopyConfig();
    generateTranslationBoilerplate();

    spinner.succeed(
      print.green + `translations.json file created!` + print.reset
    );
  } catch (error) {
    if (error.message === "Main language only") {
      spinner.warn(
        print.yellow +
          "Only main language added to config.json. Add more languages to your project's configuration." +
          print.reset
      );
    } else {
      spinner.fail(
        print.red +
          `Error generating translation.json file: ${error.message}` +
          print.reset
      );
    }
  }
};

// Function to run the Docusaurus build command and check for broken links in the log output
const checkLinksDuringBuild = async () => {
  console.log("");
  const ora = (await import("ora")).default;
  const spinner = ora("Searching for broken links...").start();

  try {
    await execAsync("npx docusaurus clear", {
      cwd: path.join(__dirname, ".."),
    });
    await execAsync("npm run precli", { cwd: path.join(__dirname, "..") });

    checkLinks(spinner);
  } catch (err) {
    spinner.fail(
      print.red + `Error checking broken links: ${err.message}` + print.reset
    );
    process.exit(1);
  }
};

const runSidebars = async () => {
  const ora = (await import("ora")).default;
  let spinner;

  try {
    const answer = await promptUser(
      "This will overwrite the current sidebars structure in your config.json.\n Do you want to proceed? (Y/n): "
    );
    const proceed = answer.trim().toLowerCase();

    if (proceed !== "" && proceed !== "y" && proceed !== "yes") {
      print.error("Operation cancelled");
      process.exit(0);
    }

    spinner = ora("Generating Sidebars...").start();

    await generateSidebars(projectRoot);

    spinner.succeed(
      print.green +
        `Sidebars have been generated and saved to config.json` +
        print.reset
    );
  } catch (error) {
    if (spinner) {
      spinner.fail(print.red + `Error generating Sidebars` + print.reset);
    } else {
      console.error(print.red + `Error generating Sidebars` + print.reset);
    }
    process.exit(1);
  }
};

const helpMessage = () => {
  console.log(`WriteDocs v${pkg.version}\n`);
  console.log("USAGE: writedocs [cmd]");
  console.log("Available commands:");
  console.log("  dev", "- Starts the WriteDocs development preview.");
  console.log("  api", "- Creates API pages from your OpenAPI Specifications.");
  console.log(
    "  sidebars",
    "- Generates the sidebars structure in your config.json file based on the docs folder structure."
  );
  console.log(
    "  translate",
    "- Generates translations.json file for mapping your translations."
  );
  console.log("  links", "- Checks the documentation for broken links.");
  console.log("  help", "- Shows help message.\n");
};

const globalCheck = () => {
  const isGlobal = path.dirname(require.main.filename) !== path.resolve(".");
  if (!isGlobal) {
    print.error(
      "[ALERT] This package is intended to be installed globally.\n Please run `npm install -g writedocs`."
    );
    process.exit(1);
  }
};

const versionCheck = (package) => {
  const latestVersion = package["dist-tags"].latest;
  if (semver.gt(latestVersion, pkg.version)) {
    console.log("\n");
    print.alert(
      `Update available: ${pkg.version} → ${latestVersion}\nRun "npm install -g ${pkg.name}" to update.\n`
    );
    if (semver.lt(pkg.version, VARIABLES.functionalVersion)) {
      spinner.warn(
        print.yellow +
          `Your version (${pkg.version}) is deprecated and will not function properly.` +
          print.reset
      );
      process.exit(1);
    }
  }
};

const main = async () => {
  try {
    const package = await fetch.json(`/${pkg.name}`);
    globalCheck();
    versionCheck(package);

    switch (command) {
      case "dev":
        const updates = await updateDocProject();
        if (updates) {
          await startWritedocs();
        }
        break;
      case "api":
        await runApi();
        break;
      case "translate":
        generateTranslationsJson();
        break;
      case "links":
        const updateDocs = await updateDocProject();
        if (updateDocs) {
          await checkLinksDuringBuild();
        }
        break;
      case "sidebars":
        await runSidebars();
        break;
      case "help":
        helpMessage();
        process.exit(1);
      case "-v":
      case "--version":
        console.log(`v${pkg.version}`);
        process.exit(0);
      default:
        console.log("ERROR: Unknown command!\n");
        helpMessage();
        process.exit(1);
    }
  } catch (error) {
    // Handle errors silently
  }
};

main();
