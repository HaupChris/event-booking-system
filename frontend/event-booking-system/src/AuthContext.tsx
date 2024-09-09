import React from 'react';

type AuthContextType = {
    auth: boolean;
    setAuth: (isAuth: boolean) => void;
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
    adminPermissions: string[];
    setAdminPermissions: (permissions: string[]) => void;
};

export const AuthContext = React.createContext<AuthContextType>({
    auth: false,
    setAuth: () => {},
    isAdmin: false,
    setIsAdmin: () => {},
    adminPermissions: [],
    setAdminPermissions: () => {}
});

type PasswordContextType = {
    password: string;
    setPassword: (password: string) => void;
};

export const PasswordContext = React.createContext<PasswordContextType>({
    password: '',
    setPassword: () => {}
});

type TokenContextType = {
    token: string;
    setToken: (token: string) => void;
};

export const TokenContext = React.createContext<TokenContextType>({
    token: '',
    setToken: () => {}
});