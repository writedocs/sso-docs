const { BLACKS, WHITES, navbarBreakpoint, defaultNavbarMode } = require("../../variables");
const { getLuminance } = require("./color");

function getTextColor(backgroundColor) {
  const luminance = getLuminance(backgroundColor);
  if (WHITES.includes(backgroundColor)) return "#000000";
  if (BLACKS.includes(backgroundColor)) return "#FFFFFF";
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

function navbarTotalItems(navbar, homepage, changelog = false, release = false) {
  let isHome = 0;
  const hasChangelog = changelog ? 1 : 0;
  const hasRelease = release ? 1 : 0;
  if (homepage.endsWith(".html")) {
    isHome = 1;
  }
  return navbar.length + isHome + hasRelease + hasChangelog;
}

function navbarHeight(navbar, homepage, changelog, release) {
  const totalItems = navbarTotalItems(navbar, homepage, changelog, release);
  return totalItems <= 1 ? "100px" : "130px";
}

function sidebarTocPosition(navbar, homepage) {
  return navbarTotalItems(navbar, homepage) < navbarBreakpoint ? "85px" : "108px";
}

function sidebarPaddingTop(navbar, homepage, changelog, release) {
  const totalItems = navbarTotalItems(navbar, homepage, changelog, release);
  if (totalItems <= 1) return "72px";
  return "92px";
}

function sidebarMarginTop(navbar, homepage, logoSize, changelog, release) {
  const totalItems = navbarTotalItems(navbar, homepage, changelog, release);
  switch (logoSize) {
    case "large":
      return totalItems <= 1 ? "35px" : "37px";
    case "medium":
      return totalItems <= 1 ? "35px" : "35px";
    default:
      return totalItems <= 1 ? "36px" : "35px";
  }
}

module.exports = {
  getTextColor,
  navbarTotalItems,
  navbarHeight,
  sidebarTocPosition,
  sidebarPaddingTop,
  sidebarMarginTop,
};
