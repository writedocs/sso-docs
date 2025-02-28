import React from "react";
import "./warning.css";

export default function Warning({ title, children }) {
  return (
    <div
      className={`${
        !title && "no-title-admonition"
      } theme-admonition theme-admonition-warning admonition_Gfwi alert alert--warning admonition_src-theme-Admonition-Layout-styles-module`}
    >
      <div className="admonitionHeading_f1Ed admonitionHeading_src-theme-Admonition-Layout-styles-module">
        <span className="admonitionIcon_kpSf admonitionIcon_src-theme-Admonition-Layout-styles-module">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
          >
            <circle cx="10" cy="10" r="9" strokeWidth="2"></circle>
            <circle cx="10" cy="15" r="1" fill="#EC6F3D"></circle>
            <path d="M10 5V11" strokeWidth="2" strokeLinecap="round"></path>
          </svg>
        </span>
        {title}
      </div>
      <div className="admonitionContent_UjKb admonitionContent_src-theme-Admonition-Layout-styles-module">
        {children}
      </div>
    </div>
  );
}
