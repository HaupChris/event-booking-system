import React from 'react';

export const AuthContext = React.createContext({
  auth: false,
  setAuth: (_auth: boolean) => {},
  isAdmin: false,
  setIsAdmin: (_isAdmin: boolean) => {},
});
export const TokenContext = React.createContext({ token: '', setToken: (_token: string) => {} });
