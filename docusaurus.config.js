// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import componentsMap from "./componentsMap.js";

// const languages = ['es', 'en', 'fr', 'de', 'pt', 'it', 'ja']

dotenv.config();

function getJson(file) {
  const configJsonPath = path.join(__dirname, file);
  const data = fs.readFileSync(configJsonPath, "utf8");
  return JSON.parse(data);
}

const configurations = getJson("config.json");
const planConfig = getJson("plan.json");

function retrieveCustomDomain() {
  try {
    if (process.env.URL) return process.env.URL;
    const customDomain = process.env.CUSTOM_DOMAIN;
    if (!customDomain) return "https://docs.writedocs.io";
    return `https://${customDomain}`;
  } catch (error) {
    return "https://docs.writedocs.io";
  }
}

function loadGtag() {
  try {
    const gtag = process.env.GTAG;
    if (gtag) {
      return {
        gtag: {
          trackingID: gtag,
          anonymizeIP: true,
        },
      };
    }
    if (configurations.integrations?.gtag) {
      return {
        gtag: {
          trackingID: configurations.integrations.gtag,
          anonymizeIP: true,
        },
      };
    }
  } catch (error) {
    console.error("[GTAG] Error loading GTAG");
  }
}

function loadGoogleTagManager() {
  try {
    const containerId = process.env.GOOGLE_TAG_MANAGER_ID;
    if (containerId) {
      return {
        googleTagManager: {
          containerId: containerId,
        },
      };
    }
    if (configurations.integrations?.googleTagManager) {
      return {
        googleTagManager: {
          containerId: configurations.integrations.googleTagManager,
        },
      };
    }
  } catch (error) {
    console.error("[GOOGLE_TAG_MANAGER] Error loading GoogleTagManager");
    console.log(error);
  }
}

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

function createOpenApiConfig() {
  const directoryPath = "openAPI";
  const proxyUrl = "https://proxy.writechoice.io/";
  const defaultOutputBaseDir = "docs/reference";

  // Check if there are any default or translated API files.
  const hasDefaultFiles = configurations.apiFiles && configurations.apiFiles.length > 0;
  const hasTranslatedFiles =
    configurations.translatedApiFiles && Object.keys(configurations.translatedApiFiles).length > 0;
  if (!hasDefaultFiles && !hasTranslatedFiles) {
    return null;
  }

  // Helper function to recursively get all file paths in a directory.
  function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        fileList = getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  const allFiles = getAllFiles(directoryPath);
  const config = {};

  // Process default API files.
  if (hasDefaultFiles) {
    const normalizedFileNames = configurations.apiFiles.map((fileName) => {
      // If the path doesn't start with "openAPI/", add the directoryPath prefix
      if (!fileName.startsWith(`${directoryPath}/`)) {
        return path.join(directoryPath, fileName);
      }
      return fileName;
    });
    const validFiles = normalizedFileNames.filter((file) => allFiles.includes(file));
    validFiles.forEach((file) => {
      const fileName = path.parse(file).name;
      const specPath = file;
      const relativePath = path.relative(directoryPath, path.dirname(file));
      const outputDir =
        relativePath && relativePath !== "."
          ? path.join(defaultOutputBaseDir, relativePath, fileName.replace("_", "-"))
          : path.join(defaultOutputBaseDir, fileName.replace("_", "-"));
      const keyName = relativePath && relativePath !== "." ? `${relativePath}-${fileName}` : fileName;

      config[keyName] = { specPath, outputDir };
      if (!(configurations.proxy === false || planConfig.proxy === false)) {
        config[keyName].proxy = proxyUrl;
      }
    });
  }

  // Process translated API files.
  if (hasTranslatedFiles) {
    Object.keys(configurations.translatedApiFiles).forEach((locale) => {
      const fileNames = configurations.translatedApiFiles[locale];
      if (!fileNames || fileNames.length === 0) return;
      const normalizedFileNames = fileNames.map((fileName) => {
        if (!fileName.startsWith(`${directoryPath}/`)) {
          return path.join(directoryPath, fileName);
        }
        return fileName;
      });
      const validFiles = normalizedFileNames.filter((file) => allFiles.includes(file));
      validFiles.forEach((file) => {
        const fileName = path.parse(file).name;
        const specPath = file;
        const relativePath = path.relative(directoryPath, path.dirname(file));
        // Build the output directory using the i18n structure.
        const baseOutputDir = path.join("i18n", locale, "docusaurus-plugin-content-docs", "current", "reference");
        const outputDir = path.join(baseOutputDir, fileName.replace("_", "-"));
        const keyName = relativePath && relativePath !== "." ? `${relativePath}-${fileName}` : fileName;
        // Suffix the key with the locale to avoid collisions.
        const combinedKey = `${keyName}-${locale}`;

        config[combinedKey] = { specPath, outputDir };
        if (!(configurations.proxy === false || planConfig.proxy === false)) {
          config[combinedKey].proxy = proxyUrl;
        }
      });
    });
  }

  return [
    "docusaurus-plugin-openapi-docs",
    {
      id: "openapi",
      docsPluginId: "classic",
      config,
    },
  ];
}

