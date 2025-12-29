'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, User, Search, Phone, MapPin, CreditCard, ShieldCheck, Mail, MoreVertical, Pencil, Trash2, GraduationCap, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
    _id: string;
    name: string;
    phoneNumber?: string;
    address?: string;
    nic?: string;
    profileImage?: string;
    roomIds?: string[];
}

interface Room {
    _id: string;
    name: string;
}

export default function MaintenanceStudentList({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = use(params);
    const [students, setStudents] = useState<Student[]>([]);
    const [allRooms, setAllRooms] = useState<Room[]>([]);
    const [roomName, setRoomName] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal & Selection State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [roomId]);

    const fetchData = async () => {
        try {
            // Fetch Room Info
            const roomRes = await fetch(`/api/rooms/${roomId}`);
            if (roomRes.ok) {
                const data = await roomRes.json();
                if (data.room) setRoomName(data.room.name);
            }

            // Fetch All Rooms (for Enrollment)
            const roomsRes = await fetch('/api/rooms');
            if (roomsRes.ok) {
                const data = await roomsRes.json();
                setAllRooms(data);
            }

            // Fetch Students
            const studentsRes = await fetch('/api/students');
            if (studentsRes.ok) {
                const data: Student[] = await studentsRes.json();
                setStudents(data.filter(s => s.roomIds?.includes(roomId)));
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (student: Student) => {
        setSelectedStudent(student);
        setShowEditModal(true);
    };

    const handleDeleteClick = (student: Student) => {
        setSelectedStudent(student);
        setShowDeleteModal(true);
    };

    const handleEnrollClick = (student: Student) => {
        setSelectedStudent(student);
        setShowEnrollModal(true);
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nic?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans min-h-screen">
            <Link href="/maintenance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Maintenance
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Maintenance - {roomName || 'Class'}</h1>
                    <p className="text-muted-foreground">Manage students registered to this class.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p>Loading class roster...</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-card/30">
                    <div className="inline-flex p-4 rounded-full bg-secondary/50 mb-4">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No students found</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchQuery ? "Try adjusting your search query." : "Start by registering students to this room."}
                    </p>
                    {!searchQuery && (
                        <Link href={`/rooms/${roomId}/register`} className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-medium text-white shadow transition-colors hover:bg-blue-500 hover:scale-105 active:scale-95">
                            Register New Student
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <div key={student._id} className="group relative bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 transition-all hover:bg-card/60 hover:shadow-lg overflow-hidden">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-1 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 glass-highlight">
                                    {student.profileImage ? (
                                        <img src={student.profileImage} alt={student.name} className="w-16 h-16 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-secondary text-2xl font-bold text-muted-foreground">
                                            {student.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEnrollClick(student)} title="Enroll in another class" className="p-2 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground">
                                        <GraduationCap className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleEditClick(student)} title="Edit Student" className="p-2 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(student)} title="Delete Student" className="p-2 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold truncate mb-1">{student.name}</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4 text-blue-400">Student</p>

                            <div className="space-y-3">
                                {student.phoneNumber && (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="p-1.5 rounded-lg bg-secondary/50"><Phone className="w-3.5 h-3.5" /></div>
                                        {student.phoneNumber}
                                    </div>
                                )}
                                {student.address && (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="p-1.5 rounded-lg bg-secondary/50"><MapPin className="w-3.5 h-3.5" /></div>
                                        <span className="truncate">{student.address}</span>
                                    </div>
                                )}
                                {student.nic && (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="p-1.5 rounded-lg bg-secondary/50"><CreditCard className="w-3.5 h-3.5" /></div>
                                        <span className="font-mono">{student.nic}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedStudent && (
                <EditStudentModal
                    student={selectedStudent}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => { setShowEditModal(false); fetchData(); }}
                />
            )}

            {/* Enroll Modal */}
            {showEnrollModal && selectedStudent && (
                <EnrollStudentModal
                    student={selectedStudent}
                    allRooms={allRooms}
                    onClose={() => setShowEnrollModal(false)}
                    onSuccess={() => { setShowEnrollModal(false); fetchData(); }}
                />
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedStudent && (
                <DeleteStudentModal
                    student={selectedStudent}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={() => { setShowDeleteModal(false); fetchData(); }}
                />
            )}
        </div>
    );
}

function EditStudentModal({ student, onClose, onSuccess }: { student: Student, onClose: () => void, onSuccess: () => void }) {
    const [name, setName] = useState(student.name);
    const [phoneNumber, setPhoneNumber] = useState(student.phoneNumber || '');
    const [address, setAddress] = useState(student.address || '');
    const [nic, setNic] = useState(student.nic || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/students/${student._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phoneNumber, address, nic })
            });
            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                alert(`Status: ${res.status}\nError: ${data.error}\nData: ${JSON.stringify(data)}`);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error updating student: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Edit Student</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4 mb-6">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 bg-secondary/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                    <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number" className="w-full px-4 py-3 bg-secondary/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full px-4 py-3 bg-secondary/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                    <input value={nic} onChange={(e) => setNic(e.target.value)} placeholder="NIC" className="w-full px-4 py-3 bg-secondary/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

function EnrollStudentModal({ student, allRooms, onClose, onSuccess }: { student: Student, allRooms: Room[], onClose: () => void, onSuccess: () => void }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleEnroll = async (roomId: string) => {
        const currentRooms = student.roomIds || [];
        if (currentRooms.includes(roomId)) return;

        const newRoomIds = [...currentRooms, roomId];

        try {
            const res = await fetch(`/api/students/${student._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomIds: newRoomIds })
            });
            if (res.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredRooms = (allRooms || []).filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Enroll in Class</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-muted-foreground mb-4">Add <strong>{student.name}</strong> to another class.</p>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search classes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    />
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-1">
                    {filteredRooms.length > 0 ? filteredRooms.map(room => {
                        const isEnrolled = student.roomIds?.includes(room._id);
                        return (
                            <div key={room._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition-colors">
                                <span className="font-medium">{room.name}</span>
                                {isEnrolled ? (
                                    <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg border border-emerald-500/20">Enrolled</span>
                                ) : (
                                    <button
                                        onClick={() => handleEnroll(room._id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add
                                    </button>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            No classes found.
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="w-full py-3 bg-secondary rounded-xl font-medium hover:bg-secondary/80 transition-colors">Close</button>
            </div>
        </div>
    );
}

function DeleteStudentModal({ student, onClose, onSuccess }: { student: Student, onClose: () => void, onSuccess: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/students/${student._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                onSuccess();
            } else {
                alert('Failed to delete student');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting student');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl text-center">
                <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold mb-2">Delete Student?</h2>
                <p className="text-muted-foreground mb-6">Are you sure you want to remove <strong>{student.name}</strong>? This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-secondary rounded-xl font-medium hover:bg-secondary/80">Cancel</button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
