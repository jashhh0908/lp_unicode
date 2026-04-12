import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Users } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { getDocuments, updateDocument, exportDocument } from '../services/docService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';

export default function DocumentEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();
    const { user } = useAuth();
    const textAreaRef = useRef(null);

    const [title, setTitle] = useState("Loading...");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [ownerId, setOwnerId] = useState(null); // Document creator
    const [activeUsers, setActiveUsers] = useState([]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const data = await updateDocument(id, title, content);
            console.log("Updated: ", data);
        } catch (error) {
            console.error("Failed to save document:", error);
        } finally {
            setIsSaving(false);
        }    
    }

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const blob = await exportDocument(id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title || 'document'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export PDF:", error);
        } finally {
            setIsExporting(false);
        }
    }
    
    const handleTextChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent); 

        socket.emit("doc:change", {
            documentId: id,
            content: newContent,
            lastUpdated: Date.now()
        });
    };

    useEffect(() => {
        if(!socket || !id || !user) return;

        socket.emit("joinDoc", {documentId: id, userId: user.userInfo.id});
        socket.on("doc:load", (doc) => {
            setTitle(doc.title);
            setContent(doc.content);
            setOwnerId(doc.createdBy); // Capture the owner's ID
        });
        socket.on("doc:update", ({ content }) => {
            if (textAreaRef.current) {
                const { selectionStart, selectionEnd } = textAreaRef.current;
                setContent(content);
                
                setTimeout(() => {
                    if (textAreaRef.current) {
                        textAreaRef.current.setSelectionRange(selectionStart, selectionEnd);
                    }
                }, 0);
            } else {
                setContent(content);
            }
        });
        socket.on("presence:update", ({ users }) => {
            setActiveUsers(users);
        });
        const heartbeat = setInterval(() => {
            socket.emit("heartbeat", { documentId: id });
        }, 10000);
        return () => {
            socket.emit("leaveDoc", { documentId: id });
            socket.off("doc:load");
            socket.off("doc:update");
            socket.off("presence:update");
            clearInterval(heartbeat);
        };
    }, [socket, id, user]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-slate-800">
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
                    {user?.userInfo?.id === ownerId && (
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
                    <div className="flex -space-x-2 overflow-hidden">
                        {activeUsers.map((activeUser) => (
                            <div 
                                key={activeUser.clientId}
                                title={`User ID: ${activeUser.userId}`}
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-600 text-white flex items-center justify-center font-bold text-xs cursor-help"
                            >
                                {activeUser.userId.slice(-1).toUpperCase()} 
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto py-8 px-4 flex justify-center">
                <div className="bg-white shadow-md border border-slate-200 w-full max-w-[816px] min-h-[1056px] p-12 lg:p-24 focus-within:ring-1 focus-within:ring-indigo-100">
                    <textarea 
                        ref={textAreaRef}
                        className="w-full h-full min-h-[800px] resize-none border-none focus:outline-none text-slate-800 text-base leading-relaxed"
                        placeholder="Start typing..."
                        value={content}
                        onChange={handleTextChange}
                    ></textarea>
                </div>
            </main>
            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                docTitle={title}
                id={id}
            />
        </div>
    );
}
