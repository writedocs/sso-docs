const { BLACKS, WHITES, navbarBreakpoint, defaultNavbarMode } = require('../../variables');
const { getLuminance } = require('./color');


function getTextColor(backgroundColor) {
  const luminance = getLuminance(backgroundColor);
  if (WHITES.includes(backgroundColor)) return '#000000';
  if (BLACKS.includes(backgroundColor)) return '#FFFFFF';
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

function navbarTotalItems(navbar, homepage) {
  let isHome = 0;
  if (homepage.endsWith('.html')) {
    isHome = 1;
  }
  return navbar.length + isHome;
}

function navbarHeight(navbar, homepage) {
  const totalItems = navbarTotalItems(navbar, homepage);
  return totalItems <= 1 ? "100px" : "130px";
}

function sidebarTocPosition(navbar, homepage) {
  return navbarTotalItems(navbar, homepage) < navbarBreakpoint ? '85px' : '108px';
}

function sidebarPaddingTop(navbar, homepage) {
  const totalItems = navbarTotalItems(navbar, homepage);
  if (totalItems <= 1) return '72px';
  return "92px";
}

function sidebarMarginTop(navbar, homepage, logoSize) {
  const totalItems = navbarTotalItems(navbar, homepage);
  switch (logoSize) {
    case 'large':
      return totalItems <= 1 ? '35px' : '37px';
    case 'medium':
      return totalItems <= 1 ? '35px' : '35px';
    default:
      return totalItems <= 1 ? '36px' : '35px';
  }
}

module.exports = {
  getTextColor,
  navbarTotalItems,
  navbarHeight,
  sidebarTocPosition,
  sidebarPaddingTop,
  sidebarMarginTop,
}