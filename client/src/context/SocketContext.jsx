import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthContext";
import { io } from 'socket.io-client';
const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null);
    const {user} = useAuth();

    useEffect(() => {
        if(user) {
            const newSocket = io("http://localhost:5000", {
                withCredentials: true
            });
            setSocket(newSocket);
            return () => newSocket.close();
        }

    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};