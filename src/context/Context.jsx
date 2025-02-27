import React, { createContext, useState } from 'react';

// Crea el contexto
export const MyContext = createContext();

// Crea un proveedor de contexto
export const MyProvider = ({ children }) => {
  const [value, setvalue] = useState('');
  return (
    <MyContext.Provider value={{ value, setvalue }}>
      {children}
    </MyContext.Provider>
  );
};