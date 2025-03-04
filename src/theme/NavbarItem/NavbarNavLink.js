import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import isInternalUrl from "@docusaurus/isInternalUrl";
import { isRegexpStringMatch } from "@docusaurus/theme-common";
import IconExternalLink from "@theme/Icon/ExternalLink";
import * as PhosphorIcons from "@phosphor-icons/react";
import configurations from "../../utils/configurations";
import translations from "../../../translations.json";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function toCamelCaseWithCapitalized(str) {
  return str
    .replace(/-./g, (match) => match.charAt(1).toUpperCase()) // Convert "component-name" to "componentName"
    .replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter
}

export default function NavbarNavLink({
  activeBasePath,
  activeBaseRegex,
  to,
  href,
  label,
  html,
  isDropdownLink,
  prependBaseUrlToHref,
  ...props
}) {
  const { i18n } = useDocusaurusContext();
  const currentLanguage = i18n.currentLocale;

  const { navbar } = configurations;

  // Get translations for the current language
  const navbarTranslations = translations[currentLanguage]?.navbar || {};

  // Create reverse mapping: translatedLabel -> originalLabel
  const reverseNavbarTranslations = Object.fromEntries(
    Object.entries(navbarTranslations).map(
      ([originalLabel, translatedLabel]) => [
        translatedLabel.toLowerCase(),
        originalLabel.toLowerCase(),
      ]
    )
  );

  // Helper function to get original label
  function getOriginalLabel(translatedLabel) {
    return (
      reverseNavbarTranslations[translatedLabel.toLowerCase()] ||
      translatedLabel.toLowerCase()
    );
  }

  const configNavbarItems = navbar.map((item) => item.label.toLowerCase());
  const configNavbarItemsOriginal = configNavbarItems.map(getOriginalLabel);

  // Fallback icons mapping
  const icons = {
    guides: "BookOpen",
    docs: "BookOpen",
    documentation: "BookOpen",
    "api reference": "CodeSimple",
    changelog: "Megaphone",
    home: "House",
  };

  const possibleValues = Object.keys(icons);

  // Valid if every navbar item either matches the fallback or has an icon defined.
  const isValid = configNavbarItemsOriginal.every(
    (item) =>
      possibleValues.includes(item) ||
      navbar.find((i) => i.label.toLowerCase() === item)?.icon
  );
  console.log(navbar);

  let Icon;
  let displayIcon = false;
  if (label && typeof label === "string") {
    const originalLabel = getOriginalLabel(label);
    // Locate the current configuration item using the original label.
    const currentItem = navbar.find(
      (item) => item.label.toLowerCase() === originalLabel
    );
    if (currentItem && currentItem.icon) {
      // Use the icon defined in the configuration.
      const formattedIconName = toCamelCaseWithCapitalized(currentItem.icon);
      Icon = PhosphorIcons[formattedIconName];
      displayIcon = true;
    } else if (possibleValues.includes(originalLabel)) {
      // Fallback to the pre-defined mapping.
      Icon = PhosphorIcons[icons[originalLabel]];
      displayIcon = isValid;
    }
  }

  const iconClass = "wd_navbar_icon";

  const toUrl = useBaseUrl(to);
  const activeBaseUrl = useBaseUrl(activeBasePath);
  const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });
  const isExternalLink = label && href && !isInternalUrl(href);

  const linkContentProps = html
    ? { dangerouslySetInnerHTML: { __html: html } }
    : {
        children: (
          <>
            {displayIcon && Icon && (
              <Icon weight="bold" className={iconClass} />
            )}
            {label}
            {isExternalLink && (
              <IconExternalLink
                {...(isDropdownLink && { width: 12, height: 12 })}
              />
            )}
          </>
        ),
      };

  if (href) {
    return (
      <Link
        href={prependBaseUrlToHref ? normalizedHref : href}
        {...props}
        {...linkContentProps}
      />
    );
  }
  return (
    <Link
      to={toUrl}
      isNavLink
      {...((activeBasePath || activeBaseRegex) && {
        isActive: (_match, location) =>
          activeBaseRegex
            ? isRegexpStringMatch(activeBaseRegex, location.pathname)
            : location.pathname.startsWith(activeBaseUrl),
      })}
      {...props}
      {...linkContentProps}
    />
  );
}
