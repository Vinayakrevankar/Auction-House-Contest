import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types for the context value and provider props
interface AuthContextType {
  userJWTToken: string | null;
  setUserJWTToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userJWTToken, setUserJWTToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ userJWTToken, setUserJWTToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
