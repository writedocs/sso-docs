const fs = require('fs');
const path = require('path');
const { getJson } = require('./utils/jsonHandler');

// Function to create a boilerplate translations.json
function generateTranslationBoilerplate() {
  const projectRoot = process.cwd();
  const translationsFilePath = path.join(projectRoot, 'translations.json');

  const configData = getJson('config.json');

  if (!configData.languages || configData.languages.length <= 1) {
    throw new Error('Main language only');
  }

  const translations = {
    navbar: {},
    sidebars: {}
  };

  // Process navbar labels
  function processNavbarItems(items) {
    items.forEach(item => {
      if (item.label) {
        translations.navbar[item.label] = item.label;
      }
      if (item.dropdown) {
        processNavbarItems(item.dropdown);
      }
    });
  }

  processNavbarItems(configData.navbar || []);

  // Recursive function to process pages and subpages
  function processPages(pages, translationsObj) {
    pages.forEach(page => {
      if (typeof page === 'object' && !page.page) {
        const groupName = page.groupName;
        if (groupName) {
          translationsObj[groupName] = groupName;
        }
      }
      if (page.subpages) {
        processPages(page.subpages, translationsObj);
      }
    });
  }

  // Process sidebars
  (configData.sidebars || []).forEach((sidebar) => {
    const sidebarRef = sidebar.sidebarRef;
    translations.sidebars[sidebarRef] = {};

    (sidebar.categories || []).forEach(category => {
      const categoryName = category.categoryName;
      translations.sidebars[sidebarRef][categoryName] = categoryName;

      processPages(category.pages || [], translations.sidebars[sidebarRef]);
    });
  });

  const { languages } = configData;
  const content = languages.slice(1).reduce((acc, curr) => {
    acc[curr] = translations;
    return acc;
  }, {});

  // Write translations to translations.json
  fs.writeFileSync(
    translationsFilePath,
    JSON.stringify(content, null, 2)
  );
}

// Export the function
module.exports = {
  generateTranslationBoilerplate
};
