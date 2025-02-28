import React, { createContext, useContext, useState } from 'react';

// Create the context
const ApiTokenContext = createContext();

// Hook to access the API token context
export const useApiToken = () => useContext(ApiTokenContext);

// Provider component to wrap the app
export const ApiTokenProvider = ({ children }) => {
  const [apiToken, setApiToken] = useState('');

  const saveApiToken = (newToken) => {
    setApiToken(newToken);
  };

  return (
    <ApiTokenContext.Provider value={{ apiToken, saveApiToken }}>
      {children}
    </ApiTokenContext.Provider>
  );
};
