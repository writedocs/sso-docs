import React from "react";
import "./transpara.css";

export default function Transpara({ title, children }) {
  return (
    <div
      className={`${
        !title && "no-title-admonition"
      } theme-admonition theme-admonition-transpara admonition_Gfwi alert alert--transpara admonition_src-theme-Admonition-Layout-styles-module`}
    >
      <div className="admonitionHeading_f1Ed admonitionHeading_src-theme-Admonition-Layout-styles-module">
        <span className="admonitionIcon_kpSf admonitionIcon_src-theme-Admonition-Layout-styles-module">
          <img
            className="callout_img"
            src="https://raw.githubusercontent.com/transpara/documentation/main/visual-kpi-docs/static/img/favicon.png"
            alt="Callout Icon"
          />
        </span>
        {title}
      </div>
      <div className="admonitionContent_UjKb admonitionContent_src-theme-Admonition-Layout-styles-module">
        {children}
      </div>
    </div>
  );
}
