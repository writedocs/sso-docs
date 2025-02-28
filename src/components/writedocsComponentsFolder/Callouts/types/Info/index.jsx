import React from "react";
import "./info.css";

export default function Info({ title, children }) {
  return (
    <div
      className={`${
        !title && "no-title-admonition"
      } theme-admonition theme-admonition-info admonition_Gfwi alert alert--info admonition_src-theme-Admonition-Layout-styles-module`}
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
            <circle
              cx="9"
              cy="5"
              r="1"
              transform="rotate(-180 9 5)"
              fill="#4860F5"
            ></circle>
            <path d="M9 13L9 9" strokeWidth="2" strokeLinecap="round"></path>
            <path
              d="M1 12V6C1 3.23858 3.23858 1 6 1H12C14.7614 1 17 3.23858 17 6V12C17 14.7614 14.7614 17 12 17H6C3.23858 17 1 14.7614 1 12Z"
              strokeWidth="2"
            ></path>
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
