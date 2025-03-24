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
import createOpenApiConfig from "./writedocs/docusaurus/openapiPlugin.js";
import { loadGoogleTagManager, loadGtag } from "./writedocs/docusaurus/google.js";
import defineColorScheme from "./writedocs/docusaurus/colorScheme.js";
import retrieveCustomDomain from "./writedocs/docusaurus/customDomain.js";
import createNavigationArray from "./writedocs/docusaurus/navbar.js";

// const languages = ['es', 'en', 'fr', 'de', 'pt', 'it', 'ja']

dotenv.config();

function getJson(file) {
  const configJsonPath = path.join(__dirname, file);
  const data = fs.readFileSync(configJsonPath, "utf8");
  return JSON.parse(data);
}

const configurations = getJson("config.json");
const planConfig = getJson("plan.json");

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
        ...loadGtag(configurations),
        ...loadGoogleTagManager(configurations),
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: defineColorScheme(configurations),
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
        items: createNavigationArray(configurations, planConfig),
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
    createOpenApiConfig(configurations, planConfig),
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
