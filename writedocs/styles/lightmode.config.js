const fs = require("fs");
const path = require("path");
const { adjustLightness } = require("./utils/color");
const { getTextColor } = require("./utils");
const {
  definePrimaryColors,
  defineNavbarColors,
  defineIcons,
  defineNavbarItems,
  defineNavbarDropdownColors,
} = require("./utils/cssVariables");
const { defineSidebar } = require("./utils/sidebarSizes");
const { defineBackground } = require("./utils/images");

function defineFixedValues(mainColor) {
  return {
    "--fixed-main-color": mainColor,
    "--fixed-main-hover-color": adjustLightness(mainColor, -0.2),
  };
}

function editCSS(cssContent, config) {
  const { styles, navbar, homepage, images } = config;
  const { mainColor, navbarColor, pagination, logoSize } = styles;
  const navbarFinalColor = navbarColor ? navbarColor : mainColor;
  const searchbarBorderColor = "#dadde1";

  const luminance = getTextColor(navbarFinalColor);
  const isDark = luminance === "#000000";

  const isMainEqualNavbarColor = mainColor === navbarColor;

  const variations = {
    ...definePrimaryColors(mainColor),
    ...defineNavbarColors(mainColor, navbarFinalColor),
    ...defineIcons(isDark),
    ...defineNavbarItems(
      mainColor,
      isDark,
      luminance,
      logoSize,
      isMainEqualNavbarColor
    ),
    ...defineSidebar(navbar, homepage, logoSize),
    ...defineFixedValues(mainColor),
    ...defineBackground(images),
    ...defineNavbarDropdownColors(mainColor, navbarFinalColor, isDark),
    "--fixed-main-hover-color": adjustLightness(mainColor, -0.2),
    "--pagination-display": pagination ? "flex" : "none",
    "--searchbar-border-color": searchbarBorderColor,
    "--bg-defined-text-color": getTextColor(mainColor),
  };

  let updatedCSS = cssContent;

  for (const [variable, value] of Object.entries(variations)) {
    const regex = new RegExp(`${variable}:\\s*(url\\(.*?\\)|[^;]+);`, "g");
    updatedCSS = updatedCSS.replace(regex, `${variable}: ${value};`);
  }

  return updatedCSS;
}

const manageCss = () => {
  const configFilePath = path.join(__dirname, "../../config.json");
  const cssFilePath = path.join(__dirname, "../../src/css/custom.css");

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

      const updatedCSS = editCSS(data, config);

      fs.writeFile(cssFilePath, updatedCSS, "utf8", (err) => {
        if (err) {
          console.error("Error writing the CSS file:", err);
        }
      });
    });
  });
};

if (require.main === module) {
  manageCss();
}

module.exports = manageCss;
