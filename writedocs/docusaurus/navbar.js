function getFirstPage(page) {
  if (!page) return null; // base case for falsy values

  // If page is already a string, return it.
  if (typeof page === "string") {
    return page;
  }

  // If page is an object...
  if (typeof page === "object") {
    // If it has a "page" property, recursively process that.
    if (page.page) {
      const result = getFirstPage(page.page);
      if (result) return result;
    }

    // If it has a "subpages" array, iterate over its elements.
    if (Array.isArray(page.subpages) && page.subpages.length > 0) {
      for (let sub of page.subpages) {
        const result = getFirstPage(sub);
        if (result) return result;
      }
    }
  }

  // If none of the conditions above yield a string, return null.
  return null;
}

function getFirstPageFromJson(sectionName) {
  try {
    const jsonData = configurations.sidebars;

    const section = jsonData.find(({ sidebarRef }) => sidebarRef === sectionName);

    if (section) {
      const firstCategory = section.categories[0];

      if (firstCategory) {
        const firstPage = firstCategory.pages[0];
        return getFirstPage(firstPage);
      }
    }
    return null;
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error);
    return null;
  }
}

function createNavigationArray(configurations, planConfig) {
  const { navbar, externalLinks, languages } = configurations;
  const { plan } = planConfig;

  const navigationArray = [];

  const navbarWithIcons = ["guides", "api reference", "changelog"];
  const navbarNames = navbar.map((item) => item.label.toLowerCase());

  const allItemsIncluded = navbarNames.every((name) => navbarWithIcons.includes(name));

  navigationArray.push({
    to: "/",
    label: "Home",
    position: "left",
    className: `home_btn ${!configurations.homepage.endsWith(".html") && "hide_home_btn"}`,
  });

  if (plan === "free") {
    navigationArray.push({
      type: "docSidebar",
      position: "left",
      sidebarId: "apiReference",
      className: "apireference_btn",
      label: "API Reference",
    });
    return navigationArray;
  }

  for (let index in navbar) {
    if (navbar[index].sidebarRef) {
      if (navbar[index].sidebarRef === "docs") {
        navigationArray.push({
          type: "doc",
          position: "left",
          label: navbar[index].label,
          className: allItemsIncluded ? `${navbar[index].label.toLowerCase()}_btn` : "btn",
          docId: getFirstPageFromJson(navbar[index].sidebarRef),
        });
      } else {
        navigationArray.push({
          type: "docSidebar",
          position: "left",
          sidebarId: navbar[index].sidebarRef,
          className: allItemsIncluded ? `${navbar[index].sidebarRef.toLowerCase()}_btn` : "btn",
          label: navbar[index].label,
        });
      }
    } else if (navbar[index].link) {
      navigationArray.push({
        to: navbar[index].link,
        label: navbar[index].label,
        position: "left",
        className: "navbar_external_link",
      });
    } else if (navbar[index].dropdown) {
      const dropdown = [];
      navbar[index].dropdown.forEach(({ label, sidebarRef, link }) => {
        if (sidebarRef) {
          dropdown.push({
            type: "doc",
            label: label,
            docId: getFirstPageFromJson(sidebarRef),
          });
        } else if (link) {
          dropdown.push({
            to: link,
            label: label,
            className: "navbar_external_link",
          });
        }
      });
      navigationArray.push({
        type: "dropdown",
        label: navbar[index].label,
        position: "left",
        items: dropdown,
      });
    }
  }

  if (configurations.changelog) {
    navigationArray.push({
      to: "changelog",
      label: "Changelog",
      position: "left",
      className: allItemsIncluded ? "changelog_btn" : "btn",
    });
  }

  if (externalLinks) {
    externalLinks.slice(0, 4).forEach(({ link, name, style }) => {
      const className = style === "link" ? "wd_navbar_link_only" : "wd_navbar_link_btn";
      const item = {
        to: link,
        position: "right",
        className: className,
        label: name,
      };
      navigationArray.push(item);
    });
  }

  if (languages && languages.length > 1) {
    navigationArray.push({
      type: "localeDropdown",
      position: "right",
      className: "language_dropdown",
    });
  }

  navigationArray.push({ type: "search", position: "right" });

  return navigationArray;
}

export default createNavigationArray;
