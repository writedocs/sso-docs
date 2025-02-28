const manageCssDark = require("./styles/darkmode.config");
const manageCodeLanguages = require("./styles/codeLanguages.config");
const manageCss = require("./styles/lightmode.config");
const fs = require("fs");
const path = require("path");

function validateAndFixHexColor(colorValue) {
  if (typeof colorValue !== "string") {
    return colorValue; // Return the original value if it's not a string.
  }

  let color = colorValue.trim();

  // Add '#' at the beginning if missing.
  if (!color.startsWith("#")) {
    color = `#${color}`;
  }

  // Remove all non-hex characters except '#'.
  color = color.replace(/[^#a-fA-F0-9]/g, "");

  // Regex to validate hex color codes (3, 4, 6, or 8 hex digits).
  const hexColorRegex =
    /^#([a-fA-F0-9]{3}|[a-fA-F0-9]{4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;

  if (hexColorRegex.test(color)) {
    return color; // Valid hex color code.
  } else {
    // Attempt to fix common issues.

    let hexDigits = color.slice(1); // Remove '#' for length checking.

    // If the length is not 3, 4, 6, or 8, try to adjust it.
    if ([3, 4, 6, 8].includes(hexDigits.length)) {
      // Length is valid but the characters might be invalid.
      // Return the color as is.
      return color;
    } else if (hexDigits.length < 3) {
      // Pad with zeros to make it 3 digits.
      hexDigits = hexDigits.padEnd(3, "0");
    } else if (hexDigits.length > 3 && hexDigits.length < 6) {
      // Pad with zeros to make it 6 digits.
      hexDigits = hexDigits.padEnd(6, "0");
    } else if (hexDigits.length > 6 && hexDigits.length < 8) {
      // Pad with zeros to make it 8 digits.
      hexDigits = hexDigits.padEnd(8, "0");
    } else if (hexDigits.length > 8) {
      // Trim to the first 8 digits.
      hexDigits = hexDigits.slice(0, 8);
    }

    color = `#${hexDigits}`;

    // Re-validate after attempting to fix.
    if (hexColorRegex.test(color)) {
      return color;
    } else {
      console.warn(
        `Warning: Invalid color value "${colorValue}" could not be fixed.`
      );
      return colorValue; // Return the original value if it cannot be fixed.
    }
  }
}

function fixConfigColors(configFilePath) {
  try {
    // Read and parse the config.json file.
    const configData = fs.readFileSync(configFilePath, "utf-8");
    const config = JSON.parse(configData);

    if (config.styles && typeof config.styles === "object") {
      const styles = config.styles;

      for (const key in styles) {
        // Check if the key is supposed to be a color (e.g., contains 'Color').
        if (/color$/i.test(key)) {
          const originalValue = styles[key];
          const fixedValue = validateAndFixHexColor(originalValue);
          styles[key] = fixedValue;
        }
      }

      // Write the updated config back to the file.
      fs.writeFileSync(
        configFilePath,
        JSON.stringify(config, null, 2),
        "utf-8"
      );
    } else {
      console.warn(
        'No "styles" key found in config.json or it is not an object.'
      );
    }
  } catch (error) {
    console.error(`Error reading or parsing config.json: ${error.message}`);
  }
}

function main() {
  const configFilePath = path.join(__dirname, "../config.json");
  fixConfigColors(configFilePath);
  manageCss();
  manageCssDark();
  manageCodeLanguages();

  console.log("[STYLES] CSS Updated\n");
}

main();
