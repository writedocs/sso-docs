import React, { createContext, useContext, useState } from "react";

const ExampleContext = createContext();

export const ExampleProvider = ({ children }) => {
  const [examples, setExamples] = useState({ request: null, response: null });

  const registerExample = (type, data) => {
    setExamples((prev) => ({ ...prev, [type]: data }));
  };

  return (
    <ExampleContext.Provider value={{ examples, registerExample }}>
      {children}
    </ExampleContext.Provider>
  );
};

export const useExampleContext = () => useContext(ExampleContext);
