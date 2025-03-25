import React from 'react';

export const AuthContext = React.createContext({ auth: false, setAuth: (auth: boolean) => {}, isAdmin: false, setIsAdmin: (isAdmin: boolean) => {} });
export const TokenContext = React.createContext({ token: '', setToken: (token: string) => {} });


