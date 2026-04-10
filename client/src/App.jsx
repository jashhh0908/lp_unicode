import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login.jsx';
import SignupPage from './pages/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DocumentEditor from './pages/DocumentEditor.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

export default function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute> 
                        }/>
                        <Route path="/document/:id" element={
                            <ProtectedRoute>
                                <DocumentEditor />
                            </ProtectedRoute>
                        }/>
                    </Routes>
                </Router>
            </SocketProvider>
            
        </AuthProvider>
    );
}
