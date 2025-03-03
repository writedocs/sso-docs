import React from "react";
import Link from "@docusaurus/Link";
import "./apiCards.css";

export default function APICard({
  title,
  type,
  method,
  description,
  link,
  children,
}) {
  const renderContent = () => {
    if (children) {
      return <div className="card_content">{children}</div>;
    } else if (description) {
      return <p className="card_content">{description}</p>;
    }
  };
  if (!link) {
    return (
      <div className="wd_api_card card_no_link">
        <div className="header">
          <h3>{title}</h3>
          <div
            className={`type_tag ${
              type?.toLowerCase() || method?.toLowerCase()
            }`}
          >
            {type?.toUpperCase() || method?.toUpperCase()}
          </div>
        </div>
        {renderContent()}
      </div>
    );
  }
  return (
    <Link to={link} className="wd_api_card">
      <div className="header">
        <h3>{title}</h3>
        <div
          className={`type_tag ${type?.toLowerCase() || method?.toLowerCase()}`}
        >
          {type?.toUpperCase() || method?.toUpperCase()}
        </div>
      </div>
      {renderContent()}
    </Link>
  );
}
