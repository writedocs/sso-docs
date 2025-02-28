const fs = require("fs");
const path = require("path");
const { getTextColor } = require("./utils");
const {
  definePrimaryColors,
  defineIcons,
  defineNavbarColors,
  defineNavbarItems,
} = require("./utils/cssVariables");
const { defineBackgroundDark } = require("./utils/images");

function editCSSDark(cssContent, styles, images) {
  const {
    mainColor,
    navbarColor,
    darkModeMainColor,
    navbarDarkModeColor,
    backgroundDarkModeColor,
  } = styles;
  const navbarFinalColor = navbarColor ? navbarColor : mainColor;
  const mainDarkColor = darkModeMainColor ? darkModeMainColor : mainColor;
  const navbarDarkColor = navbarDarkModeColor
    ? navbarDarkModeColor
    : navbarFinalColor;
  const navbarBorderColor = "#9c9c9c";

  const luminance = getTextColor(navbarDarkColor);
  const isDark = luminance === "#000000";

  const variations = {
    ...definePrimaryColors(mainDarkColor),
    ...defineNavbarColors(mainDarkColor, navbarDarkColor, navbarBorderColor),
    ...defineIcons(isDark),
    ...defineNavbarItems(mainDarkColor, isDark, luminance),
    ...defineBackgroundDark(images),
    "--bg-defined-text-color": getTextColor(mainDarkColor),
    ...(backgroundDarkModeColor && {
      "--ifm-background-color": `${backgroundDarkModeColor} !important`,
    }),
  };

  let updatedCSS = cssContent;

  for (const [variable, value] of Object.entries(variations)) {
    const regex = new RegExp(`${variable}:\\s*[^;]+;`, "g");
    updatedCSS = updatedCSS.replace(regex, `${variable}: ${value};`);
  }

  return updatedCSS;
}

const manageCssDark = () => {
  const configFilePath = path.join(__dirname, "../../config.json");
  const cssFilePath = path.join(__dirname, "../../src/css/customDark.css");

  fs.readFile(configFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the config file:", err);
      return;
    }

    const config = JSON.parse(data);
    const { styles, images } = config;

    fs.readFile(cssFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the CSS file:", err);
        return;
      }

      const updatedCSS = editCSSDark(data, styles, images);

      fs.writeFile(cssFilePath, updatedCSS, "utf8", (err) => {
        if (err) {
          console.error("Error writing the CSS file:", err);
        }
      });
    });
  });
};

if (require.main === module) {
  manageCssDark();
}

module.exports = manageCssDark;
