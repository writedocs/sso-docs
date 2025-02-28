import React from "react";
import { Monitor } from "@phosphor-icons/react";
import "./training.css";

export default function Training({ title, children }) {
  return (
    <div
      className={`${
        !title && "no-title-admonition"
      } theme-admonition theme-admonition-training admonition_Gfwi alert alert--training admonition_src-theme-Admonition-Layout-styles-module`}
    >
      <div className="admonitionHeading_f1Ed admonitionHeading_src-theme-Admonition-Layout-styles-module">
        <span className="admonitionIcon_training admonitionIcon_kpSf admonitionIcon_src-theme-Admonition-Layout-styles-module">
          <Monitor size={16} color="#080808" weight="bold" />
        </span>
        {title}
      </div>
      <div className="admonitionContent_UjKb admonitionContent_src-theme-Admonition-Layout-styles-module">
        {children}
      </div>
    </div>
  );
}
