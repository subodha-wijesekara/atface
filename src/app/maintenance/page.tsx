'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, ArrowRight, Loader2, School, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Room {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export default function MaintenancePage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Create/Edit State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [roomName, setRoomName] = useState('');
    const [roomDesc, setRoomDesc] = useState('');

    // Delete State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleSaveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName) return;

        setIsCreating(true);
        try {
            const url = editingRoom ? `/api/rooms/${editingRoom._id}` : '/api/rooms';
            const method = editingRoom ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: roomName, description: roomDesc }),
            });

            if (response.ok) {
                const data = await response.json();
                if (editingRoom) {
                    setRooms(rooms.map(r => r._id === editingRoom._id ? data.room : r));
                } else {
                    setRooms([data.room, ...rooms]);
                }
                closeModal();
            }
        } catch (error) {
            console.error('Failed to save room', error);
        } finally {
            setIsCreating(false);
        }
    };

    const confirmDeleteRoom = async () => {
        if (!roomToDelete) return;

        setIsDeleting(true);
        // Optimistic update
        const previousRooms = [...rooms];
        setRooms(rooms.filter(r => r._id !== roomToDelete._id));
        setShowDeleteModal(false); // Close immediately for responsiveness

        try {
            const response = await fetch(`/api/rooms/${roomToDelete._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // Revert if failed
                setRooms(previousRooms);
                console.error("Failed to delete room");
            }
        } catch (error) {
            console.error("Delete failed", error);
            setRooms(previousRooms);
        } finally {
            setIsDeleting(false);
            setRoomToDelete(null);
        }
    };

    const promptDelete = (room: Room) => {
        setRoomToDelete(room);
        setShowDeleteModal(true);
    };

    const openCreateModal = () => {
        setEditingRoom(null);
        setRoomName('');
        setRoomDesc('');
        setShowCreateModal(true);
    };

    const openEditModal = (room: Room) => {
        setEditingRoom(room);
        setRoomName(room.name);
        setRoomDesc(room.description || '');
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingRoom(null);
        setRoomName('');
        setRoomDesc('');
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Maintenance</h1>
                    <p className="text-muted-foreground">Select a class to manage students.</p>
                </div>
                <button
                    onClick={openCreateModal}
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
                        onClick={openCreateModal}
                        className="text-blue-500 font-medium hover:underline"
                    >
                        Create a Room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <Link href={`/maintenance/${room._id}`} key={room._id} className="group">
                            <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-md hover:bg-card/60 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                    <School className="w-24 h-24 transform rotate-12" />
                                </div>

                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openEditModal(room);
                                        }}
                                        className="p-2 rounded-xl backdrop-blur-md transition-colors bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                                        title="Rename Class"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            promptDelete(room);
                                        }}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl backdrop-blur-md transition-colors border border-red-500/20"
                                        title="Delete Class"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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
                                        Manage <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create/Edit Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/10 m-4 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">{editingRoom ? 'Edit Room' : 'Create New Room'}</h2>
                        <form onSubmit={handleSaveRoom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Room Name</label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                    placeholder="e.g. Grade 10 Science"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1">Description (Optional)</label>
                                <textarea
                                    value={roomDesc}
                                    onChange={(e) => setRoomDesc(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none resize-none h-24"
                                    placeholder="Brief description about the class..."
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={closeModal}
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
                                    {editingRoom ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm p-6 rounded-3xl shadow-2xl border border-white/10 m-4 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Delete Room?</h2>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{roomToDelete?.name}"</span>?
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl font-semibold hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteRoom}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
