import React from "react";
import "./styles.css";

export default function SavePopup({ inputToken }) {
  return (
    <div className="popup">
      {inputToken ? "API token saved successfully!" : "API token Removed"}
    </div>
  );
}
