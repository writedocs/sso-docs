import React, { useState, useEffect } from "react";
import "./checklist.css";

// Simple hash function for strings.
const getHash = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const Checklist = ({ children, checklistId }) => {
  // Assume the children is a <ul> element; extract its <li> children.
  const listItems =
    children && children.props && children.props?.children ? React.Children.toArray(children.props.children) : [];

  // Get page key from current location; fallback to "default".
  const pageKey = typeof window !== "undefined" && window.location ? window.location.pathname : "default";

  // Create a content string by joining each list item's text content.
  const contentString = listItems
    .map((item) => (typeof item.props?.children === "string" ? item.props?.children.trim() : ""))
    .join("||");

  // Compute a stable instance key using the page key and a hash of the content.
  const stableInstanceKey = `${pageKey}__checklist__${getHash(contentString)}`;
  const instanceKey = checklistId || stableInstanceKey;

  // Create state for each list item, initializing from localStorage if available.
  const [checkedItems, setCheckedItems] = useState(() => {
    const defaultState = listItems.map(() => false);
    if (typeof window !== "undefined") {
      try {
        const storedData = localStorage.getItem("checklist");
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (
            parsed &&
            parsed[instanceKey] &&
            Array.isArray(parsed[instanceKey]) &&
            parsed[instanceKey].length === defaultState.length
          ) {
            return parsed[instanceKey];
          }
        }
      } catch (error) {
        console.error("Error loading checklist state", error);
      }
    }
    return defaultState;
  });

  const toggleItem = (index) => {
    setCheckedItems((prev) => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  // Save the updated state in localStorage under the "checklist" key.
  useEffect(() => {
    if (typeof window !== "undefined") {
      let checklistData = {};
      try {
        const storedData = localStorage.getItem("checklist");
        if (storedData) {
          checklistData = JSON.parse(storedData);
        }
      } catch (error) {
        console.error("Error parsing checklist data", error);
      }
      checklistData[instanceKey] = checkedItems;
      localStorage.setItem("checklist", JSON.stringify(checklistData));
    }
  }, [checkedItems, instanceKey]);

  return (
    <div className="checklist">
      {listItems.map((item, index) => {
        if (item.props?.children) {
          return (
            <div key={index} className="checklist-item" style={{ marginBottom: "0.5rem" }}>
              <input
                type="checkbox"
                checked={checkedItems[index]}
                onChange={() => toggleItem(index)}
                style={{ marginRight: "0.5rem", cursor: "pointer" }}
              />
              <span>{item.props?.children}</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Checklist;
