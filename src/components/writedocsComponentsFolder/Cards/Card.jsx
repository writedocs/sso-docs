import React from "react";
import "./cards.css";
import * as PhosphorIcons from "@phosphor-icons/react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import Link from "@docusaurus/Link";

// Helper: Convert icon names (e.g., "component-name") to PascalCase ("ComponentName").
function toCamelCaseWithCapitalized(str) {
  return str.replace(/-./g, (match) => match.charAt(1).toUpperCase()).replace(/^./, (match) => match.toUpperCase());
}

// Renders either an image or an icon based on the provided props.
function CardMedia({ image, imageDark, icon, iconSize, iconType, title, compact }) {
  const { colorMode } = useColorMode();
  const imageSrc = colorMode === "dark" && imageDark ? imageDark : image;
  const defaultIconSize = compact ? 42 : 32;
  if (image) {
    return (
      <div className="card_image_container">
        <img src={useBaseUrl(imageSrc)} className="card_image no_zoom" alt={title} />
      </div>
    );
  }

  if (icon) {
    const isImageIcon = /\.(png|jpe?g|gif|svg)$/i.test(icon);
    if (isImageIcon) {
      return <img src={icon} className="icon_img no_zoom" alt={title} />;
    } else {
      const formattedIconName = toCamelCaseWithCapitalized(icon);
      const IconComponent = PhosphorIcons[formattedIconName];
      return <IconComponent size={iconSize || defaultIconSize} weight={iconType} />;
    }
  }

  return null;
}

// Renders the title and content (either description or children).
function CardBody({ title, description, children }) {
  const renderContent = () => {
    if (children) {
      return <div className="card_content">{children}</div>;
    } else if (description) {
      return <p className="card_content">{description}</p>;
    }
    return null;
  };

  return (
    <div className="card_body">
      <h3>{title}</h3>
      {renderContent()}
    </div>
  );
}

// Wraps the card in an external link (<a>) or an internal link (<Link>) when a link prop is provided.
function CardWrapper({ link, classes, children, compact }) {
  if (link) {
    const isExternalLink = !(link.startsWith("/") || link.startsWith("#"));
    if (isExternalLink) {
      return (
        <a className={classes} target="_blank" href={link}>
          {children}
        </a>
      );
    } else {
      return (
        <Link className={classes} to={link}>
          {children}
        </Link>
      );
    }
  }
  return <div className={`${classes} card_no_link`}>{children}</div>;
}

// Main Card component that supports both default (vertical) and compact (horizontal) layouts.
export default function Card({
  image,
  imageDark,
  icon,
  title,
  link,
  description,
  iconSize,
  iconType,
  children,
  compact, // New prop to toggle compact (horizontal) layout.
}) {
  // Base classes for the card.
  const baseClasses = description ? "wd_icon_card" : "wd_icon_card title_only_card";
  // Optionally add a class when in compact mode.
  const classes = compact ? `${baseClasses} compact_card` : baseClasses;

  return (
    <CardWrapper compact={compact} link={link} classes={classes}>
      <CardMedia
        image={image}
        imageDark={imageDark}
        icon={icon}
        iconSize={iconSize}
        iconType={iconType}
        title={title}
        compact={compact}
      />
      <CardBody compact={compact} title={title} description={description} children={children} />
    </CardWrapper>
  );
}
