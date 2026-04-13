import React from 'react';
import { ArrowLeft, Save, Download, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EditorHeader({ 
    title, 
    setTitle, 
    handleSave, 
    handleExport, 
    setIsShareModalOpen,
    setIsHistoryOpen,
    isSaving, 
    isExporting, 
    ownerId, 
    currentUserId, 
    activeUsers 
}) {
    const navigate = useNavigate();

    return (
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="mr-3 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                
                <div className="flex flex-col">
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-medium bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded px-2 py-1 text-slate-800 focus:outline-none transition-colors w-64 md:w-96"
                        placeholder="Untitled Document"
                    />
                    <div className="flex space-x-4 px-2 mt-0.5 text-sm text-slate-500">
                        <button className="hover:text-slate-800 hover:bg-slate-100 px-1 rounded cursor-pointer">File</button>
                        <button className="hover:text-slate-800 hover:bg-slate-100 px-1 rounded cursor-pointer">Edit</button>
                        <button className="hover:text-slate-800 hover:bg-slate-100 px-1 rounded cursor-pointer">View</button>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg font-medium text-sm flex items-center transition-colors"
                    title="Download as PDF"
                >
                    <Download className="w-4 h-4 mr-2"/>
                    {isExporting ? "Exporting..." : "Export"}
                </button>

                <button 
                    onClick={() => setIsHistoryOpen(prev => !prev)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    title="Version History"
                >
                    <Clock className="h-5 w-5" />
                </button>

                {currentUserId === ownerId && (
                    <button 
                        onClick={() => setIsShareModalOpen(true)}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-full font-bold text-sm flex items-center transition-all shadow-sm"
                    >
                        <Users className="w-4 h-4 mr-2"/>
                        Share
                    </button>
                )}

                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-full font-bold text-sm flex items-center transition-all shadow-md shadow-indigo-100"
                >
                    <Save className="w-4 h-4 mr-2"/>
                    {isSaving ? "Saving..." : "Save"}
                </button>

                <div className="flex -space-x-2 overflow-hidden ml-2">
                    {activeUsers.map((activeUser) => (
                        <div 
                            key={activeUser.clientId}
                            title={`User connected via ${activeUser.clientId}`}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-600 text-white flex items-center justify-center font-bold text-xs cursor-help"
                        >
                            {activeUser.userId.slice(-1).toUpperCase()} 
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}
