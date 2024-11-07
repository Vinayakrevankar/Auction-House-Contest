import { createContext, useContext } from 'react';

// Define types for the context value and provider props
interface AuthContextProps {
  userJWTToken: string | null;
  setUserJWTToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
