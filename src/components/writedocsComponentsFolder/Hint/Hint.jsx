// src/components/Tooltip.jsx
import React, { useState } from "react";
import "./hint.css";

const Hint = ({ children, hint, placement = "top" }) => {
  const [hover, setHover] = useState(false);

  const getPlacementClass = () => {
    switch (placement) {
      case "top":
        return "tooltip-top";
      case "bottom":
        return "tooltip-bottom";
      case "left":
        return "tooltip-left";
      case "right":
        return "tooltip-right";
      default:
        return "tooltip-top";
    }
  };

  return (
    <span className="tooltip-container" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
      {hover && <div className={`tooltip-box ${getPlacementClass()}`}>{hint}</div>}
    </span>
  );
};

export default Hint;
