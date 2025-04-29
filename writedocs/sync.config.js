const fs = require("fs");
const path = require("path");

const configPath = path.resolve(process.cwd(), "config.json");
const docsBasePath = path.resolve(process.cwd(), "docs");
const apiPagesBasePath = path.resolve(process.cwd(), "apiPages");
const apiBasePath = path.resolve(process.cwd());
const pageExtensions = [".md", ".mdx"];

console.log(`[Config Sync] Using config file: ${configPath}`);
console.log(`[Config Sync] Docs base path: ${docsBasePath}`);
console.log(`[Config Sync] API Pages base path: ${apiPagesBasePath}`);
console.log(`[Config Sync] API base path: ${apiBasePath}`);

// --- Helper Functions ---

// Helper to normalize directory/ref names for keys (lowercase, hyphenated)
const normalizeDirOrRef = (name) => {
  if (typeof name !== "string") return "";
  return name.toLowerCase().replace(/\s+/g, "-");
};

function formatNameForComparison(name) {
  const spaced = name.replace(/-/g, " ");
  return spaced
    .split(/[- ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function unformatName(formattedName) {
  return formattedName.toLowerCase().replace(/\s+/g, "-");
}

function findFilesRecursive(dirPath, extensions, basePath) {
  let results = [];
  try {
    const list = fs.readdirSync(dirPath, { withFileTypes: true });
    list.forEach((dirent) => {
      const fullPath = path.resolve(dirPath, dirent.name);
      if (dirent.isDirectory()) {
        results = results.concat(
          findFilesRecursive(fullPath, extensions, basePath)
        );
      } else if (
        dirent.isFile() &&
        extensions.some((ext) => dirent.name.endsWith(ext))
      ) {
        const relative = path.relative(basePath, fullPath).replace(/\\/g, "/");
        results.push(relative);
      }
    });
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn(
        `[Config Sync] Warning: Could not read directory ${dirPath}: ${err.message}`
      );
    }
  }
  return results;
}

// --- Functions to Build Order Map from Existing Config ---

function buildOrderMap(existingSidebars) {
  const orderMap = {};
  if (!Array.isArray(existingSidebars)) {
    return orderMap;
  }

  const normalizeKey = (str) =>
    str
      .toLowerCase()
      .replace(/(\.(md|mdx|endpoint\.mdx))$/, "")
      .replace(/\/$/, "");

  existingSidebars.forEach((sidebar) => {
    if (!sidebar || !sidebar.sidebarRef || !Array.isArray(sidebar.categories)) {
      return;
    }
    const lowerSidebarRef = sidebar.sidebarRef.toLowerCase();
    const sidebarOrderKey = normalizeKey(lowerSidebarRef);
    orderMap[sidebarOrderKey] = sidebar.categories.map(
      (cat) => cat.categoryName
    );

    sidebar.categories.forEach((category) => {
      if (
        !category ||
        !category.categoryName ||
        !Array.isArray(category.pages)
      ) {
        return;
      }
      const categoryPath = `${lowerSidebarRef}/${unformatName(
        category.categoryName
      )}`;
      const categoryOrderKey = normalizeKey(categoryPath);
      orderMap[categoryOrderKey] = [];

      const processPages = (pages, currentPathKey, parentOrderArray) => {
        pages.forEach((item) => {
          if (typeof item === "string") {
            parentOrderArray.push(item);
          } else if (
            typeof item === "object" &&
            item !== null &&
            item.groupName
          ) {
            parentOrderArray.push(item.groupName);
            const groupPath = `${currentPathKey}/${unformatName(
              item.groupName
            )}`;
            const groupOrderKey = normalizeKey(groupPath);
            orderMap[groupOrderKey] = [];
            if (item.page && typeof item.page === "string") {
              orderMap[groupOrderKey].push(item.page);
            }
            if (Array.isArray(item.subpages)) {
              processPages(item.subpages, groupPath, orderMap[groupOrderKey]);
            }
          }
        });
      };
      processPages(category.pages, categoryPath, orderMap[categoryOrderKey]);
    });
  });
  return orderMap;
}

// --- Functions to Build Sidebar Structure (Order-Preserving) ---

function buildSidebarsFromMapWithOrder(
  structureMap,
  orderMap,
  navbarConfigItems
) {
  const sidebars = [];
  const processedRefs = new Set();

  const navbarRefDetailsMap = navbarConfigItems.reduce((acc, item) => {
    if (item.sidebarRef) {
      const contentDirKey = normalizeDirOrRef(item.label);
      acc[item.sidebarRef.toLowerCase()] = {
        type: "direct",
        originalRef: item.sidebarRef,
        contentDirKey: contentDirKey,
        label: item.label,
        pathPrefix: "",
      };
    } else if (item.dropdown) {
      const parentContentDirKey = normalizeDirOrRef(item.label);
      const dropdownLabel = item.label;
      item.dropdown.forEach((dropdownItem) => {
        if (dropdownItem.sidebarRef) {
          const subContentDirKey = normalizeDirOrRef(dropdownItem.label);
          acc[dropdownItem.sidebarRef.toLowerCase()] = {
            type: "dropdown",
            originalRef: dropdownItem.sidebarRef,
            parentContentDirKey: parentContentDirKey,
            subContentDirKey: subContentDirKey,
            label: dropdownItem.label,
            pathPrefix: `${dropdownLabel}/`,
          };
        }
      });
    }
    return acc;
  }, {});

  const processSidebarRef = (lowerCaseNavbarRef) => {
    if (processedRefs.has(lowerCaseNavbarRef)) return;

    const details = navbarRefDetailsMap[lowerCaseNavbarRef];
    if (!details) return;

    const navbarSidebarRef = details.originalRef;
    const pathPrefix = details.pathPrefix || "";
    let sidebarDataForProcessing = null;

    if (details.type === "direct") {
      const contentDirKey = details.contentDirKey;
      if (structureMap[contentDirKey]) {
        sidebarDataForProcessing = structureMap[contentDirKey];
      } else {
        console.warn(
          `[Config Sync] Warning: Content directory '${contentDirKey}' (derived from label '${details.label}') for sidebarRef '${navbarSidebarRef}' not found in docs/ or apiPages/. Skipping content.`
        );
      }
    } else if (details.type === "dropdown") {
      const parentContentDirKey = details.parentContentDirKey;
      const subContentDirKey = details.subContentDirKey;

      if (
        structureMap[parentContentDirKey] &&
        structureMap[parentContentDirKey].categories
      ) {
        const parentStructure = structureMap[parentContentDirKey];
        let foundSubStructure = null;
        const fsCategoryOrGroupName = Object.keys(
          parentStructure.categories
        ).find((catName) => normalizeDirOrRef(catName) === subContentDirKey);

        if (fsCategoryOrGroupName) {
          sidebarDataForProcessing =
            parentStructure.categories[fsCategoryOrGroupName];
        } else {
          console.warn(
            `[Config Sync] Warning: Could not find sub-directory/category matching '${subContentDirKey}' (from label '${details.label}') within the parent directory '${parentContentDirKey}' for dropdown sidebarRef '${navbarSidebarRef}'. Skipping content.`
          );
        }
      } else {
        console.warn(
          `[Config Sync] Warning: Parent content directory '${parentContentDirKey}' for dropdown sidebarRef '${navbarSidebarRef}' not found or has no categories in docs/ or apiPages/. Skipping content.`
        );
      }
    }

    if (sidebarDataForProcessing) {
      const sidebarOrderKey = lowerCaseNavbarRef;

      const categoriesMapToBuild =
        details.type === "direct"
          ? sidebarDataForProcessing.categories
          : sidebarDataForProcessing.groups || {};

      const sidebarObj = {
        sidebarRef: navbarSidebarRef,
        categories: buildCategoriesWithOrder(
          categoriesMapToBuild,
          orderMap,
          sidebarOrderKey,
          pathPrefix
        ),
      };

      if (sidebarObj.categories.length > 0) {
        sidebars.push(sidebarObj);
      }
    }

    processedRefs.add(lowerCaseNavbarRef);
  };

  navbarConfigItems.forEach((item) => {
    if (item.sidebarRef) {
      processSidebarRef(item.sidebarRef.toLowerCase());
    } else if (item.dropdown) {
      item.dropdown.forEach((dropdownItem) => {
        if (dropdownItem.sidebarRef) {
          processSidebarRef(dropdownItem.sidebarRef.toLowerCase());
        }
      });
    }
  });

  Object.keys(structureMap).forEach((fsContentDirKey) => {
    const isReferenced = navbarConfigItems.some((item) => {
      if (item.sidebarRef && normalizeDirOrRef(item.label) === fsContentDirKey)
        return true;
      if (item.dropdown) {
        return item.dropdown.some(
          (di) =>
            di.sidebarRef && normalizeDirOrRef(di.label) === fsContentDirKey
        );
      }
      return false;
    });
    if (!isReferenced) {
      const filesystemSidebarRef =
        structureMap[fsContentDirKey]?.filesystemCaseRef || fsContentDirKey;
      console.warn(
        `[Config Sync] Warning: Directory '${filesystemSidebarRef}' found in docs/ or apiPages/ but is not referenced by any item in config.navbar. Skipping content.`
      );
    }
  });

  sidebars.sort((a, b) => {
    const getOrderIndex = (sidebarRef) => {
      for (let i = 0; i < navbarConfigItems.length; i++) {
        const item = navbarConfigItems[i];
        if (item.sidebarRef === sidebarRef) return i;
        if (item.dropdown) {
          for (let j = 0; j < item.dropdown.length; j++) {
            if (item.dropdown[j].sidebarRef === sidebarRef)
              return i + (j + 1) * 0.1;
          }
        }
      }
      return Infinity;
    };

    const indexA = getOrderIndex(a.sidebarRef);
    const indexB = getOrderIndex(b.sidebarRef);

    return indexA - indexB;
  });

  return sidebars;
}

function buildCategoriesWithOrder(
  fsCategoriesMap,
  orderMap,
  parentPathKey,
  pathPrefix = ""
) {
  const categories = [];
  const processedCategoryNamesLower = new Set();
  const normalizeKey = (str) =>
    str
      .toLowerCase()
      .replace(/(\.(md|mdx|endpoint\.mdx))$/, "")
      .replace(/\/$/, "");

  const categoryOrder = orderMap[parentPathKey] || [];
  const fsCatNameMap = Object.keys(fsCategoriesMap).reduce((acc, key) => {
    acc[key.toLowerCase()] = key;
    return acc;
  }, {});

  categoryOrder.forEach((orderedCatName) => {
    const lowerOrderedCatName = unformatName(orderedCatName);
    const fsCatNameOriginalCase = fsCatNameMap[lowerOrderedCatName];

    if (fsCatNameOriginalCase && fsCategoriesMap[fsCatNameOriginalCase]) {
      const categoryData = fsCategoriesMap[fsCatNameOriginalCase];
      const categoryPath = `${parentPathKey}/${lowerOrderedCatName}`;
      const categoryOrderKey = normalizeKey(categoryPath);

      const categoryObj = {
        categoryName: orderedCatName,
        pages: buildPagesAndGroupsWithOrder(
          categoryData,
          orderMap,
          categoryOrderKey,
          pathPrefix
        ),
      };

      if (categoryObj.pages.length > 0) {
        categories.push(categoryObj);
      }
      processedCategoryNamesLower.add(lowerOrderedCatName);
    } else {
      console.warn(
        `[Config Sync] Warning: Category '${orderedCatName}' found in config order for '${parentPathKey}' but not on filesystem. Skipping.`
      );
    }
  });

  Object.keys(fsCategoriesMap)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .forEach((fsCatNameOriginalCase) => {
      const lowerFsCatName = fsCatNameOriginalCase.toLowerCase();
      if (!processedCategoryNamesLower.has(lowerFsCatName)) {
        const categoryData = fsCategoriesMap[fsCatNameOriginalCase];
        const categoryPath = `${parentPathKey}/${normalizeDirOrRef(
          fsCatNameOriginalCase
        )}`;
        const categoryOrderKey = normalizeKey(categoryPath);

        const categoryObj = {
          categoryName: formatNameForComparison(fsCatNameOriginalCase),
          pages: buildPagesAndGroupsWithOrder(
            categoryData,
            orderMap,
            categoryOrderKey,
            pathPrefix
          ),
        };
        if (categoryObj.pages.length > 0) {
          categories.push(categoryObj);
          console.log(
            `[Config Sync] Info: Adding new category '${fsCatNameOriginalCase}' found on filesystem to sidebar '${parentPathKey}'.`
          );
        }
        processedCategoryNamesLower.add(lowerFsCatName);
      }
    });

  return categories;
}

function buildPagesAndGroupsWithOrder(
  levelData,
  orderMap,
  parentPathKey,
  pathPrefix = ""
) {
  const items = [];
  const processedItemIdentifiersLower = new Set();
  const normalizeKey = (str) =>
    str
      .toLowerCase()
      .replace(/(\.(md|mdx|endpoint\.mdx))$/, "")
      .replace(/\/$/, "");

  const fsPagesMap = (levelData.pages || []).reduce((acc, pagePath) => {
    // Skip any API-variant pages (e.g., create-item.api or create-item.api.md)
    if (/\.api($|\.(md|mdx))/.test(pagePath)) {
      return acc;
    }
    const key = normalizeKey(unformatName(pagePath));
    acc[key] = pagePath;
    return acc;
  }, {});
  const fsGroupsMap = Object.keys(levelData.groups || {}).reduce(
    (acc, groupName) => {
      const key = normalizeKey(groupName);
      acc[key] = groupName;
      return acc;
    },
    {}
  );
  const fsGroupData = levelData.groups || {};

  const itemOrder = orderMap[parentPathKey] || [];

  itemOrder.forEach((orderedItemNameOrPath) => {
    // Normalize order key: for group names, convert spaces to hyphens; for page paths, slash remains
    const lowerOrderedItem = normalizeKey(unformatName(orderedItemNameOrPath));
    let processed = false;

    if (fsPagesMap[lowerOrderedItem]) {
      const fsPagePath = fsPagesMap[lowerOrderedItem];
      const pathWithoutExt = fsPagePath.replace(
        /(\.(md|mdx|endpoint\.mdx))$/,
        ""
      );

      let shouldSkip = false;
      Object.entries(fsGroupData).forEach(([groupName, groupInfo]) => {
        if (groupInfo.pageIsSpecial && groupInfo.page === fsPagePath) {
          shouldSkip = true;
        }
      });

      if (!shouldSkip) {
        let fullPath;
        if (pathPrefix) {
          fullPath = pathWithoutExt.replace(/^docs\//, "");
        } else {
          fullPath = pathWithoutExt;
        }
        items.push(fullPath);
      }
      processedItemIdentifiersLower.add(lowerOrderedItem);
      processed = true;
    } else if (fsGroupsMap[lowerOrderedItem]) {
      const fsGroupName = fsGroupsMap[lowerOrderedItem];
      const groupData = fsGroupData[fsGroupName];
      const groupPath = `${parentPathKey}/${lowerOrderedItem}`;
      const groupOrderKey = normalizeKey(groupPath);

      let groupPagePathWithoutExt = null;
      if (groupData.page && typeof groupData.page === "string") {
        groupPagePathWithoutExt = groupData.page.replace(
          /(\.(md|mdx|endpoint\.mdx))$/,
          ""
        );
        processedItemIdentifiersLower.add(normalizeKey(groupData.page));
      }

      const groupObj = {
        groupName: formatNameForComparison(fsGroupName),
        subpages: buildPagesAndGroupsWithOrder(
          groupData,
          orderMap,
          groupOrderKey,
          pathPrefix
        ),
      };
      if (groupPagePathWithoutExt) {
        if (pathPrefix) {
          groupObj.page = groupPagePathWithoutExt.replace(/^docs\//, "");
        } else {
          groupObj.page = groupPagePathWithoutExt;
        }
      }

      if (groupObj.subpages.length > 0 || groupObj.page) {
        items.push(groupObj);
      }
      processedItemIdentifiersLower.add(lowerOrderedItem);
      (groupData.pages || []).forEach((p) =>
        processedItemIdentifiersLower.add(normalizeKey(p))
      );
      processed = true;
    } else {
      console.warn(
        `[Config Sync] Warning: Item '${orderedItemNameOrPath}' found in config order for '${parentPathKey}' but not on filesystem. Skipping.`
      );
    }
  });

  Object.keys(fsPagesMap)
    .sort()
    .forEach((lowerFsPageKey) => {
      if (!processedItemIdentifiersLower.has(lowerFsPageKey)) {
        const fsPagePath = fsPagesMap[lowerFsPageKey];
        const pathWithoutExt = fsPagePath.replace(
          /(\.(md|mdx|endpoint\.mdx))$/,
          ""
        );

        let shouldSkip = false;
        Object.entries(fsGroupData).forEach(([groupName, groupInfo]) => {
          if (groupInfo.pageIsSpecial && groupInfo.page === fsPagePath) {
            shouldSkip = true;
          }
        });

        if (shouldSkip) {
          processedItemIdentifiersLower.add(lowerFsPageKey);
          return;
        }

        let isGroupPage = false;
        Object.values(fsGroupData).forEach((gData) => {
          if (gData.page && normalizeKey(gData.page) === lowerFsPageKey) {
            isGroupPage = true;
          }
        });

        if (!isGroupPage) {
          let fullPath;
          if (pathPrefix) {
            fullPath = pathWithoutExt.replace(/^docs\//, "");
          } else {
            fullPath = pathWithoutExt;
          }
          items.push(fullPath);
          console.log(
            `[Config Sync] Info: Adding new page '${fullPath}' found on filesystem to '${parentPathKey}'.`
          );
          processedItemIdentifiersLower.add(lowerFsPageKey);
        }
      }
    });

  Object.keys(fsGroupsMap)
    .sort()
    .forEach((lowerFsGroupKey) => {
      if (!processedItemIdentifiersLower.has(lowerFsGroupKey)) {
        const fsGroupName = fsGroupsMap[lowerFsGroupKey];
        const groupData = fsGroupData[fsGroupName];
        const groupPath = `${parentPathKey}/${lowerFsGroupKey}`;
        const groupOrderKey = normalizeKey(groupPath);

        let groupPagePathWithoutExt = null;
        if (groupData.page && typeof groupData.page === "string") {
          groupPagePathWithoutExt = groupData.page.replace(
            /(\.(md|mdx|endpoint\.mdx))$/,
            ""
          );
          processedItemIdentifiersLower.add(normalizeKey(groupData.page));
        }

        const groupObj = {
          groupName: formatNameForComparison(fsGroupName),
          subpages: buildPagesAndGroupsWithOrder(
            groupData,
            orderMap,
            groupOrderKey,
            pathPrefix
          ),
        };
        if (groupPagePathWithoutExt) {
          if (pathPrefix) {
            groupObj.page = groupPagePathWithoutExt.replace(/^docs\//, "");
          } else {
            groupObj.page = groupPagePathWithoutExt;
          }
        }

        if (groupObj.subpages.length > 0 || groupObj.page) {
          items.push(groupObj);
          console.log(
            `[Config Sync] Info: Adding new group '${fsGroupName}' found on filesystem to '${parentPathKey}'.`
          );
        }
        processedItemIdentifiersLower.add(lowerFsGroupKey);
        (groupData.pages || []).forEach((p) =>
          processedItemIdentifiersLower.add(normalizeKey(p))
        );
      }
    });

  return items;
}

try {
  console.log(
    "[Config Sync] Starting configuration synchronization (Order-Preserving Mode)..."
  );
  if (!fs.existsSync(configPath)) {
    console.error(
      `[Config Sync] Error: Configuration file not found at ${configPath}`
    );
    process.exit(1);
  }

  const configContent = fs.readFileSync(configPath, "utf8");
  let config;
  try {
    config = JSON.parse(configContent);
  } catch (parseError) {
    console.error(`[Config Sync] Error parsing ${configPath}:`, parseError);
    process.exit(1);
  }

  const originalConfigJson = JSON.stringify(config, null, 2);
  let configWasModified = false;

  const navbarConfigItems =
    config.navbar && Array.isArray(config.navbar) ? config.navbar : [];
  if (config.navbar && Array.isArray(config.navbar)) {
    console.log(
      `[Config Sync] Found ${navbarConfigItems.length} items in navbar config.`
    );
  } else {
    console.log(`[Config Sync] No navbar configuration found.`);
  }

  console.log(
    "[Config Sync] Reading existing sidebar order from config.json..."
  );
  const existingOrderMap = buildOrderMap(config.sidebars);

  console.log("[Config Sync] Scanning filesystem for documentation files...");
  const structureMap = {};
  let totalFilesFound = 0;
  const normalizeKey = (str) =>
    str
      .toLowerCase()
      .replace(/(\.(md|mdx|endpoint\.mdx))$/, "")
      .replace(/\/$/, "");

  const processFoundFile = (rawPath, sourceDir, targetPrefix = null) => {
    const pagePath = rawPath.replace(/\\/g, "/");
    const pathParts = pagePath.split("/").filter(Boolean);
    totalFilesFound++;

    if (pathParts.length < 2) {
      console.warn(
        `[Config Sync] Skipping page '${rawPath}' from ${sourceDir}: Needs at least <sidebar>/<category>/... structure.`
      );
      return;
    }

    const filesystemSidebarRef = pathParts[0];
    const categoryDirName = pathParts[1];
    const groupDirNames = pathParts.slice(2, -1);
    const fileName = pathParts[pathParts.length - 1];
    const fileNameWithoutExt = fileName.replace(
      /(\.(md|mdx|endpoint\.mdx))$/,
      ""
    );

    // Skip .api variant files entirely
    if (fileNameWithoutExt.toLowerCase().endsWith(".api")) {
      return;
    }

    const structureMapKey = normalizeDirOrRef(filesystemSidebarRef);

    if (!structureMap[structureMapKey]) {
      structureMap[structureMapKey] = { categories: {} };
    }
    if (!structureMap[structureMapKey].filesystemCaseRef) {
      structureMap[structureMapKey].filesystemCaseRef = filesystemSidebarRef;
    }
    let categoryLevelMap = structureMap[structureMapKey].categories;

    if (!categoryLevelMap[categoryDirName]) {
      categoryLevelMap[categoryDirName] = { pages: [], groups: {} };
    }
    let currentSubLevelData = categoryLevelMap[categoryDirName];

    groupDirNames.forEach((groupDirName) => {
      if (!currentSubLevelData.groups) currentSubLevelData.groups = {};
      if (!currentSubLevelData.groups[groupDirName]) {
        currentSubLevelData.groups[groupDirName] = { pages: [], groups: {} };
      }
      currentSubLevelData = currentSubLevelData.groups[groupDirName];
    });

    const parentDirName =
      groupDirNames.length > 0
        ? groupDirNames[groupDirNames.length - 1]
        : categoryDirName;
    const isIndexPage = fileNameWithoutExt.toLowerCase() === "index";
    const isFolderPage =
      fileNameWithoutExt.toLowerCase() === parentDirName.toLowerCase();

    let fullPagePathWithCase;
    fullPagePathWithCase = pathParts.join("/");

    if (isIndexPage || isFolderPage) {
      currentSubLevelData.page = fullPagePathWithCase;
      currentSubLevelData.pageIsSpecial = true;
    } else {
      if (!currentSubLevelData.pages) currentSubLevelData.pages = [];
      if (!currentSubLevelData.pages.includes(fullPagePathWithCase)) {
        currentSubLevelData.pages.push(fullPagePathWithCase);
      }
    }
  };

  if (fs.existsSync(docsBasePath)) {
    const foundDocsFilesRaw = findFilesRecursive(
      docsBasePath,
      pageExtensions,
      docsBasePath
    );
    foundDocsFilesRaw.forEach((p) => processFoundFile(p, docsBasePath));
  }

  if (fs.existsSync(apiPagesBasePath)) {
    const foundApiPageFilesRaw = findFilesRecursive(
      apiPagesBasePath,
      pageExtensions,
      apiPagesBasePath
    );
    foundApiPageFilesRaw.forEach((p) => processFoundFile(p, apiPagesBasePath));
  }

  console.log(
    `[Config Sync] Processed ${totalFilesFound} files from docs/ and apiPages/.`
  );

  console.log(
    "[Config Sync] Rebuilding documentation sidebars respecting existing order..."
  );

  // --- Check if we need to build the navbar from scratch ---
  if (navbarConfigItems.length === 0 && Object.keys(structureMap).length > 0) {
    console.log(
      "[Config Sync] No navbar items found, but folders exist in docs/ or apiPages/. Building navbar from scratch."
    );

    // Create navbar items for each top-level folder
    const newNavbarItems = Object.keys(structureMap).map((structureKey) => {
      const originalRef =
        structureMap[structureKey].filesystemCaseRef || structureKey;

      // Create a simple sidebarRef - use the filesystem ref with spaces replaced by hyphens
      // This creates a clean sidebarRef like "getting-started" from a folder named "Getting Started"
      const sidebarRef = normalizeDirOrRef(originalRef);

      return {
        label: originalRef, // Use original folder name as label (preserves capitalization)
        sidebarRef: sidebarRef,
      };
    });

    // Sort alphabetically for consistent initial order
    newNavbarItems.sort((a, b) => a.label.localeCompare(b.label));

    // Update the config object with these new navbar items
    config.navbar = newNavbarItems;

    // Update our working copy too
    // navbarConfigItems.push(...newNavbarItems); // No longer needed as we use config.navbar directly

    console.log(
      `[Config Sync] Generated ${newNavbarItems.length} navbar items from top-level folders.`
    );
    configWasModified = true;
  }

  const newSidebars = buildSidebarsFromMapWithOrder(
    structureMap,
    existingOrderMap,
    // Always use config.navbar, which might have been updated above
    config.navbar
  );
  config.sidebars = newSidebars;

  const newConfigJson = JSON.stringify(config, null, 2);

  if (originalConfigJson !== newConfigJson) {
    console.log(
      "[Config Sync] Configuration requires update (API files or Sidebar structure/order/casing changed). Saving..."
    );
    configWasModified = true;
  } else {
    console.log(
      "[Config Sync] Configuration already up-to-date. No changes needed."
    );
  }

  if (!fs.existsSync(docsBasePath) && !fs.existsSync(apiPagesBasePath)) {
    if (config.sidebars && config.sidebars.length > 0) {
      console.log(
        "[Config Sync] Clearing existing documentation sidebars as /docs and /apiPages folders not found."
      );
      config.sidebars = [];
      configWasModified = true;
    }
  }

  if (configWasModified) {
    try {
      console.log("[Config Sync] Saving updated config.json.");
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
      console.log(`[Config Sync] ${configPath} updated successfully.`);
    } catch (writeError) {
      console.error(
        `[Config Sync] Error writing updated config to ${configPath}:`,
        writeError
      );
      process.exit(1);
    }
  } else {
    console.log(`[Config Sync] No overall changes needed for ${configPath}.`);
  }
  console.log("[Config Sync] Synchronization finished successfully.");
} catch (error) {
  console.error(
    "[Config Sync] An unexpected error occurred during synchronization:",
    error
  );
  process.exit(1);
}
