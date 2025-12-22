'use client';

import { useState, useEffect } from 'react';
import { Plus, School, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface User {
    _id: string;
    username: string;
    fullName: string;
}

interface Room {
    _id: string;
    name: string;
    description?: string;
    teacherId?: User;
    createdAt: string;
}

export default function AdminClassesPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomDesc, setRoomDesc] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [roomsRes, teachersRes] = await Promise.all([
                fetch('/api/rooms'),
                fetch('/api/users/teachers')
            ]);

            if (roomsRes.ok) setRooms(await roomsRes.json());
            if (teachersRes.ok) setTeachers(await teachersRes.json());
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName) return;

        setIsCreating(true);
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: roomName,
                    description: roomDesc,
                    teacherId: selectedTeacher || null
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRooms([data.room, ...rooms]);
                setShowCreateModal(false);
                setRoomName('');
                setRoomDesc('');
                setSelectedTeacher('');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to create room', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Classes</h1>
                    <p className="text-muted-foreground">Create classes and assign them to teachers.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Create New Class
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                    <School className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">No classes found</h3>
                    <p className="text-muted-foreground">Create a class to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room._id} className="group relative">
                            <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between overflow-hidden">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                                            <School className="w-5 h-5" />
                                        </div>
                                        {room.teacherId ? (
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
                                                {room.teacherId.username}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                                                Unassigned
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold leading-tight mb-2">{room.name}</h3>
                                    {room.description && (
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                            {room.description}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                        Added {new Date(room.createdAt).toLocaleDateString()}
                                    </span>
                                    {/* Link to general rooms management or specific backend edit if needed */}
                                    <Link href={`/rooms/${room._id}`} className="text-blue-500 hover:text-blue-600 text-sm font-semibold flex items-center gap-1">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/10 m-4 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">Create New Class</h2>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Class Name</label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                    placeholder="e.g. Grade 11 History"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Description</label>
                                <textarea
                                    value={roomDesc}
                                    onChange={(e) => setRoomDesc(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none resize-none h-20"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Assign Teacher</label>
                                <select
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none text-foreground appearance-none"
                                >
                                    <option value="">-- Select a Teacher --</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.username} ({teacher.fullName || 'No Name'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!roomName || isCreating}
                                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
