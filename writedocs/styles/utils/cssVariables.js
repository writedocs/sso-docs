const { getTextColor } = require(".");
const { LOGO_SIZES, BLACKS, WHITES } = require("../../variables");
const { adjustLightness, addTransparency } = require("./color");

function definePrimaryColors(mainColor) {
  return {
    "--ifm-color-primary": mainColor,
    "--ifm-color-primary-dark": adjustLightness(mainColor, -0.2),
    "--ifm-color-primary-darker": adjustLightness(mainColor, -0.3),
    "--ifm-color-primary-darkest": adjustLightness(mainColor, -0.4),
    "--ifm-color-primary-light": adjustLightness(mainColor, 0.2),
    "--ifm-color-primary-lighter": adjustLightness(mainColor, 0.3),
    "--ifm-color-primary-lightest": adjustLightness(mainColor, 0.4),
    "--transparent-main-color": addTransparency(mainColor, 0.08),
    "--transparent-second-color": addTransparency(mainColor, 0.05),
  };
}

function defineNavbarColors(
  mainColor,
  navbarFinalColor,
  borderColor = "#ffffff33"
) {
  let navbarLight = adjustLightness(navbarFinalColor, 0.2);
  let navbarDark = adjustLightness(navbarFinalColor, -0.2);
  let navbarBorderColor = borderColor;

  if (WHITES.includes(navbarFinalColor)) {
    navbarLight = addTransparency(mainColor, 0.15);
    navbarDark = addTransparency(mainColor, 0.3);
    navbarBorderColor = "#9c9c9c";
  }

  if (BLACKS.includes(navbarFinalColor)) {
    navbarLight = addTransparency(mainColor, 0.15);
    navbarDark = addTransparency(mainColor, 0.3);
  }

  return {
    "--navbar-color": navbarFinalColor,
    "--navbar-color-light": navbarLight,
    "--navbar-color-dark": navbarDark,
    "--navbar-link-border-hover-color": navbarBorderColor,
  };
}

function defineNavbarDropdownColors(mainColor, navbarFinalColor, isDark) {
  if (mainColor === navbarFinalColor) {
    return {
      "--navbar-dropdown-active-bg": isDark ? "#ffffff32" : "#00000032",
      "--navbar-dropdown-hover-bg": isDark ? "#ffffff16" : "#00000016",
      "--navbar-dropdown-hover-border-color": isDark ? "#fff" : "#000",
    };
  }
  return {
    "--navbar-dropdown-active-bg": "var(--primary-color)",
    "--navbar-dropdown-hover-bg": "var(--transparent-main-color)",
    "--navbar-dropdown-hover-border-color": "var(--primary-color)",
  };
}

function defineIcons(isDark) {
  return {
    "--guides-icon": isDark
      ? "var(--guidesIconDark)"
      : "var(--guidesIconLight)",
    "--home-icon": isDark ? "var(--homeIconDark)" : "var(--homeIconLight)",
    "--api-icon": isDark ? "var(--apiIconDark)" : "var(--apiIconLight)",
    "--changelog-icon": isDark
      ? "var(--changelogIconDark)"
      : "var(--changelogIconLight)",
  };
}

function defineNavbarItems(
  mainColor,
  isDark,
  luminance,
  logoSize = null,
  isMainEqualNavbarColor
) {
  const transparencyToMainColor = isDark
    ? adjustLightness(mainColor, 0.2)
    : adjustLightness(mainColor, -0.2);

  return {
    "--navbar-logo-height": logoSize ? LOGO_SIZES[logoSize] : LOGO_SIZES.small,
    "--navbar-font-color": luminance,
    "--navbar-item-background-color": isMainEqualNavbarColor
      ? transparencyToMainColor
      : mainColor,
    "--navbar-item-border-color": isMainEqualNavbarColor
      ? transparencyToMainColor
      : mainColor,
    "--navbar-item-font-color": isDark ? BLACKS[0] : WHITES[0],
    "--navbar-link-hover": isDark
      ? addTransparency(BLACKS[0], 0)
      : addTransparency(WHITES[0], 0),
    "--navbar-link-active": isDark
      ? addTransparency(BLACKS[0], 0.1)
      : addTransparency(WHITES[0], 0.1),
    "--navbar-active-text-color": getTextColor(mainColor),
  };
}

module.exports = {
  definePrimaryColors,
  defineNavbarColors,
  defineIcons,
  defineNavbarItems,
  defineNavbarDropdownColors,
};
