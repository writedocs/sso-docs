import React from "react";

export default function extractCodeAndLanguage(child) {
  let code = "";
  let language = "";

  // If the child is just a string, use it as code.
  if (typeof child === "string") {
    code = child;
  } else if (React.isValidElement(child) && child.props) {
    // First, try to get the language from the child's className (if any)
    if (child.props.className) {
      const match = child.props.className.match(/language-(\w+)/);
      if (match) {
        language = match[1];
      }
    }
    // Next, get the code content from the child's children.
    if (typeof child.props.children === "string") {
      code = child.props.children;
    } else if (Array.isArray(child.props.children)) {
      // Join array items if they’re strings.
      code = child.props.children.join("");
    } else if (React.isValidElement(child.props.children)) {
      // Sometimes the code is nested deeper (like <pre><code>...</code></pre>)
      const inner = child.props.children;
      if (inner.props && inner.props.className) {
        const match = inner.props.className.match(/language-(\w+)/);
        if (match) {
          language = match[1];
        }
      }
      code = inner.props.children || "";
    }
  }

  return { code, language };
}
