import React, { createContext, useContext, useState } from 'react';
import { UserInfo } from "./api";

interface AuthContextProps {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo | null) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize userInfo directly from localStorage for persistence
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  });

  // Wrap setUserInfo to also update localStorage
  const setUserInfo = (info: UserInfo | null) => {
    if (info) {
      localStorage.setItem('userInfo', JSON.stringify(info));
    } else {
      localStorage.removeItem('userInfo'); // Clear storage on logout
    }
    setUserInfoState(info);
  };

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
