const fs = require('fs');
const path = require('path');

function getJson(file) {
  const configJsonPath = path.join(__dirname, file);
  const data = fs.readFileSync(configJsonPath, 'utf8');
  return JSON.parse(data);
}

const configurations = getJson('../../config.json');
const plan = getJson('../../plan.json');

function writeJsonToFile(content, newFile) {
  const filePath = path.join(__dirname, newFile);
  const fileContent = `module.exports = ${JSON.stringify(content, null, 2)};`;

  fs.writeFileSync(filePath, fileContent, 'utf8');
}

writeJsonToFile(configurations, 'configurations.js');
writeJsonToFile(plan, 'plan.js');
