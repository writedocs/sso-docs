import React, { useState, useMemo } from "react";
import "./styles.css";

// Recursive function to extract text from nested React nodes
const extractText = (node) => {
  if (typeof node === "string" || typeof node === "number") {
    return node;
  }
  if (React.isValidElement(node)) {
    return React.Children.toArray(node.props.children).map(extractText).join("");
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  return "";
};

const filterTable = (tableElement, searchTerm) => {
  if (!React.isValidElement(tableElement)) return tableElement;

  let tableHasMatches = false;

  const filteredChildren = React.Children.map(tableElement.props.children, (child) => {
    if (!child) return child;

    const childType = child.type;
    const childMdxType = child.props?.mdxType;

    // Process tbody elements
    if (childType === "tbody" || childMdxType === "tbody") {
      const filteredRows = React.Children.toArray(child.props.children).filter((row) => {
        // Check each cell in the row
        return React.Children.toArray(row.props.children).some((cell) => {
          const text = extractText(cell.props.children).toLowerCase();
          return text.includes(searchTerm.toLowerCase());
        });
      });
      if (filteredRows.length > 0) {
        tableHasMatches = true;
        return React.cloneElement(child, {
          ...child.props,
          children: filteredRows,
        });
      }
      return null;
    }

    // Process thead and similar (without filtering)
    if (childType === "thead" || childMdxType === "thead") {
      return child;
    }

    // For tables that have rows directly under <table>
    if (childType === "tr" || childMdxType === "tr") {
      const rowMatches = React.Children.toArray(child.props.children).some((cell) => {
        const text = extractText(cell.props.children).toLowerCase();
        return text.includes(searchTerm.toLowerCase());
      });
      if (rowMatches) {
        tableHasMatches = true;
        return child;
      }
      return null;
    }

    return child;
  });

  if (!tableHasMatches) return null;

  return React.cloneElement(tableElement, {
    ...tableElement.props,
    children: filteredChildren,
  });
};

const filterContent = (content, searchTerm) => {
  if (!searchTerm.trim()) return content;

  if (React.isValidElement(content)) {
    const { children, className } = content.props || {};

    // Handle table wrappers
    if (content.type === "div" && (className || "").includes("table-wrapper")) {
      const childArray = React.Children.toArray(children);

      const filteredChildren = childArray.map((child) => {
        if (
          React.isValidElement(child) &&
          (child.type === "table" ||
            child.props?.mdxType === "table" ||
            (child.props.className || "").includes("table"))
        ) {
          return filterTable(child, searchTerm);
        }
        return filterContent(child, searchTerm);
      });

      const hasNonNullChild = filteredChildren.some((fc) => fc !== null);
      if (!hasNonNullChild) return null;

      return React.cloneElement(content, {
        ...content.props,
        children: filteredChildren,
      });
    }

    // Handle tables directly
    if (content.type === "table" || content.props?.mdxType === "table" || (className || "").includes("table")) {
      return filterTable(content, searchTerm);
    }

    // Handle other special components (CardList, AccordionGroup, etc.)
    if (content.type?.name === "CardList" || (className || "").includes("card-list")) {
      return React.cloneElement(content, {
        ...content.props,
        children: React.Children.map(content.props.children, (child) => {
          const matchesTitle = child.props?.title?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesDescription = child.props?.description?.toLowerCase().includes(searchTerm.toLowerCase());

          return matchesTitle || matchesDescription ? child : null;
        }),
      });
    }

    if (content.type?.name === "AccordionGroup" || (className || "").includes("accordion-group")) {
      return React.cloneElement(content, {
        ...content.props,
        children: React.Children.map(content.props.children, (child) => {
          if (child.props?.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
            return child;
          }
          return null;
        }),
      });
    }

    // Recursively filter children
    if (children) {
      const filteredChildren = React.Children.map(children, (child) => filterContent(child, searchTerm));
      const hasValidChild = filteredChildren?.some((fc) => fc !== null);
      if (!hasValidChild) return null;
      return React.cloneElement(content, {
        ...content.props,
        children: filteredChildren,
      });
    }
  }

  return content;
};

const Searchbar = ({ children, searchPlaceholder = "Search...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChildren = useMemo(() => {
    return React.Children.map(children, (child) => filterContent(child, searchTerm));
  }, [children, searchTerm]);

  return (
    <div className={`search-wrapper ${className}`}>
      <div className="search-bar">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="search-content">{filteredChildren}</div>
    </div>
  );
};

export default Searchbar;
