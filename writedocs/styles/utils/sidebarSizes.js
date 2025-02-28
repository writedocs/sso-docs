const { navbarHeight, sidebarTocPosition, sidebarMarginTop, sidebarPaddingTop } = require(".");

function defineSidebar(navbar, homepage, logoSize) {
  return {
    '--scroll-top-margin': navbarHeight(navbar, homepage),
    '--sidebar-size': sidebarTocPosition(navbar, homepage),
    '--sidebar-margin-top': sidebarMarginTop(navbar, homepage, logoSize),
    '--sidebar-padding-top': sidebarPaddingTop(navbar, homepage)
  }
}

module.exports = {
  defineSidebar
};
