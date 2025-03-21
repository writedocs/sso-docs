import React from "react";
import "./steps.css";

const Steps = ({ children, hideNumbers, titleSize = "h3" }) => {
  const generateContent = () => {
    const newContent = [];
    let current = { title: "", content: [] };
    React.Children.forEach(children, (child) => {
      if ([titleSize].includes(child.type.name)) {
        if (current.title) newContent.push(current);
        current = { title: "", content: [] };
        current["title"] = child.props.children;
      } else current["content"].push(child);
    });
    newContent.push(current);
    return newContent;
  };

  return (
    <div className="steps-container">
      <div className={`line line_${titleSize}`} />
      <div>
        {generateContent().map((content, index) => (
          <div key={index} className="step-item">
            {!hideNumbers && <div className={`step-number step-number_${titleSize}`}>{index + 1}</div>}
            {hideNumbers && <div className={`step-noNumber step-noNumber${titleSize}`}></div>}
            <div className={`step-body step-body_${titleSize}`}>
              <div
                id={`${content.title.replace(/\s+/g, "-").replace(/\./g, "").toLowerCase()}`}
                className={`step-title step-title_${titleSize}`}
              >
                {content.title}
                <a
                  href={`#${content.title.replace(/\s+/g, "-").replace(/\./g, "").toLowerCase()}`}
                  class="hash-link"
                  aria-label={`Direct link to ${content.title}`}
                  title={`Direct link to ${content.title}`}
                />
              </div>
              <div className="step-content">{content.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Steps;
