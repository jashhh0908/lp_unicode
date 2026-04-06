import { Activity, Server, Wifi, Cpu } from 'lucide-react';

export default function AuthLayout({ children }) {
    const systemStatus = 'connected';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden relative">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/30 rounded-full blur-[100px] animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px] animate-float-delayed pointer-events-none"></div>

            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center space-x-2 bg-white/70 md:bg-slate-800/60 backdrop-blur-md border border-slate-200 md:border-slate-700/50 py-1.5 px-3 rounded-full text-xs font-mono select-none z-50 shadow-sm transition-colors duration-300">
                <div className={`h-2 w-2 rounded-full ${systemStatus === 'connected' ? 'bg-emerald-500 md:bg-emerald-400' : 'bg-rose-500 md:bg-rose-400'} animate-pulse`}></div>
                <span className="text-slate-700 md:text-slate-300 font-semibold md:font-normal uppercase">
                    WS_CONNECTED
                </span>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10 min-h-[100vh] overflow-y-auto">
                <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]">
                    {children}
                </div>
            </div>

            <div className="hidden md:flex w-1/2 bg-slate-900 text-white flex-col p-12 relative z-0 shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 mt-12"></div>
                <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full z-10 relative">
                    <div className="mb-6 inline-flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 py-2 px-4 rounded-full">
                        <Activity className="h-4 w-4 text-indigo-400" />
                        <span className="font-semibold uppercase tracking-widest text-xs text-indigo-300">Live Telemetry</span>
                    </div>
                    
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-tight">
                        Real-time bridge <br/>is active.
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12 font-light">
                        Experience sub-millisecond precision. Monitor live connections, data streams, and active nodes.
                    </p>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex flex-col items-start transition-all duration-300 hover:bg-slate-800/60 group">
                            <div className="p-2.5 bg-blue-500/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                <Server className="h-6 w-6 text-blue-400" />
                            </div>
                            <span className="text-3xl font-bold tracking-tight mb-1 text-white">99.9<span className="text-xl text-slate-500">%</span></span>
                            <span className="text-slate-400 text-sm font-medium">Uptime SLA</span>
                        </div>

                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex flex-col items-start transition-all duration-300 hover:bg-slate-800/60 group">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                <Wifi className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div className="flex items-baseline space-x-1 mb-1 text-white">
                                <span className="text-3xl font-bold tracking-tight">12</span>
                                <span className="text-xl text-slate-500 font-bold">ms</span>
                            </div>
                            <span className="text-slate-400 text-sm font-medium">Global Latency</span>
                        </div>

                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex flex-col items-start transition-all duration-300 hover:bg-slate-800/60 col-span-2 relative overflow-hidden">
                            <div className="flex items-center space-x-5 w-full relative z-10">
                                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <Cpu className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-slate-200 font-semibold text-sm">WebSocket Handshake</div>
                                        <div className="text-indigo-400 text-xs font-mono">OK</div>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 relative overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 animate-[pulse_2s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
