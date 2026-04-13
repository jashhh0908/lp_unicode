import React from 'react';
import { UserPlus, Mail, ChevronDown, Trash2 } from 'lucide-react';

export default function CollaboratorsTab({ 
    id,
    email, 
    setEmail, 
    accessType, 
    setAccessType, 
    handleInvite, 
    collaborators, 
    owner, 
    currentUser, 
    handleRemoveAccess,
    getInitials 
}) {
    return (
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
    );
}
