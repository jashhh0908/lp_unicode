import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, LogOut, Clock, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createDocument, getDocuments } from '../services/docService';

export default function Dashboard() {
    const [docs, setDocs] = useState([]);

    const { user, logoutSession } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutSession();
        navigate('/login');
    };

    const displayName = user?.userInfo?.name?.split(' ')[0] || 'there';

    const handleCreateDocument = async () => {
        try {
            const data = await createDocument("Untitled Document", "");
            const new_doc_id = data.document._id;
            if (new_doc_id)
                navigate(`/document/${new_doc_id}`);
        } catch (error) {
            console.error("Failed to implicitly create document:", error);
        }
    }
    useEffect(() => {
        const fetchUserDocs = async () => {
            try {
                const data = await getDocuments();
                setDocs(data.documents);
            } catch (err) {
                console.error("Could not load documents: ", err);
            }
        }

        if (user.userInfo.id) {
            fetchUserDocs();
        } else {
            console.error("Login first");
        }
    }, [user.userInfo.id])

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-inner">
                        <FileText className="h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
                        Workspace
                    </h1>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="text-sm font-semibold text-slate-600 flex items-center space-x-2">
                        <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden sm:inline-block">{user?.userInfo?.name || user?.name || 'User'}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Sign Out</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                            Welcome, {displayName}!
                        </h2>
                        <p className="text-slate-500 text-lg">Here is what is happening in your workspace.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <button
                        onClick={handleCreateDocument}
                        className="flex flex-col items-center justify-center h-64 bg-white border-2 border-dashed border-slate-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group flex-shrink-0 cursor-pointer text-slate-500 hover:text-indigo-600 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                    >
                        <div className="p-4 bg-slate-100 group-hover:bg-indigo-100 rounded-full mb-4 transition-colors">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="font-semibold">New Document</span>
                    </button>

                    {docs.map((doc) => (
                        <div key={doc._id} onClick={() => navigate(`/document/${doc._id}`)} className="flex flex-col h-64 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden group">
                            <div className="flex-1 bg-slate-50 border-b border-slate-100 p-5 relative overflow-hidden">
                                <div className="absolute top-4 right-4 p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 z-10">
                                    <MoreVertical className="h-5 w-5" />
                                </div>
                                <div className="space-y-3 mt-2 opacity-30 group-hover:opacity-60 transition-opacity">
                                    <div className="h-2.5 bg-slate-400 rounded-full w-3/4"></div>
                                    <div className="h-2.5 bg-slate-400 rounded-full w-full"></div>
                                    <div className="h-2.5 bg-slate-400 rounded-full w-5/6"></div>
                                    <div className="h-2.5 bg-slate-400 rounded-full w-full"></div>
                                    <div className="h-2.5 bg-slate-400 rounded-full w-2/3"></div>
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="font-bold text-slate-800 truncate mb-1.5">{doc.title}</h3>

                            </div>
                        </div>
                    ))}

                </div>
            </main>
        </div>
    );
}
