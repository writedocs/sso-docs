import React from "react";
import Link from "@docusaurus/Link";
import "./apiCards.css";

export default function APICard({ title, type, description, to }) {
  return (
    <Link to={to} className="wd_icon_card">
      <div className="header">
        <h3>{title}</h3>
        <div className={`typeTag ${type.toLowerCase()}`}>
          {type.toUpperCase()}
        </div>
      </div>
      <p>{description}</p>
    </Link>
  );
}
