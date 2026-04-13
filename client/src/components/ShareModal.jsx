import React, { useState, useEffect } from 'react';
import { X, Users, Clock } from 'lucide-react';
import { getDocCollaborators, addUserAccess, approveRequest, removeUserAccess } from '../services/docService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import CollaboratorsTab from './CollaboratorsTab';
import RequestsTab from './RequestsTab';

const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
};

export default function ShareModal({ isOpen, onClose, docTitle, id }) {
    const [activeTab, setActiveTab] = useState('people');
    const [email, setEmail] = useState('');
    const [accessType, setAccessType] = useState('view');
    const [collaborators, setCollaborators] = useState([]);
    const [requests, setRequests] = useState([]);
    const [owner, setOwner] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user: currentUser } = useAuth();

    const { socket } = useSocket() || {};

    const handleInvite = async () => {
        try {
            await addUserAccess(id, email, accessType);
            setEmail(''); 
            fetchCollaborators(); 
        } catch (error) {
            alert(error.response?.data?.error || "Failed to invite user");
        }
    };
    
    const handleRequestResponse = async (userId, type, action) => {
        try {
            await approveRequest(id, { user: userId, type, action });
            fetchCollaborators(); 
        } catch (error) {
            alert("Action failed!");
        }
    };

    const handleRemoveAccess = async (email, type) => {
        try {
            await removeUserAccess(id, email, type);
            fetchCollaborators(); 
        } catch (error) {
            alert(error.response?.data?.error || "Failed to remove access");
        }
    };

    const fetchCollaborators = async () => {
        try {
            setIsLoading(true);
            const data = await getDocCollaborators(id);
            const roleMap = new Map();

            data.collaborators.view.forEach(u => {
                roleMap.set(u._id, { ...u, roles: ['Viewer'] });
            });

            data.collaborators.edit.forEach(u => {
                if (roleMap.has(u._id)) {
                    roleMap.get(u._id).roles.push('Editor');
                } else {
                    roleMap.set(u._id, { ...u, roles: ['Editor'] });
                }
            });

            const finalCollaborators = Array.from(roleMap.values()).filter(u => 
                u._id !== currentUser.userInfo.id 
            );

            setOwner(data.owner);
            setCollaborators(finalCollaborators);
            setRequests(data.requests.filter(req => req.status === 'pending'));
        } catch (error) {
            console.error("Failed to fetch collaborators:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCollaborators(); 
        }
    }, [isOpen, id]);

    useEffect(() => {
        if (!socket || !isOpen) return;
        const handleUpdate = () => fetchCollaborators();
        socket.on("doc:access:request", handleUpdate);
        socket.on("doc:access:update", handleUpdate);
        return () => {
            socket.off("doc:access:request", handleUpdate);
            socket.off("doc:access:update", handleUpdate);
        };
    }, [socket, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Share "{docTitle}"</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage who can view and edit this document.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex px-6 pt-2 border-b border-slate-100">
                    <button 
                        onClick={() => setActiveTab('people')}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
                            activeTab === 'people' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>People</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 relative ${
                            activeTab === 'requests' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        <span>Requests</span>
                        <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 ring-2 ring-white">
                            {requests.length}
                        </span>
                    </button>
                </div>

                <div className="max-h-[450px] overflow-y-auto">
                    {activeTab === 'people' ? (
                        <CollaboratorsTab 
                            id={id}
                            email={email}
                            setEmail={setEmail}
                            accessType={accessType}
                            setAccessType={setAccessType}
                            handleInvite={handleInvite}
                            collaborators={collaborators}
                            owner={owner}
                            currentUser={currentUser}
                            handleRemoveAccess={handleRemoveAccess}
                            getInitials={getInitials}
                        />
                    ) : (
                        <RequestsTab 
                            requests={requests}
                            handleRequestResponse={handleRequestResponse}
                            getInitials={getInitials}
                        />
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={onClose}
                        className="text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
