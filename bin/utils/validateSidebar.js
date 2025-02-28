const path = require("path");
const fs = require("fs");
const print = require("./print");

const readJson = (configPath) => {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    print.error(`Error reading or parsing config.json: ${err}`)
    process.exit(1);
  }
}

function collectPages(categories, pagesMap) {
  for (const category of categories) {
    const pages = category.pages;
    if (pages) {
      for (const page of pages) {
        if (typeof page === 'string') {
          // It's a page path
          if (pagesMap.has(page)) {
            pagesMap.set(page, pagesMap.get(page) + 1);
          } else {
            pagesMap.set(page, 1);
          }
        } else if (typeof page === 'object') {
          // Handle 'page' key if it exists
          if (page.page) {
            const pagePath = page.page;
            if (pagesMap.has(pagePath)) {
              pagesMap.set(pagePath, pagesMap.get(pagePath) + 1);
            } else {
              pagesMap.set(pagePath, 1);
            }
          }
          // Handle 'subpages' if they exist
          if (page.subpages) {
            collectPages([{ pages: page.subpages }], pagesMap);
          }
        }
      }
    }
  }
}

const checkDuplicates = (configFilePath) => {
  const pagesMap = new Map();
  const configData = readJson(configFilePath);
  for (const sidebar of configData.sidebars) {
    const categories = sidebar.categories;
    collectPages(categories, pagesMap);
  }

  // Check for duplicate pages
  const duplicates = [];
  for (const [page, count] of pagesMap.entries()) {
    if (count > 1) {
      duplicates.push(page);
    }
  }

  if (duplicates.length > 0) {
    print.error(`[DUPLICATE_PAGES_ERROR] Duplicate pages found in sidebars:`);
    duplicates.forEach(page => print.error(` - ${page}`));
    process.exit(1);
  }
}

module.exports = checkDuplicates;