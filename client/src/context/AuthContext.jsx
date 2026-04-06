import { useState } from "react";
import { useContext } from "react";
import { createContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const loginSession = (userData) => {
        setUser(userData);
    }
    
    const logoutSession = () => {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{user, loginSession, logoutSession}}>
            {children}
        </AuthContext.Provider>
    )
}