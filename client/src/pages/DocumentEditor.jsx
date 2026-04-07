import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDocuments, updateDocument } from '../services/docService';

export default function DocumentEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [title, setTitle] = useState("Loading...");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
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
    useEffect(() => {
        const loadDocument = async () => {
            try {
                const data = await getDocuments();
                const currentDocument = data.documents.find(doc => doc._id === id);
                if(currentDocument) {
                    setTitle(currentDocument.title);
                    setContent(currentDocument.content);
                } else {
                    console.error("Document not found!");
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error("Failed to load document:", error);
            }
        }
        if(id)
            loadDocument();
    }, [id]);

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
                        onClick={handleSave}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-full font-medium text-sm flex items-center transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2"/>
                        Save
                     </button>
                     <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer">
                        U
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto py-8 px-4 flex justify-center">
                <div className="bg-white shadow-md border border-slate-200 w-full max-w-[816px] min-h-[1056px] p-12 lg:p-24 focus-within:ring-1 focus-within:ring-indigo-100">
                    <textarea 
                        className="w-full h-full min-h-[800px] resize-none border-none focus:outline-none text-slate-800 text-base leading-relaxed"
                        placeholder="Start typing..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>
            </main>
        </div>
    );
}
