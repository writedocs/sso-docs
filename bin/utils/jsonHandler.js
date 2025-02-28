const fs = require('fs');
const path = require('path');

// Function to read and parse JSON from a file
function getJson(filePath) {
  const projectRoot = process.cwd();
  const configFilePath = path.join(projectRoot, filePath);

  try {
    const data = fs.readFileSync(configFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Error reading config.json:`, err);
  }
}

module.exports = {
  getJson
};

