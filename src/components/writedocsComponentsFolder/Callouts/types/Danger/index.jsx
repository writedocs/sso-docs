import React from "react";
import "./danger.css";

export default function Danger({ title, children }) {
  return (
    <div
      className={`${
        !title && "no-title-admonition"
      } theme-admonition theme-admonition-danger admonition_Gfwi alert alert--danger admonition_src-theme-Admonition-Layout-styles-module`}
    >
      <div className="admonitionHeading_f1Ed admonitionHeading_src-theme-Admonition-Layout-styles-module">
        <span className="admonitionIcon_kpSf admonitionIcon_src-theme-Admonition-Layout-styles-module">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="17"
            viewBox="0 0 18 17"
            fill="none"
          >
            <path
              d="M7.27249 2.19366L1.19239 12.3439C1.06704 12.561 1.00071 12.8071 1.00001 13.0578C0.999304 13.3085 1.06425 13.555 1.18839 13.7728C1.31253 13.9906 1.49154 14.1721 1.70759 14.2992C1.92365 14.4263 2.16923 14.4947 2.4199 14.4974H14.5801C14.8308 14.4947 15.0763 14.4263 15.2924 14.2992C15.5085 14.1721 15.6875 13.9906 15.8116 13.7728C15.9357 13.555 16.0007 13.3085 16 13.0578C15.9993 12.8071 15.933 12.561 15.8076 12.3439L9.72751 2.19366C9.59954 1.98269 9.41935 1.80826 9.20434 1.68721C8.98933 1.56616 8.74675 1.50256 8.5 1.50256C8.25325 1.50256 8.01067 1.56616 7.79566 1.68721C7.58065 1.80826 7.40046 1.98269 7.27249 2.19366Z"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M8.50024 5.8833V8.75466"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M8.50024 11.6261H8.50838"
              strokeWidth="1.8"
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
