'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';

interface User {
    _id: string;
    username: string;
    fullName?: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newTeacher, setNewTeacher] = useState({ username: '', password: '', fullName: '' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            if (activeTab === 'teachers') {
                const res = await fetch('/api/users/teachers');
                if (res.ok) setUsers(await res.json());
            } else {
                // Placeholder for students fetching
                // const res = await fetch('/api/users/students');
                setUsers([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTeacher, role: 'teacher' }),
            });

            if (res.ok) {
                setIsAddModalOpen(false);
                setNewTeacher({ username: '', password: '', fullName: '' });
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create teacher');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Users</h1>
                    <p className="text-muted-foreground">Manage teachers, students, and approvals.</p>
                </div>
                {activeTab === 'teachers' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Teacher
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-border/50 pb-1">
                <button
                    onClick={() => setActiveTab('teachers')}
                    className={`pb-3 px-4 text-sm font-semibold transition-all relative ${activeTab === 'teachers' ? 'text-blue-500' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Teachers
                    {activeTab === 'teachers' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`pb-3 px-4 text-sm font-semibold transition-all relative ${activeTab === 'students' ? 'text-blue-500' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Students / Faces
                    {activeTab === 'students' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Username</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No users found in this category.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                {user.fullName || 'No Name'}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">@{user.username}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-semibold border border-blue-500/20 capitalize">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-sm font-semibold text-blue-500 hover:text-blue-400">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Teacher Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Add New Teacher</h2>
                                <p className="text-muted-foreground text-sm mt-1">Create a new teacher account.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTeacher} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={newTeacher.fullName}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Ex: John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Username</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={newTeacher.username}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Ex: johndoe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={newTeacher.password}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-3 rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all flex justify-center items-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
