import React, { createContext, useState } from 'react';

export const UserPositionContext = createContext();

export const UserPositionProvider = ({ children }) => {
  const [userPosition, setUserPosition] = useState(null);

  const updateUserPosition = (position) => {
    setUserPosition(position);
  };

  return (
    <UserPositionContext.Provider
      value={{
        userPosition,
        updateUserPosition,
      }}
    >
      {children}
    </UserPositionContext.Provider>
  );
};
