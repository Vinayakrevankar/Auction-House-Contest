import React, { createContext, useContext, useState } from 'react';

// Define types for the context value and provider props
interface AuthContextProps {
  userJWTToken: string | null;
  setUserJWTToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userJWTToken, setUserJWTToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ userJWTToken, setUserJWTToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
