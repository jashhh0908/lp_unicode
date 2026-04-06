import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useState } from 'react';
import { login } from '../services/authService';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            console.log("Sending login payload");
            const data = await login(email, password);
            console.log('Success: ', data);
            navigate('/dashboard')
        } catch (err) {
            console.error("Error from backend:", err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Try again.');
        }
    };

    return (
        <AuthLayout>
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
                    Welcome back
                </h1>
                <p className="text-slate-500 text-sm sm:text-base">
                    Enter your credentials to access the console.
                </p>
            </div>

            <form className="flex flex-col" onSubmit={handleSubmit}>
                <div className="relative h-12 mb-5">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        placeholder="Email Address" 
                        className="w-full h-full pl-11 pr-4 bg-white/50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="relative h-12 mb-4">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input 
                        type="password" 
                        required
                        value={password}
                        placeholder="Password" 
                        className="w-full h-full pl-11 pr-4 bg-white/50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between text-sm mt-2 mb-8 min-h-[24px]">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors group">
                        <div className="relative flex items-center justify-center">
                            <input type="checkbox" className="peer appearance-none w-4 h-4 border border-slate-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500/30 transition-colors cursor-pointer" />
                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span>Remember me</span>
                    </label>
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Forgot password?</a>
                </div>

                <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-medium shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(79,70,229,0.6)] focus:ring-4 focus:ring-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0">
                    <span className="tracking-wide">Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-all">
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    );
}
