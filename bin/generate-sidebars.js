const fs = require("fs").promises;
const path = require("path");

const getPagePath = (filePath) => {
  const fileName = filePath
    .replace(/\\/g, "/")
    .replace(/\.(?:(?:api|info|endpoint)\.)?mdx?$/, "");
  return fileName;
};

const formatCategoryName = (name) => {
  // Replace hyphens and underscores with spaces and capitalize words
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const processCategory = async (categoryPath, categoryName, baseDir) => {
  const category = {
    categoryName: formatCategoryName(categoryName),
    pages: [],
  };

  const entries = await fs.readdir(categoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(categoryPath, entry.name);
    const relativeEntryPath = path.join(baseDir, categoryName, entry.name);

    if (
      entry.isFile() &&
      (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
    ) {
      const pagePath = getPagePath(relativeEntryPath);
      category.pages.push(pagePath);
    } else if (entry.isDirectory()) {
      const subcategory = await processCategory(
        entryPath,
        entry.name,
        path.join(baseDir, categoryName)
      );
      category.pages.push({
        groupName: subcategory.categoryName,
        subpages: subcategory.pages,
      });
    }
  }

  return category;
};

const processDirectory = async (dirPath, sidebarRef, baseDir = "") => {
  const categories = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === "reference" && sidebarRef === "guides") {
        continue; // Skip 'reference' folder when processing 'guides' sidebar
      }

      const category = await processCategory(
        path.join(dirPath, entry.name),
        entry.name,
        baseDir
      );
      categories.push(category);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      // Files directly under the docs directory
      const pagePath = getPagePath(path.join(baseDir, entry.name));
      categories.push({
        categoryName: formatCategoryName(entry.name.replace(".md", "")),
        pages: [pagePath],
      });
    }
  }

  return {
    sidebarRef: sidebarRef,
    categories: categories,
  };
};

const generateSidebars = async (projectRoot) => {
  try {
    const docsDir = path.join(projectRoot, "docs");
    const configPath = path.join(projectRoot, "config.json");

    // Read the existing config.json
    const configData = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configData);

    // Initialize sidebars
    const sidebars = [];

    // Process 'guides' sidebar
    const guidesSidebar = await processDirectory(docsDir, "guides");
    sidebars.push(guidesSidebar);

    // Check if 'reference' directory exists and process it
    const referenceDir = path.join(docsDir, "reference");
    try {
      await fs.access(referenceDir);
      const apiReferenceSidebar = await processDirectory(
        referenceDir,
        "apiReference",
        "reference"
      );
      sidebars.push(apiReferenceSidebar);
    } catch (err) {
      // 'reference' directory does not exist; skip processing
    }

    // Update config
    config.sidebars = sidebars;

    // Write back to config.json
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error("Error generating sidebars");
  }
};

module.exports = generateSidebars;
