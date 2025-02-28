const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function getJson(file) {
  const configJsonPath = path.join(__dirname, file);
  const data = fs.readFileSync(configJsonPath, 'utf8');
  return JSON.parse(data);
}

function cleanPath(path) {
  let newPath;
  newPath = path.replace(/^\/?docs\//, '');
  newPath = newPath.replace(/^\//, '');
  newPath = newPath.replace(/\.(mdx|md)$/, '');
  return newPath;
}

function processPage(item, outputArray) {
  if (typeof item === 'string') {
    if (item.startsWith('reference/')) {
      const cleanedPath = cleanPath(item);
      const possibleEndings = ['.api.mdx', '.info.mdx', '.mdx'];
      let mdxPath;
      let mdxContent;
      let metadata;

      // Try each possible file ending until we find one that exists
      for (let ending of possibleEndings) {
        const pathToTry = path.join('docs', `${cleanedPath}${ending}`);
        if (fs.existsSync(pathToTry)) {
          mdxPath = pathToTry;
          // Read the MDX file and extract metadata
          mdxContent = fs.readFileSync(mdxPath, 'utf8');
          metadata = matter(mdxContent).data;
          break;
        }
      }

      if (!mdxContent) {
        // Handle the case where no file was found
        throw new Error(`MDX file not found for path: ${cleanedPath}`);
      }

      // Add the className based on the sidebar_class_name
      outputArray.push({
        type: 'doc',
        id: cleanedPath,
        className: metadata.sidebar_class_name || 'wd_no_class_item'
      });
    } else {
      // Simple page
      outputArray.push({
        type: 'doc',
        id: cleanPath(item)
      });
    }
  } else if (typeof item === 'object') {
    const category = {
      type: 'category',
      label: item.groupName,
    };

    if (item.page) {
      category['link'] = {
        type: 'doc',
        id: cleanPath(item.page)
      };
    }

    category['items'] = [];

    item.subpages.forEach(subItem => {
      processPage(subItem, category.items);
    });

    outputArray.push(category);
  }
}

function saveNewSidebar(sidebars, outputPath) {
  const outputContent = `module.exports = ${JSON.stringify(sidebars, null, 2)};`;
  fs.writeFile(outputPath, outputContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing the output file:', err);
    } 
    else {
      console.log(`[SIDEBAR] Sidebar generated\n`);
    }
  });
}

function transformSidebar(inputPath, outputPath) {
  fs.readFile(inputPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the input file:', err);
      return;
    }

    try {
      const file = JSON.parse(data);
      const { sidebars } = file;
      const newSidebars = {};

      sidebars.forEach((sidebar) => {
        newSidebars[sidebar.sidebarRef] = [];

        sidebar.categories.forEach((category, index) => {
          const { categoryName } = category;
          const categoryTitle = {
            type: 'category',
            label: categoryName,
            collapsed: false,
            collapsible: false,
            items: [],
          };

          if (index === 0) {
            categoryTitle['className'] = 'wd_sidebar_first_item';
          } else {
            categoryTitle['className'] = 'wd_sidebar_item'
          }
          
          newSidebars[sidebar.sidebarRef].push(categoryTitle);
          
          category.pages.forEach((item) => {
            processPage(item, categoryTitle.items);
          });
        })
      })

      const planConfig = getJson('plan.json');
      const { plan } = planConfig;

      if (plan === 'free') {
        saveNewSidebar({ "apiReference": Object.values(newSidebars)[0] }, outputPath)
      } else {
        saveNewSidebar(newSidebars, outputPath);
      }

    } catch (parseError) {
      console.error('Error parsing the JSON data:', parseError);
    }
  });
}

transformSidebar('config.json', 'sidebars.js');

module.exports = transformSidebar;
