import React from "react";
import { Wrench } from "@phosphor-icons/react";
import "./support.css";

export default function Support({ title, children }) {
  return (
    <div
      className={`${
        !title && "no-title-admonition"
      } theme-admonition theme-admonition-support admonition_Gfwi alert alert--support admonition_src-theme-Admonition-Layout-styles-module`}
    >
      <div className="admonitionHeading_f1Ed admonitionHeading_src-theme-Admonition-Layout-styles-module">
        <span className="admonitionIcon_support admonitionIcon_kpSf admonitionIcon_src-theme-Admonition-Layout-styles-module">
          <Wrench size={16} weight="bold" color="#080808" />
        </span>
        {title}
      </div>
      <div className="admonitionContent_UjKb admonitionContent_src-theme-Admonition-Layout-styles-module">
        {children}
      </div>
    </div>
  );
}
