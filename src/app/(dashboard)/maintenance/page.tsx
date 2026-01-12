'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, ArrowRight, Loader2, School, Pencil, Trash2, AlertTriangle, GraduationCap, UserPlus, Eye, EyeOff, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
    _id: string;
    username: string;
    fullName: string;
}

interface Room {
    _id: string;
    name: string;
    description?: string;
    teacherId?: {
        _id: string;
        username: string;
        fullName?: string;
    };
    status?: 'active' | 'pending';
    createdAt: string;
}

export default function MaintenancePage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === 'admin';
    const [activeTab, setActiveTab] = useState<'classes' | 'teachers' | 'requests'>('classes');

    // Data State
    const [rooms, setRooms] = useState<Room[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Room Modal State
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [roomForm, setRoomForm] = useState({ name: '', description: '', teacherId: '' });
    const [isSavingRoom, setIsSavingRoom] = useState(false);

    // Teacher Modal State
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
    const [teacherForm, setTeacherForm] = useState({ username: '', password: '', fullName: '' });
    const [isSavingTeacher, setIsSavingTeacher] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Delete State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'room' | 'teacher', name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchData();

        // Live Auto-Sync: Poll every 3 seconds
        const interval = setInterval(() => {
            fetchData(true); // Silent update
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [roomsRes, teachersRes] = await Promise.all([
                fetch('/api/rooms'),
                fetch('/api/users/teachers')
            ]);

            if (roomsRes.ok) setRooms(await roomsRes.json());
            if (teachersRes.ok) setTeachers(await teachersRes.json());
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // --- Filtering ---
    const activeRooms = rooms.filter(r => r.status === 'active' || !r.status);
    const pendingRooms = rooms.filter(r => r.status === 'pending');

    const filteredRooms = activeRooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.teacherId?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.teacherId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRequests = pendingRooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.teacherId?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.teacherId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTeachers = teachers.filter(teacher =>
        teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // --- Room Handlers ---

    const handleApprove = async (room: Room) => {
        try {
            await fetch(`/api/rooms/${room._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' })
            });
            fetchData();
        } catch (error) {
            console.error("Failed to approve", error);
        }
    };

    const handleSaveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        //@ts-ignore
        if (!roomForm.name) return;

        setIsSavingRoom(true);
        try {
            const url = editingRoom ? `/api/rooms/${editingRoom._id}` : '/api/rooms';
            const method = editingRoom ? 'PATCH' : 'POST';

            // Sanitize payload: teacherId should be null if empty string
            const payload = {
                ...roomForm,
                teacherId: roomForm.teacherId || null
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData(true); // Refetch to get populated fields
                closeRoomModal();
            } else {
                const err = await response.json();
                console.error("Save failed:", err);
                alert(`Failed to save: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to save room', error);
            alert('An unexpected error occurred while saving.');
        } finally {
            setIsSavingRoom(false);
        }
    };

    const openRoomModal = (room?: Room) => {
        if (room) {
            setEditingRoom(room);
            setRoomForm({
                name: room.name,
                description: room.description || '',
                teacherId: room.teacherId?._id || ''
            });
        } else {
            setEditingRoom(null);
            setRoomForm({ name: '', description: '', teacherId: '' });
        }
        setShowRoomModal(true);
    };

    const closeRoomModal = () => {
        setShowRoomModal(false);
        setEditingRoom(null);
        setRoomForm({ name: '', description: '', teacherId: '' });
    };

    // --- Teacher Handlers ---

    const handleSaveTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        // Password is required for new teachers, optional for edits
        if (!teacherForm.username || (!editingTeacher && !teacherForm.password)) return;

        setIsSavingTeacher(true);
        try {
            const url = editingTeacher ? `/api/users/${editingTeacher._id}` : '/api/users';
            const method = editingTeacher ? 'PATCH' : 'POST';

            const body = editingTeacher
                ? { ...teacherForm }
                : { ...teacherForm, role: 'teacher' };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                await fetchData(true);
                closeTeacherModal();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to save teacher');
            }
        } catch (error) {
            console.error('Failed to save teacher', error);
        } finally {
            setIsSavingTeacher(false);
        }
    };

    const openTeacherModal = (teacher?: User) => {
        if (teacher) {
            setEditingTeacher(teacher);
            setTeacherForm({
                username: teacher.username,
                fullName: teacher.fullName || '',
                password: '' // Don't fill password on edit
            });
        } else {
            setEditingTeacher(null);
            setTeacherForm({ username: '', password: '', fullName: '' });
        }
        setShowTeacherModal(true);
    };

    const closeTeacherModal = () => {
        setShowTeacherModal(false);
        setEditingTeacher(null);
        setTeacherForm({ username: '', password: '', fullName: '' });
        setShowPassword(false);
    };

    // --- Delete Handlers ---

    const handleDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            // Optimistic update
            if (itemToDelete.type === 'room') {
                setRooms(prev => prev.filter(r => r._id !== itemToDelete.id));
                await fetch(`/api/rooms/${itemToDelete.id}`, { method: 'DELETE' });
            } else {
                setTeachers(prev => prev.filter(t => t._id !== itemToDelete.id));
                await fetch(`/api/users/${itemToDelete.id}`, { method: 'DELETE' });
            }
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Delete failed", error);
            fetchData(); // Revert on failure
        } finally {
            setIsDeleting(false);
            setItemToDelete(null);
        }
    };


    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
                        {/* Live Sync Indicator */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20 shadow-sm animate-in fade-in zoom-in duration-500">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground">Manage classes and teachers.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-xl w-full sm:w-auto justify-center">
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'classes'
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Classes
                        </button>
                        <button
                            onClick={() => setActiveTab('teachers')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'teachers'
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Teachers
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'requests'
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Requests
                            {pendingRooms.length > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {pendingRooms.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    {/* CLASSES TAB */}
                    {activeTab === 'classes' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => openRoomModal()}
                                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    New Class
                                </button>
                            </div>

                            {filteredRooms.length === 0 ? (
                                <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                                    <School className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">No classes found</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {searchTerm ? "Try adjusting your search terms." : "Create your first class to get started."}
                                    </p>
                                    {!searchTerm && (
                                        <button
                                            onClick={() => openRoomModal()}
                                            className="text-blue-500 font-medium hover:underline"
                                        >
                                            Create a Class
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10 bg-white/5">
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Class Name</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Assigned Teacher</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                                                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredRooms.map((room) => (
                                                    <tr key={room._id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                                    <School className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-semibold">{room.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            {room.teacherId ? (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 text-xs">
                                                                        <GraduationCap className="w-3 h-3" />
                                                                    </div>
                                                                    <span className="font-medium text-foreground/80">{room.teacherId.fullName || room.teacherId.username}</span>
                                                                    <span className="text-muted-foreground text-xs">(@{room.teacherId.username})</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground italic">Unassigned</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-muted-foreground max-w-xs truncate">
                                                            {room.description || "-"}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                                                            {new Date(room.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Link
                                                                    href={`/maintenance/${room._id}`}
                                                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                    title="Manage Students"
                                                                >
                                                                    <ArrowRight className="w-4 h-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        openRoomModal(room);
                                                                    }}
                                                                    className="p-2 text-foreground/70 hover:bg-white/10 rounded-lg transition-colors"
                                                                    title="Edit Class"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setItemToDelete({ id: room._id, type: 'room', name: room.name });
                                                                            setShowDeleteModal(true);
                                                                        }}
                                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                        title="Delete Class"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TEACHERS TAB */}
                    {activeTab === 'teachers' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => openTeacherModal()}
                                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Add Teacher
                                </button>
                            </div>

                            {filteredTeachers.length === 0 ? (
                                <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                                    <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">No teachers found</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {searchTerm ? "Try adjusting your search terms." : "Add your first teacher to get started."}
                                    </p>
                                    {!searchTerm && (
                                        <button
                                            onClick={() => openTeacherModal()}
                                            className="text-blue-500 font-medium hover:underline"
                                        >
                                            Add Teacher
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10 bg-white/5">
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Teacher Info</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Username</th>
                                                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredTeachers.map((teacher) => (
                                                    <tr key={teacher._id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                                    <GraduationCap className="w-5 h-5" />
                                                                </div>
                                                                <span className="font-bold text-lg">{teacher.fullName || "N/A"}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 font-mono text-sm text-foreground/70">
                                                            @{teacher.username}
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => openTeacherModal(teacher)}
                                                                    className="p-2 text-foreground/70 hover:bg-white/10 rounded-lg transition-colors"
                                                                    title="Edit Teacher"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setItemToDelete({ id: teacher._id, type: 'teacher', name: teacher.fullName || teacher.username });
                                                                            setShowDeleteModal(true);
                                                                        }}
                                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                        title="Delete Teacher"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
                <div className="space-y-6">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                            <School className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No pending requests</h3>
                            <p className="text-muted-foreground">
                                {searchTerm ? "Try adjusting your search terms." : "All class requests have been reviewd."}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Class Name</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Requested By</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Requested On</th>
                                            <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredRequests.map((room) => (
                                            <tr key={room._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                                            <Loader2 className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-semibold">{room.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {room.teacherId ? (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 text-xs">
                                                                <GraduationCap className="w-3 h-3" />
                                                            </div>
                                                            <span className="font-medium text-foreground/80">{room.teacherId.fullName || room.teacherId.username}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">Unknown</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-muted-foreground max-w-xs truncate">
                                                    {room.description || "-"}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                                                    {new Date(room.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(room)}
                                                            className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 rounded-lg transition-colors text-sm font-semibold border border-blue-600/20"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setItemToDelete({ id: room._id, type: 'room', name: room.name });
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Room Modal */}
            {
                showRoomModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/10 m-4 animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold mb-6">{editingRoom ? 'Edit Class' : 'Create New Class'}</h2>
                            <form onSubmit={handleSaveRoom} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1">Class Name</label>
                                    <input
                                        type="text"
                                        value={roomForm.name}
                                        onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                        placeholder="e.g. Grade 10 Science"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1">Assign Teacher</label>
                                    <select
                                        value={roomForm.teacherId}
                                        onChange={(e) => setRoomForm({ ...roomForm, teacherId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                    >
                                        <option value="">Select a teacher...</option>
                                        {teachers.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.fullName || t.username} (@{t.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1">Description (Optional)</label>
                                    <textarea
                                        value={roomForm.description}
                                        onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none resize-none h-24"
                                        placeholder="Brief description about the class..."
                                    />
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={closeRoomModal}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold hover:bg-secondary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!roomForm.name || isSavingRoom}
                                        className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isSavingRoom && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {editingRoom ? 'Save' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Teacher Modal */}
            {
                showTeacherModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/10 m-4 animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold mb-6">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
                            <form onSubmit={handleSaveTeacher} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={teacherForm.fullName}
                                        onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1">Username</label>
                                    <input
                                        type="text"
                                        value={teacherForm.username}
                                        onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                        placeholder="johndoe"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1.5 ml-1">
                                        {editingTeacher ? 'Password (Leave blank to keep current)' : 'Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={teacherForm.password}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none pr-12"
                                            placeholder="••••••••"
                                            required={!editingTeacher}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={closeTeacherModal}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold hover:bg-secondary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!teacherForm.username || (!editingTeacher && !teacherForm.password) || isSavingTeacher}
                                        className="flex-1 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isSavingTeacher && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {editingTeacher ? 'Save Changes' : 'Create Teacher'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Modal */}
            {
                showDeleteModal && itemToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-card w-full max-w-sm p-6 rounded-3xl shadow-2xl border border-white/10 m-4 animate-in zoom-in-95 duration-200 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Delete {itemToDelete.type === 'room' ? 'Class' : 'Teacher'}?</h2>
                            <p className="text-muted-foreground mb-6">
                                Are you sure you want to delete <span className="font-semibold text-foreground">"{itemToDelete.name}"</span>?
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
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
