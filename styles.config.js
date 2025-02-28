const fs = require('fs');
const path = require('path');
const { BLACKS, WHITES, LOGO_SIZES, navbarBreakpoint } = require('./writedocs/variables');

function hexToHSL(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h, s, l };
}

function HSLToHex(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustLightness(hex, percentage) {
  const { h, s, l } = hexToHSL(hex);
  const newL = Math.max(0, Math.min(1, l + percentage));
  return HSLToHex(h, s, newL);
}

function addTransparency(hexColor, transparency) {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);
  // Return the color in RGBA format with the specified transparency
  return `rgba(${r}, ${g}, ${b}, ${transparency})`;
}

function getLuminance(hex) {
  // Convert hex color to RGB
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;

  // Apply the sRGB formula
  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getTextColor(backgroundColor) {
  const luminance = getLuminance(backgroundColor);
  if (WHITES.includes(backgroundColor)) return '#000000';
  if (BLACKS.includes(backgroundColor)) return '#FFFFFF';
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

function navbarTotalItems(externalLinks, navbar, homepage) {
  let isHome = 0;
  if (homepage.endsWith('.html')) {
    isHome = 1;
  }
  return externalLinks.length + navbar.length + isHome;
}

function navbarHeight(externalLinks, navbar, homepage) {
  return navbarTotalItems(externalLinks, navbar, homepage) < navbarBreakpoint ? '76px' : '130px';
}

function sidebarTocPosition(externalLinks, navbar, homepage) {
  return navbarTotalItems(externalLinks, navbar, homepage) < navbarBreakpoint ? '85px' : '108px';
}

function sidebarPaddingTop(externalLinks, navbar, homepage, logoSize) {
  const totalItems = navbarTotalItems(externalLinks, navbar, homepage);
  switch (logoSize) {
    case 'large':
      return totalItems < navbarBreakpoint ? '76px' : '78px';
    case 'medium':
      return totalItems < navbarBreakpoint ? '66px' : '80px';
    default:
      return totalItems < navbarBreakpoint ? '66px' : '80px';
  }
}

function sidebarMarginTop(externalLinks, navbar, homepage, logoSize) {
  const totalItems = navbarTotalItems(externalLinks, navbar, homepage);
  switch (logoSize) {
    case 'large':
      return totalItems < navbarBreakpoint ? '34px' : '36px';
    case 'medium':
      return totalItems < navbarBreakpoint ? '34px' : '34px';
    default:
      return totalItems < navbarBreakpoint ? '35px' : '34px';
  }
}

function editCSS(cssContent, config) {
  const { styles, externalLinks, navbar, homepage } = config;
  const { mainColor, navbarColor, pagination, logoSize } = styles;
  const navbarFinalColor = navbarColor ? navbarColor : mainColor;
  const searchbarBorderColor = '#dadde1';

  let navbarLight = adjustLightness(navbarFinalColor, 0.2);
  let navbarDark = adjustLightness(navbarFinalColor, -0.2);
  let navbarBorderColor = '#ffffff33';

  const setLogoSize = logoSize ? LOGO_SIZES[logoSize] : LOGO_SIZES.small;

  if (WHITES.includes(navbarFinalColor)) {
    navbarLight = addTransparency(mainColor, 0.15);
    navbarDark = addTransparency(mainColor, 0.30);
    navbarBorderColor = '#9c9c9c';
  }

  if (BLACKS.includes(navbarFinalColor)){
    navbarLight = addTransparency(mainColor, 0.15);
    navbarDark = addTransparency(mainColor, 0.30);
  }

  const showPagination = pagination ? "flex" : "none";

  const luminance = getTextColor(navbarFinalColor);
  const isDark = luminance === '#000000';
  const guidesIcon = isDark ? 'var(--guidesIconDark)' : 'var(--guidesIconLight)';
  const apiIcon = isDark ? 'var(--apiIconDark)' : 'var(--apiIconLight)';
  const homeIcon = isDark ? 'var(--homeIconDark)' : 'var(--homeIconLight)';
  const changelogIcon = isDark ? 'var(--changelogIconDark)' : 'var(--changelogIconLight)';
  const navbarItemBorderColor = mainColor;
  const navbarItemBgColor = !isDark ? adjustLightness(mainColor, 0.1) : adjustLightness(mainColor, 0.45);
  const navbarHoverBgColor = !isDark ? addTransparency(mainColor, 0.25) : adjustLightness(mainColor, 0.48);
  const navbarItemFontColor = !isDark ? '#FFFFFF' : '#000000';

  const variations = {
    '--ifm-color-primary': mainColor,
    '--ifm-color-primary-dark': adjustLightness(mainColor, -0.2),
    '--ifm-color-primary-darker': adjustLightness(mainColor, -0.3),
    '--ifm-color-primary-darkest': adjustLightness(mainColor, -0.4),
    '--ifm-color-primary-light': adjustLightness(mainColor, 0.2),
    '--ifm-color-primary-lighter': adjustLightness(mainColor, 0.3),
    '--ifm-color-primary-lightest': adjustLightness(mainColor, 0.4),
    '--transparent-main-color': addTransparency(mainColor, 0.25),
    '--transparent-second-color': addTransparency(mainColor, 0.08),
    '--pagination-display': showPagination,
    '--navbar-color': navbarFinalColor,
    '--navbar-color-light': navbarLight,
    '--navbar-color-dark': navbarDark,
    '--navbar-font-color': luminance,
    '--guides-icon': guidesIcon,
    '--home-icon': homeIcon,
    '--api-icon': apiIcon,
    '--changelog-icon': changelogIcon,
    '--navbar-link-border-hover-color': navbarBorderColor,
    '--searchbar-border-color': searchbarBorderColor,
    '--bg-defined-text-color': getTextColor(mainColor),
    '--scroll-top-margin': navbarHeight(externalLinks, navbar, homepage),
    '--navbar-logo-height': setLogoSize,
    '--navbar-item-border-color': navbarItemBorderColor,
    '--navbar-item-background-color': navbarItemBgColor,
    '--navbar-item-font-color': navbarItemFontColor,
    '--navbar-link-hover': navbarHoverBgColor,
    '--navbar-link-active': navbarItemBgColor,
    '--sidebar-size': sidebarTocPosition(externalLinks, navbar, homepage),
    '--sidebar-margin-top': sidebarMarginTop(externalLinks, navbar, homepage, logoSize),
    '--sidebar-padding-top': sidebarPaddingTop(externalLinks, navbar, homepage, logoSize)
  };

  let updatedCSS = cssContent;

  for (const [variable, value] of Object.entries(variations)) {
    const regex = new RegExp(`${variable}:\\s*(url\\(.*?\\)|[^;]+);`, 'g');
    updatedCSS = updatedCSS.replace(regex, `${variable}: ${value};`);
  }


  return updatedCSS;
}

const manageCss = () => {
  const configFilePath = path.join(__dirname, 'config.json');
  const cssFilePath = path.join(__dirname, './src/css/custom.css');
  
  fs.readFile(configFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the config file:', err);
      return;
    }
  
    const config = JSON.parse(data);

    fs.readFile(cssFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the CSS file:', err);
        return;
      }
    
      const updatedCSS = editCSS(data, config);
    
      fs.writeFile(cssFilePath, updatedCSS, 'utf8', (err) => {
        if (err) {
          console.error('Error writing the CSS file:', err);
        } else {
          console.log('CSS file updated successfully.');
        }
      });
    });
  });
}