function createNavigationArray() {
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

function defineColorScheme() {
  try {
    const { colorMode } = configurations;
    const { default: defaultMode, switchOff } = colorMode;
    return {
      respectPrefersColorScheme: false,
      defaultMode: defaultMode ? defaultMode : "light",
      disableSwitch: switchOff ? true : false,
    };
  } catch (error) {
    return {
      respectPrefersColorScheme: false,
      defaultMode: "light",
      disableSwitch: false,
    };
  }
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: configurations.websiteName,
  tagline: configurations.description,
  favicon: configurations.images.favicon,
  trailingSlash: true,

  // Set the production url of your site here
  url: retrieveCustomDomain(),
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: planConfig?.baseUrl || "/",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: configurations.languages ? configurations.languages[0] : "en",
    locales: configurations.languages && configurations.languages.length > 0 ? configurations.languages : ["en"],
    path: "i18n",
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          remarkPlugins: [[require("./plugins/remark-plugin-inject-import"), { componentsMap }]],
          rehypePlugins: [require("./plugins/docusaurus-plugin-wrap-tables")],
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          docItemComponent: "@theme/ApiItem",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        ...loadGtag(),
        ...loadGoogleTagManager(),
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: defineColorScheme(),
      metadata: [
        { name: "og:site_name", content: configurations.websiteName || "" },
        { name: "og:title", content: configurations.websiteName || "" },
        { name: "og:description", content: configurations.description || "" },
        { name: "description", content: configurations.description || "" },
      ],
      docs: {
        sidebar: {
          // hideable: true,
          autoCollapseCategories: true,
        },
      },
      zoom: {
        selector: ".markdown :not(em) > img:not(.no_zoom)",
        background: {
          light: "rgb(255, 255, 255,0.9)",
          dark: "rgb(50, 50, 50)",
        },
        config: {
          // options you can specify via https://github.com/francoischalifour/medium-zoom#usage
          margin: 80,
          scrollOffset: 50,
        },
      },
      image: configurations.images.metadata || configurations.images.logo,
      navbar: {
        title: configurations.websiteName || "",
        logo: {
          alt: `${configurations.websiteName} logo`,
          src: configurations.images.logo,
        },
        items: createNavigationArray(),
      },
      navbarBreakpoint: "1060px",
      footer: {
        style: "dark",
        copyright: `Copyright © ${new Date().getFullYear()} | ${configurations.websiteName}`,
      },
      prism: {
        theme: prismThemes.oceanicNext,
        darkTheme: prismThemes.oceanicNext,
        additionalLanguages: ["ruby", "csharp", "php", "java", "powershell", "json", "bash", "yaml"],
      },
    }),
  plugins: [
    "docusaurus-plugin-image-zoom",
    [
      require.resolve("docusaurus-lunr-search"),
      {
        maxHits: "7",
        highlightResult: "true",
      },
    ],
    createOpenApiConfig(),
    [
      "@docusaurus/plugin-content-blog",
      {
        id: "changelog",
        routeBasePath: "changelog",
        path: "./changelog",
        blogSidebarCount: "ALL",
        blogSidebarTitle: "Changelog",
        showReadingTime: false,
        blogTitle: "Changelog",
        blogDescription: "Changelog",
      },
    ],
  ],
  themes: ["docusaurus-theme-openapi-docs", "@docusaurus/theme-mermaid"],
  markdown: {
    mermaid: true,
  },
  future: {
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: false,
      mdxCrossCompilerCache: true,
    },
  },
};

export default config;
