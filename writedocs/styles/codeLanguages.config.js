const fs = require("fs");
const path = require("path");

function editLanguages(cssContent, config) {
  const { codeLanguages } = config;

  const languageSelectors = [
    "c",
    "csharp",
    "curl",
    "dart",
    "go",
    "http",
    "java",
    "javascript",
    "kotlin",
    "nodejs",
    "ocaml",
    "php",
    "powershell",
    "python",
    "r",
    "ruby",
    "rust",
    "shell",
    "swift",
  ];

  let updatedCSS = cssContent;

  languageSelectors.forEach((lang) => {
    const displayValue =
      !codeLanguages ||
      codeLanguages.length === 0 ||
      codeLanguages.includes(lang)
        ? "flex"
        : "none";

    const regex = new RegExp(`--${lang}:\\s*[^;]+;`, "g");
    updatedCSS = updatedCSS.replace(regex, `--${lang}: ${displayValue};`);
  });

  return updatedCSS;
}

const manageCodeLanguages = () => {
  const configFilePath = path.join(__dirname, "../../config.json");
  const cssFilePath = path.join(__dirname, "../../src/css/codeLanguages.css");

  fs.readFile(configFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the config file:", err);
      return;
    }

    const config = JSON.parse(data);

    fs.readFile(cssFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the CSS file:", err);
        return;
      }

      const updatedCSS = editLanguages(data, config);

      fs.writeFile(cssFilePath, updatedCSS, "utf8", (err) => {
        if (err) {
          console.error("Error writing the CSS file:", err);
        }
      });
    });
  });
};

if (require.main === module) {
  manageCodeLanguages();
}

module.exports = manageCodeLanguages;
