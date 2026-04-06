import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({children}) => {
    const { user } = useAuth();
    if (user)
        return children;
    else
        return <Navigate to='/login' replace />
}