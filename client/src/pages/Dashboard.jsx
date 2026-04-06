import { Link } from 'react-router-dom';

export default function Dashboard() {
    const dummyUser = { name: 'test user' };
    const systemStatus = 'connected';

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Terminal Console
                </h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-slate-800 py-1.5 px-3 rounded-full text-xs font-mono border border-slate-700">
                        <div className={`h-2 w-2 rounded-full ${systemStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></div>
                        <span className="text-slate-300 uppercase">{systemStatus}</span>
                    </div>
                    <Link 
                        to="/login"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 block"
                    >
                        Sign Out
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto mt-20 text-center">
                <h2 className="text-4xl font-bold mb-4">Welcome back, {dummyUser.name}</h2>
                <p className="text-slate-400 text-lg">Your dashboard and real-time map data will appear here.</p>
            </div>
        </div>
    );
}
