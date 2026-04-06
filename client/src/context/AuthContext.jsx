import { useState } from "react";
import { useContext } from "react";
import { createContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        if(savedUser)
            return JSON.parse(savedUser);
        else
            return null;
    });
    const loginSession = (userData) => {
        setUser(userData);
        const data = JSON.stringify(userData);
        localStorage.setItem('user', data);
    }
    
    const logoutSession = () => {
        setUser(null);
        localStorage.removeItem('user');
    }

    return (
        <AuthContext.Provider value={{user, loginSession, logoutSession}}>
            {children}
        </AuthContext.Provider>
    )
}