import React, { useState, useMemo } from "react";
import "./styles.css";

const Searchbar = ({
  children,
  searchPlaceholder = "Search...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filterContent = (content) => {
    if (!searchTerm.trim()) return content;

    if (React.isValidElement(content)) {
      // Handle CardList
      if (
        content.type?.name === "CardList" ||
        content.props?.className?.includes("card-list")
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

            if (matchesTitle || matchesDescription) {
              return child;
            }
            return null;
          }),
        });
      }

      // Handle AccordionGroup
      if (
        content.type?.name === "AccordionGroup" ||
        content.props?.className?.includes("accordion-group")
      ) {
        return React.cloneElement(content, {
          ...content.props,
          children: React.Children.map(content.props.children, (child) => {
            if (
              child.props?.title
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
            ) {
              return child;
            }
            return null;
          }),
        });
      }

      // Handle table components
      if (
        content.type === "table" ||
        content.props?.className?.includes("table")
      ) {
        return React.cloneElement(content, {
          ...content.props,
          children: React.Children.map(content.props.children, (child) => {
            if (child.type === "tbody") {
              return React.cloneElement(child, {
                children: child.props.children.filter((row) =>
                  React.Children.toArray(row.props.children).some((cell) =>
                    cell.props.children
                      .toString()
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                ),
              });
            }
            return child;
          }),
        });
      }

      // Handle nested children
      if (content.props?.children) {
        const filteredChildren = React.Children.map(
          content.props.children,
          (child) => filterContent(child)
        );

        // Only return element if it has matching children
        const hasValidChildren = filteredChildren?.some(
          (child) => child !== null
        );
        if (hasValidChildren) {
          return React.cloneElement(content, {
            ...content.props,
            children: filteredChildren,
          });
        }
        return null;
      }
    }

    return content;
  };

  const filteredChildren = useMemo(() => {
    return React.Children.map(children, (child) => filterContent(child));
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
