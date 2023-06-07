import React from 'react';

export const AuthContext = React.createContext({ auth: false, setAuth: (auth: boolean) => {} });
export const PasswordContext = React.createContext({ password: '', setPassword: (password: string) => {} });


