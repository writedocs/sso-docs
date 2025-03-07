import React from "react";
import "./styles.css";

const Parameter = ({ name, type, required = false, children }) => (
  <div className="api-parameter">
    <strong className="name">{name}</strong>{" "}
    <small className="small_tag">
      <code>{type}</code>
    </small>{" "}
    {required && (
      <small className="required_tag">
        <code>required</code>
      </small>
    )}
    <br />
    {children}
    <hr className="parameter_hr" />
  </div>
);

export default Parameter;
