const { exec } = require("child_process");
const util = require("util");
const fs = require("fs");

const execAsync = util.promisify(exec);

try {
  const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

  if (
    config.apiFiles &&
    Array.isArray(config.apiFiles) &&
    config.apiFiles.length > 0
  ) {
    execAsync("npm run reset-api", { stdio: "inherit" });
    execAsync("node ./writedocs/api.merge.config.js", { stdio: "inherit" });
  }
  execAsync("node plan.config.js", { stdio: "inherit" });
  execAsync("node home.config.js", { stdio: "inherit" });
  execAsync("node ./writedocs/styles.config.js", { stdio: "inherit" });
  execAsync("node ./src/utils/parseConfig.js", { stdio: "inherit" });
  execAsync("node sidebar.config.js", { stdio: "inherit" });
  execAsync("node transpiler.config.js", { stdio: "inherit" });
  console.log("Prebuild steps completed successfully.");
} catch (error) {
  console.error("Error during precli steps:", error);
  process.exit(1);
}
