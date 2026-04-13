import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { updateDocument, exportDocument, restoreVersion } from '../services/docService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';
import EditorHeader from '../components/EditorHeader';
import EditorBody from '../components/EditorBody';
import HistorySidebar from '../components/HistorySidebar';
import VersionPreviewModal from '../components/VersionPreviewModal';

export default function DocumentEditor() {
    const { id } = useParams();
    const { socket } = useSocket() || {};
    const { user } = useAuth();
    const textAreaRef = useRef(null);

    const [title, setTitle] = useState("Loading...");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [previewVersion, setPreviewVersion] = useState(null);
    const [ownerId, setOwnerId] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);

    const handleRestore = async (versionId) => {
        try {
            await restoreVersion(id, versionId);
            // Socket emission from backend handles state updates for all users
            setIsHistoryOpen(false);
        } catch (error) {
            console.error("Failed to restore version:", error);
            alert("Failed to restore version");
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateDocument(id, title, content);
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

        if (socket) {
            socket.emit("doc:change", {
                documentId: id,
                content: newContent,
                lastUpdated: Date.now()
            });
        }
    };

    useEffect(() => {
        if(!socket || !id || !user) return;

        socket.emit("joinDoc", {documentId: id, userId: user.userInfo.id});
        socket.on("doc:load", (doc) => {
            setTitle(doc.title);
            setContent(doc.content);
            setOwnerId(doc.createdBy); 
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
            <EditorHeader 
                title={title}
                setTitle={setTitle}
                handleSave={handleSave}
                handleExport={handleExport}
                setIsShareModalOpen={setIsShareModalOpen}
                setIsHistoryOpen={setIsHistoryOpen}
                isSaving={isSaving}
                isExporting={isExporting}
                ownerId={ownerId}
                currentUserId={user?.userInfo?.id}
                activeUsers={activeUsers}
            />

            <div className="flex-1 flex overflow-hidden">
                <EditorBody 
                    textAreaRef={textAreaRef}
                    content={content}
                    handleTextChange={handleTextChange}
                />

                <HistorySidebar 
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    docId={id}
                    onPreview={(version) => setPreviewVersion(version)}
                />
            </div>

            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                docTitle={title}
                id={id}
            />

            <VersionPreviewModal 
                version={previewVersion}
                onRestore={handleRestore}
                onClose={() => setPreviewVersion(null)}
            />
        </div>
    );
}
