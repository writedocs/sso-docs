const fs = require('fs');
const path = require('path');

// Function to read and parse JSON from a file
function getJson(file) {
  const configJsonPath = path.join(__dirname, file);
  const data = fs.readFileSync(configJsonPath, 'utf8');
  return JSON.parse(data);
}

// Function to create a directory if it doesn't exist
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to generate navbar translations
function createNavbarTranslations(langData) {
  const navbarData = {};

  const navbar = langData.navbar || {};
  for (const key in navbar) {
    const value = navbar[key];
    navbarData[`item.label.${key}`] = {
      "message": value,
      "description": `Navbar item with label ${key}`
    };
  }

  return navbarData;
}

// Function to generate current translations
function createCurrentTranslations(langData) {
  const currentData = {
    "version.label": {
      "message": "Next",
      "description": "The label for version current"
    }
  };

  const sidebars = langData.sidebars || {};
  for (const sidebarName in sidebars) {
    const categories = sidebars[sidebarName];
    for (const key in categories) {
      const value = categories[key];
      currentData[`sidebar.${sidebarName}.category.${key}`] = {
        "message": value,
        "description": `The label for category ${key} in sidebar ${sidebarName}`
      };
    }
  }

  return currentData;
}

// Function to write JSON data to a file, ensuring the file and its directories exist
function writeJsonFile(filePath, data) {
  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the JSON data to the file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Function to process translations for a single language
function processLanguage(lang, data) {
  const langData = data[lang];

  // Create directory for the language inside 'i18n' folder
  const langDir = path.join('i18n', lang);
  createDirectoryIfNotExists(langDir);

  // Generate and write navbar.json
  const navbarData = createNavbarTranslations(langData);
  writeJsonFile(path.join(langDir, 'docusaurus-theme-classic/navbar.json'), navbarData);

  // Generate and write current.json
  const currentData = createCurrentTranslations(langData);
  writeJsonFile(path.join(langDir, 'docusaurus-plugin-content-docs/current.json'), currentData);
}

// Main function to orchestrate the processing
function main() {
  const translationFilePath = 'translations.json';

  let data;
  try {
    data = getJson(translationFilePath);
  } catch (err) {
    console.error(`Error reading or parsing ${translationFilePath}:`, err);
    process.exit(1);
  }

  if (data) {
    // Process each language in the translations
    for (const lang in data) {
      processLanguage(lang, data);
    }
  }
}

// Execute the main function
main();
