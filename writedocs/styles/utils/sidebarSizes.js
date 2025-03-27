const { navbarHeight, sidebarTocPosition, sidebarMarginTop, sidebarPaddingTop } = require(".");

function defineSidebar(navbar, homepage, logoSize, changelog, release) {
  return {
    "--scroll-top-margin": navbarHeight(navbar, homepage, changelog, release),
    "--sidebar-size": sidebarTocPosition(navbar, homepage),
    "--sidebar-margin-top": sidebarMarginTop(navbar, homepage, logoSize, changelog, release),
    "--sidebar-padding-top": sidebarPaddingTop(navbar, homepage, changelog, release),
  };
}

module.exports = {
  defineSidebar,
};
