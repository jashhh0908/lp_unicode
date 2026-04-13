import React from 'react';
import { X, RotateCcw, FileText, User, Calendar } from 'lucide-react';

const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function VersionPreviewModal({ version, onRestore, onClose }) {
    if (!version) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Previewing Version</h2>
                            <p className="text-sm text-slate-500 flex items-center mt-0.5">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatTime(version.editedAt)}
                                <span className="mx-2">•</span>
                                <User className="h-3 w-3 mr-1" />
                                Edited by {version.editedBy?.name || 'System'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content Preview */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 flex justify-center">
                    <div className="bg-white shadow-sm border border-slate-200 w-full max-w-[816px] min-h-[1056px] p-12 lg:p-20 pointer-events-none select-none">
                        <h1 className="text-3xl font-bold text-slate-900 mb-8 border-b-2 border-slate-100 pb-4">
                            {version.content.title}
                        </h1>
                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                            {version.content.content}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onRestore(version._id);
                            onClose();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 flex items-center"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore This Version
                    </button>
                </div>
            </div>
        </div>
    );
}

import { Clock } from 'lucide-react';
