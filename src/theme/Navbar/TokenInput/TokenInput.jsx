import React, { useState } from "react";
import "./styles.css";

export default function TokenInput({
  showPopup,
  inputToken,
  setInputToken,
  handleSaveToken,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  return (
    <div className="apiTokenInputContainer">
      <input
        type="text"
        placeholder="Enter API token"
        value={inputToken}
        onChange={(e) => setInputToken(e.target.value)}
        className="apiTokenInput"
        disabled={showPopup}
      />
      <div
        className="infoIconWrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <span className="infoIcon">i</span>
        {showTooltip && (
          <div className="tooltip">
            Entering your API Token here will swap it into code blocks during
            this current visit. The Token isn't saved in any client-side storage
            mechanisms (such as cookies, local storage, or session storage).
            Start a free trial to get an API Token.
          </div>
        )}
      </div>
      <button onClick={handleSaveToken} className="saveButton">
        Save
      </button>
    </div>
  );
}
