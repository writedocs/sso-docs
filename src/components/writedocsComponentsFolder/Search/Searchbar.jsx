import React, { useState, useMemo } from "react";
import "./styles.css";

const filterTable = (tableElement, searchTerm) => {
  if (!React.isValidElement(tableElement)) return tableElement;

  return React.cloneElement(tableElement, {
    ...tableElement.props,
    children: React.Children.map(tableElement.props.children, (child) => {
      // Only modify <tbody>
      if (child?.type === "tbody") {
        const filteredRows = React.Children.toArray(
          child.props.children
        ).filter((row) => {
          // For each row, check if any cell contains the search term
          return React.Children.toArray(row.props.children).some((cell) => {
            return cell.props.children
              ?.toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          });
        });

        if (!filteredRows.length) {
          return null;
        }

        return React.cloneElement(child, {
          ...child.props,
          children: filteredRows,
        });
      }
      // Leave other children (thead, tfoot, etc.) as is.
      return child;
    }),
  });
};

const filterContent = (content, searchTerm) => {
  if (!searchTerm.trim()) return content;

  if (React.isValidElement(content)) {
    const { children, className } = content.props || {};

    // 1) Handle wrapper: a div with class "table-wrapper"
    if (content.type === "div" && (className || "").includes("table-wrapper")) {
      const childArray = React.Children.toArray(children);

      const filteredChildren = childArray.map((child) => {
        if (
          React.isValidElement(child) &&
          (child.type === "table" ||
            (child.props.className || "").includes("table"))
        ) {
          return filterTable(child, searchTerm);
        }
        // For any other child, recursively filter.
        return filterContent(child, searchTerm);
      });

      const hasNonNullChild = filteredChildren.some((fc) => fc !== null);
      if (!hasNonNullChild) return null;

      return React.cloneElement(content, {
        ...content.props,
        children: filteredChildren,
      });
    }

    // 2) Handle tables directly (if not wrapped)
    if (content.type === "table" || (className || "").includes("table")) {
      return filterTable(content, searchTerm);
    }

    // 3) Handle other special components, e.g., CardList or AccordionGroup
    if (
      content.type?.name === "CardList" ||
      (className || "").includes("card-list")
    ) {
      return React.cloneElement(content, {
        ...content.props,
        children: React.Children.map(content.props.children, (child) => {
          const matchesTitle = child.props?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesDescription = child.props?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

          return matchesTitle || matchesDescription ? child : null;
        }),
      });
    }

    if (
      content.type?.name === "AccordionGroup" ||
      (className || "").includes("accordion-group")
    ) {
      return React.cloneElement(content, {
        ...content.props,
        children: React.Children.map(content.props.children, (child) => {
          if (
            child.props?.title?.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return child;
          }
          return null;
        }),
      });
    }

    // 4) Otherwise, if it has children, filter them recursively.
    if (children) {
      const filteredChildren = React.Children.map(children, (child) =>
        filterContent(child, searchTerm)
      );
      const hasValidChild = filteredChildren?.some((fc) => fc !== null);
      if (!hasValidChild) return null;
      return React.cloneElement(content, {
        ...content.props,
        children: filteredChildren,
      });
    }
  }

  // For non-elements or when no filtering applies, return as is.
  return content;
};

const Searchbar = ({
  children,
  searchPlaceholder = "Search...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChildren = useMemo(() => {
    return React.Children.map(children, (child) =>
      filterContent(child, searchTerm)
    );
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
