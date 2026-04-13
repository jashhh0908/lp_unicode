import React from 'react';
import { Clock, Shield, Check } from 'lucide-react';

export default function RequestsTab({ 
    requests, 
    handleRequestResponse, 
    getInitials 
}) {
    return (
        <div className="p-6 space-y-4">
            {requests.length > 0 ? (
                requests.map((req) => (
                    <div key={req._id || req.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                                {getInitials(req.user?.name)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-800">{req.user?.name || 'Unknown User'}</p>
                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                    <span className="text-[10px] text-slate-500 font-medium uppercase">{new Date(req.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-500">{req.user?.email}</p>
                                <div className="mt-2 flex items-center text-[11px] font-bold text-indigo-600">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Requested {req.type} access
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <button 
                                onClick={() => handleRequestResponse(req.user?._id, req.type, 'approve')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                                Approve
                            </button>
                            <button 
                                onClick={() => handleRequestResponse(req.user?._id, req.type, 'reject')}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-4 bg-slate-100 rounded-full">
                        <Check className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No pending requests</p>
                </div>
            )}
        </div>
    );
}
