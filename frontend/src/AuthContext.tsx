import { createContext, useContext } from 'react';

export type UserInfo = {
  username: string;
  emailAddress: string;
  userType: "seller" | "buyer";
  userId: string;
  role: "admin" | "user";
  token: string;
}

// Define types for the context value and provider props
interface AuthContextProps {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
