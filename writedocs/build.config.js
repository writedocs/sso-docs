const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

try {
  const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

  if (config.apiFiles && Array.isArray(config.apiFiles) && config.apiFiles.length > 0) {
    execSync("npm run reset-api", { stdio: "inherit" });
    execSync("node ./writedocs/api.merge.config.js", { stdio: "inherit" });
  }

  if (!config.protected) {
    const headersPath = path.join(__dirname, "../static/_headers");
    if (fs.existsSync(headersPath)) {
      fs.unlinkSync(headersPath);
      console.log("[UNPROTECT] Removed _headers file (protected: false)");
    }
  }

  if (process.env.BASIC_AUTH && config.protected) {
    execSync("node ./writedocs/auth/index.js", { stdio: "inherit" });
  }

  execSync("node plan.config.js", { stdio: "inherit" });
  execSync("node translate.config.js", { stdio: "inherit" });
  execSync("node ./writedocs/styles.config.js", { stdio: "inherit" });
  execSync("node ./src/utils/parseConfig.js", { stdio: "inherit" });
  execSync("node sidebar.config.js", { stdio: "inherit" });
  execSync("node home.config.js", { stdio: "inherit" });
  execSync("node ./writedocs/root.config.js", { stdio: "inherit" });
  console.log("[BUILD] Prebuild completed successfully.");
} catch (error) {
  console.error("Error during prebuild steps:", error);
  process.exit(1);
}
