import React, { useState } from 'react';
import { X, UserPlus, Users, Check, Clock, Shield, User, Mail, ChevronDown, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { getDocCollaborators, addUserAccess, approveRequest, removeUserAccess } from '../services/docService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

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

    const socket = useSocket();
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
            console.log(`User ${type}ing removed successully`)
        } catch (error) {
            alert(error.response?.data?.error || "Failed to remove access");
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
                        <div className="p-6 space-y-6">
                            {/* Invite Input */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 flex items-center space-x-2 px-1">
                                    <UserPlus className="h-4 w-4 text-indigo-500" />
                                    <span>Add people via email</span>
                                </label>
                                <div className="flex space-x-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            type="email" 
                                            placeholder="Enter email address..."
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div className="relative min-w-[100px]">
                                        <select 
                                            value={accessType}
                                            onChange={(e) => setAccessType(e.target.value)}
                                            className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold text-slate-700 cursor-pointer"
                                        >
                                            <option value="view">View</option>
                                            <option value="edit">Edit</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    <button 
                                        onClick={handleInvite}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-100 flex-shrink-0"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Active Collaborators</h3>
                                <div className="space-y-1">
                                    {collaborators.map((person) => (
                                        <div key={person._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                                                    {getInitials(person.name)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{person.name}</p>
                                                    <p className="text-xs text-slate-500">{person.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {person.roles.map(role => (
                                                    <div key={role} className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                            {role}
                                                        </span>
                                                        {currentUser?.userInfo?.id === owner?._id && (
                                                            <button 
                                                                onClick={() => handleRemoveAccess(person.email, role === 'Viewer' ? 'view' : 'edit')}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                                title={`Remove ${role} access`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-4">
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <div key={req.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                                                {getInitials(req.user.name)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-slate-800">{req.user.name}</p>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                                    <span className="text-[10px] text-slate-500 font-medium uppercase">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{req.user.email}</p>
                                                <div className="mt-2 flex items-center text-[11px] font-bold text-indigo-600">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Requested {req.type} access
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <button 
                                                onClick={() => handleRequestResponse(req.user._id, req.type, 'approve')}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleRequestResponse(req.user._id, req.type, 'reject')}
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
