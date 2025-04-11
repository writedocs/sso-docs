const fs = require("fs");
const path = require("path");
const originalApiMerge = require("./api/apiOriginal");
const dashboardApiMerge = require("./api/apiDashboard");

const userPagesDir = path.join(__dirname, "../apiPages");
const planConfig = JSON.parse(fs.readFileSync("./plan.json", "utf8"));

try {
  if (planConfig.dashboardAPIMerge || planConfig.dashboard) {
    dashboardApiMerge(userPagesDir);
  } else {
    originalApiMerge(userPagesDir);
  }
  console.log("[API Generation] API documentation merge and move completed");
} catch (error) {
  console.error(`Error merging API documentation: ${error.message}`);
  process.exit(1);
}
