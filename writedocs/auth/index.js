const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../config.json");
const headersPath = path.join(__dirname, "../../static/_headers");

const basicAuth = process.env.BASIC_AUTH;

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const protectedField = config.protected;

let routes = [];

if (protectedField === true) {
  routes = ["/*"];
} else if (Array.isArray(protectedField) && protectedField.length > 0) {
  routes = protectedField;
} else {
  console.error("❌ `protected` must be true or a non-empty array in config.json.");
  process.exit(1);
}

let headers = "";

for (const route of routes) {
  headers += `${route}\n  Basic-Auth: ${basicAuth}\n\n`;
}

fs.writeFileSync(headersPath, headers.trim());
console.log("[PROTECTED_ROUTES] _headers file generated with protected routes and Basic Auth.");
