import React from "react";
import Example from "./Example";

const Request = ({ title, children }) => {
  return <Example title={title} children={children} type="request" />;
};

export default Request;
