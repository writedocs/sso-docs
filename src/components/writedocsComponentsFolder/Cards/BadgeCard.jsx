import React from "react";
import Link from "@docusaurus/Link";
import "./badgecards.css";

export default function BadgeCard({ title, tag, description, link, children }) {
  const renderContent = () => {
    if (children) {
      return <div className="badge_card_content">{children}</div>;
    } else if (description) {
      return <p className="badge_card_content">{description}</p>;
    }
  };
  if (!link) {
    return (
      <div className="badge_card card_no_link">
        <div className="header">
          <h3>{title}</h3>
          <div className={`badge_tag`}>{tag}</div>
        </div>
        {renderContent()}
      </div>
    );
  }
  return (
    <Link to={link} className="badge_card">
      <div className="header">
        <h3>{title}</h3>
        <div className={`badge_tag`}>{tag}</div>
      </div>
      {renderContent()}
    </Link>
  );
}
