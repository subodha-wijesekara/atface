'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, ArrowRight, Loader2, School } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Room {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDesc, setNewRoomDesc] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await fetch('/api/rooms');
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName) return;

        setIsCreating(true);
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newRoomName, description: newRoomDesc }),
            });

            if (response.ok) {
                const data = await response.json();
                setRooms([data.room, ...rooms]);
                setShowCreateModal(false);
                setNewRoomName('');
                setNewRoomDesc('');
                // Optional: Redirect to new room immediately
                // router.push(`/rooms/${data.room._id}`);
            }
        } catch (error) {
            console.error('Failed to create room', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">My Rooms</h1>
                    <p className="text-muted-foreground">Manage your classes and spaces.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Create Room
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                    <School className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">No rooms created yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first room to get started.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-blue-500 font-medium hover:underline"
                    >
                        Create a Room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <Link href={`/rooms/${room._id}`} key={room._id} className="group">
                            <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-md hover:bg-card/60 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <School className="w-24 h-24 transform rotate-12" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Class</p>
                                            <h3 className="text-xl font-bold leading-tight">{room.name}</h3>
                                        </div>
                                    </div>
                                    {room.description && (
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                            {room.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                    <span className="text-xs text-muted-foreground">
                                        Created {new Date(room.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm font-semibold text-blue-500 group-hover:translate-x-1 transition-transform">
                                        Open <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/10 m-4 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">Create New Room</h2>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Room Name</label>
                                <input
                                    type="text"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                    placeholder="e.g. Grade 10 Science"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Description (Optional)</label>
                                <textarea
                                    value={newRoomDesc}
                                    onChange={(e) => setNewRoomDesc(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none resize-none h-24"
                                    placeholder="Brief description about the class..."
                                />
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
                                    disabled={!newRoomName || isCreating}
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