function editCSSDark(cssContent, styles) {
  const { mainColor, navbarColor, darkModeMainColor, navbarDarkModeColor, backgroundDarkModeColor } = styles;
  const navbarFinalColor = navbarColor ? navbarColor : mainColor;
  const mainDarkColor = darkModeMainColor ? darkModeMainColor : mainColor;
  const navbarDarkColor = navbarDarkModeColor ? navbarDarkModeColor : navbarFinalColor;
  const navbarBorderColor = '#9c9c9c';
  const searchbarBorderColor = '#dadde1';

  let navbarLight = adjustLightness(navbarDarkColor, 0.2);
  let navbarDark = adjustLightness(navbarDarkColor, -0.2);

  if (WHITES.includes(navbarDarkColor)) {
    navbarLight = addTransparency(mainDarkColor, 0.15);
    navbarDark = addTransparency(mainDarkColor, 0.30);
  }

  if (BLACKS.includes(navbarDarkColor)){
    navbarLight = addTransparency(mainDarkColor, 0.15);
    navbarDark = addTransparency(mainDarkColor, 0.30);
  }

  const luminance = getTextColor(navbarDarkColor);
  const isDark = luminance === '#000000';
  const guidesIcon = isDark ? 'var(--guidesIconDark)' : 'var(--guidesIconLight)';
  const apiIcon = isDark ? 'var(--apiIconDark)' : 'var(--apiIconLight)';
  const homeIcon = isDark ? 'var(--homeIconDark)' : 'var(--homeIconLight)';
  const changelogIcon = isDark ? 'var(--changelogIconDark)' : 'var(--changelogIconLight)';

  const navbarItemBorderColor = mainColor;
  const navbarItemBgColor = isDark ? adjustLightness(mainColor, 0.45) : adjustLightness(mainColor, 0.1);
  const navbarHoverBgColor = isDark ? adjustLightness(mainColor, 0.48) : addTransparency(mainColor, 0.25);
  const navbarItemFontColor = !isDark ? '#FFFFFF' : '#000000';

  const variations = {
    '--ifm-color-primary': mainDarkColor,
    '--ifm-color-primary-dark': adjustLightness(mainDarkColor, -0.2),
    '--ifm-color-primary-darker': adjustLightness(mainDarkColor, -0.3),
    '--ifm-color-primary-darkest': adjustLightness(mainDarkColor, -0.4),
    '--ifm-color-primary-light': adjustLightness(mainDarkColor, 0.2),
    '--ifm-color-primary-lighter': adjustLightness(mainDarkColor, 0.3),
    '--ifm-color-primary-lightest': adjustLightness(mainDarkColor, 0.4),
    '--transparent-main-color': addTransparency(mainDarkColor, 0.25),
    '--transparent-second-color': addTransparency(mainDarkColor, 0.08),
    '--navbar-color': navbarDarkColor,
    '--navbar-color-light': navbarLight,
    '--navbar-color-dark': navbarDark,
    '--navbar-font-color': luminance,
    '--guides-icon': guidesIcon,
    '--home-icon': homeIcon,
    '--api-icon': apiIcon,
    '--changelog-icon': changelogIcon,
    '--navbar-link-border-hover-color': navbarBorderColor,
    '--searchbar-border-color': searchbarBorderColor,
    '--bg-defined-text-color': getTextColor(mainDarkColor),
    '--navbar-item-border-color': navbarItemBorderColor,
    '--navbar-item-background-color': navbarItemBgColor,
    '--navbar-item-font-color': navbarItemFontColor,
    '--navbar-link-hover': navbarHoverBgColor,
    '--navbar-link-active': navbarItemBgColor,
    ...(backgroundDarkModeColor && { '--ifm-background-color': `${backgroundDarkModeColor} !important` }),
  };

  let updatedCSS = cssContent;

  for (const [variable, value] of Object.entries(variations)) {
    const regex = new RegExp(`${variable}:\\s*[^;]+;`, 'g');
    updatedCSS = updatedCSS.replace(regex, `${variable}: ${value};`);
  }

  return updatedCSS;
}

const manageCssDark = () => {
  const configFilePath = path.join(__dirname, 'config.json');
  const cssFilePath = path.join(__dirname, './src/css/customDark.css');
  
  fs.readFile(configFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the config file:', err);
      return;
    }
  
    const config = JSON.parse(data);
    const { styles } = config;

    fs.readFile(cssFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the CSS file:', err);
        return;
      }
    
      const updatedCSS = editCSSDark(data, styles);
    
      fs.writeFile(cssFilePath, updatedCSS, 'utf8', (err) => {
        if (err) {
          console.error('Error writing the CSS file:', err);
        } else {
          console.log('DarkMode CSS file updated successfully.');
        }
      });
    });
  });
}

manageCss();
manageCssDark();