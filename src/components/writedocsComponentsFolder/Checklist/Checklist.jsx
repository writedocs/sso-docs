// src/components/Checklist.jsx
import React, { useState } from "react";
import "./checklist.css";

const Checklist = ({ children }) => {
  // Assume the children is a <ul> element; extract its <li> children.
  const listItems =
    children && children.props && children.props.children ? React.Children.toArray(children.props.children) : [];

  // Create state for each list item, initially unchecked.
  const [checkedItems, setCheckedItems] = useState(listItems.map(() => false));

  const toggleItem = (index) => {
    setCheckedItems((prev) => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  return (
    <div className="checklist">
      {listItems.map((item, index) => {
        if (item.props?.children) {
          return (
            <div key={index} className="checklist-item" style={{ marginBottom: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checkedItems[index]}
                  onChange={() => toggleItem(index)}
                  style={{ marginRight: "0.5rem" }}
                />
                <span>{item.props?.children}</span>
              </label>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Checklist;
