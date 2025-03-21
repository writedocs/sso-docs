import React from "react";
import "./styles.css";
import ReactMarkdown from "react-markdown";

// Helper to parse a markdown link from a string.
// It detects markdown links of the form [text](url) and returns an <a> element.
const parseMarkdownLink = (text) => {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  const match = text.match(markdownLinkRegex);

  if (match) {
    const [, linkText, linkUrl] = match;
    return <a href={linkUrl}>{linkText}</a>;
  }

  return text;
};

// Helper to extract plain text from a markdown link string.
// This is useful to generate a slug for the anchor ID.
const getPlainText = (text) => {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  const match = text.match(markdownLinkRegex);
  return match ? match[1] : text;
};

// Helper to generate a slug from a string, suitable for an anchor ID.
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphen
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-"); // Replace multiple hyphens with a single one

const Parameter = ({ name, type, required = false, default: defaultValue, children }) => {
  // If name is a string, extract its plain text to create an anchor ID.
  const plainName = typeof name === "string" ? getPlainText(name) : "";
  const anchorId = slugify(plainName);

  return (
    <div className="api-parameter">
      {/* The name becomes an anchor with an id and href that points to itself */}
      <strong id={anchorId} className="name anchor anchorWithStickyNavbar_LWe7">
        {typeof name === "string" ? parseMarkdownLink(name) : name}

        {type && (
          <small className="small_tag">
            <code>{typeof type === "string" ? parseMarkdownLink(type) : type}</code>
          </small>
        )}
        {required && (
          <small className="required_tag">
            <code className="required_code">required</code>
          </small>
        )}
        {defaultValue !== undefined && (
          <small className="default_tag">
            <code>{`default: ${defaultValue}`}</code>
          </small>
        )}
        <a
          href={`#${anchorId}`}
          className="hash-link"
          aria-label={`Direct link to ${plainName}`}
          title={`Direct link to ${plainName}`}
        ></a>
      </strong>

      <br />
      {children}
      <hr className="parameter_hr" />
    </div>
  );
};

export default Parameter;
