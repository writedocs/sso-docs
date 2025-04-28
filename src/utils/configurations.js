module.exports = {
  "$schema": "https://docs.writedocs.io/schema.json",
  "websiteName": "WriteDocs Documentation",
  "description": "Explore our documentation to learn how to create beautiful, scalable developer portals with WriteDocs!",
  "images": {
    "logo": "media/logo.png",
    "favicon": "media/favicon.ico"
  },
  "languages": [
    "en"
  ],
  "styles": {
    "mainColor": "#0029F5",
    "darkModeMainColor": "#F0F0FF",
    "navbarColor": "#000621",
    "navbarDarkModeColor": "#000621",
    "backgroundDarkModeColor": "#000000",
    "pagination": true,
    "logoSize": "medium",
    "navbarMode": "tabbed"
  },
  "apiFiles": [
    "example.yml"
  ],
  "homepage": "/introduction",
  "changelog": false,
  "navbar": [
    {
      "label": "Guides",
      "sidebarRef": "guides"
    }
  ],
  "externalLinks": [],
  "sidebars": [
    {
      "sidebarRef": "guides",
      "categories": [
        {
          "categoryName": "Getting Started",
          "pages": [
            "guides/getting-started/introduction",
            "guides/getting-started/local-development"
          ]
        },
        {
          "categoryName": "Basics",
          "pages": [
            "guides/basics/global-settings",
            "guides/basics/markdown-basics",
            {
              "groupName": "Page Templates",
              "subpages": [
                "guides/basics/page-templates/api-introduction",
                "guides/basics/page-templates/environments",
                "guides/basics/page-templates/authentication"
              ]
            }
          ]
        }
      ]
    }
  ]
};