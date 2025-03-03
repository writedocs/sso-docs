import React from "react";
import Example from "./Example";

const Response = ({ title, children }) => {
  return <Example title={title} children={children} type="response" />;
};

export default Response;
