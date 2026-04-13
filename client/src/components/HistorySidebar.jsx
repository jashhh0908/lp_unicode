import React, { useState, useEffect } from 'react';
import { X, Clock, RotateCcw, User, Calendar, ChevronRight } from 'lucide-react';
import { getDocHistory, restoreVersion } from '../services/docService';

const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function HistorySidebar({ isOpen, onClose, docId, onPreview }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const data = await getDocHistory(docId);
            setHistory(data.sorted_doc_Version || []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && docId) {
            fetchHistory();
        }
    }, [isOpen, docId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2 text-slate-800">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <h2 className="font-bold text-lg">Version History</h2>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3 p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-sm text-slate-500 font-medium">Loading history...</p>
                    </div>
                ) : history.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {history.map((version, index) => (
                            <div 
                                key={version._id} 
                                onClick={() => onPreview(version)}
                                className="p-5 hover:bg-slate-50 transition-all cursor-pointer group relative border-b border-slate-50 active:scale-[0.98]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest border border-indigo-100">
                                                V{history.length - index}
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-400">
                                                {formatTime(version.editedAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm font-bold text-slate-700">
                                            <User className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                            {version.editedBy?.name || "System User"}
                                        </div>
                                        <div className="text-xs text-slate-500 line-clamp-2 italic font-medium leading-relaxed mt-1">
                                            {version.content?.content?.substring(0, 70)}...
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all self-center ml-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                            <Clock className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-slate-800 font-bold text-lg">No History Yet</p>
                            <p className="text-slate-500 text-sm mt-1">Make some edits to see past versions appear here.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium leading-tight">
                    Every time you save, a new version is created. Restoring will replace the current content with a past snapshot.
                </p>
            </div>
        </div>
    );
}
