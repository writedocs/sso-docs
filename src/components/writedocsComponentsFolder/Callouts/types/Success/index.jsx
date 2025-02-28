import React from "react";
import "./success.css";

export default function Success({ title, children }) {
  return (
    <div
      className={`${
        !title && "no-title-admonition"
      } theme-admonition theme-admonition-tip admonition_Gfwi alert alert--success admonition_src-theme-Admonition-Layout-styles-module`}
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
            <path
              d="M9.26756 3.00337C10.0372 1.66914 11.9628 1.66913 12.7324 3.00337L12.8846 3.2671C13.3372 4.05171 14.2606 4.4342 15.1354 4.19942L15.4295 4.12051C16.9171 3.72127 18.2787 5.08289 17.8795 6.57055L17.8006 6.8646C17.5658 7.73944 17.9483 8.66284 18.7329 9.11543L18.9966 9.26756C20.3309 10.0372 20.3309 11.9628 18.9966 12.7324L18.7329 12.8846C17.9483 13.3372 17.5658 14.2606 17.8006 15.1354L17.8795 15.4295C18.2787 16.9171 16.9171 18.2787 15.4295 17.8795L15.1354 17.8006C14.2606 17.5658 13.3372 17.9483 12.8846 18.7329L12.7324 18.9966C11.9628 20.3309 10.0372 20.3309 9.26756 18.9966L9.11543 18.7329C8.66284 17.9483 7.73944 17.5658 6.8646 17.8006L6.57055 17.8795C5.08289 18.2787 3.72127 16.9171 4.12051 15.4295L4.19942 15.1354C4.4342 14.2606 4.05171 13.3372 3.2671 12.8846L3.00337 12.7324C1.66914 11.9628 1.66913 10.0372 3.00337 9.26756L3.2671 9.11543C4.05171 8.66284 4.4342 7.73944 4.19942 6.8646L4.12051 6.57055C3.72127 5.08289 5.08289 3.72127 6.57055 4.12051L6.8646 4.19942C7.73944 4.4342 8.66284 4.05171 9.11543 3.2671L9.26756 3.00337Z"
              strokeWidth="2"
            ></path>
            <path
              d="M8 11L10 13L14 9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
