'use client';

import { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit2, Search, X, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils exists

interface Student {
    _id: string;
    name: string;
    phoneNumber?: string;
    address?: string;
    nic?: string;
    profileImage?: string;
    registeredAt: string;
}

export default function Maintenance() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of student being deleted
    const [isSaving, setIsSaving] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        address: '',
        nic: '',
        profileImage: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/students');
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setIsDeleting(id);
        try {
            const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setStudents(students.filter(student => student._id !== id));
            } else {
                alert('Failed to delete student');
            }
        } catch (error) {
            console.error('Error deleting student', error);
            alert('Error deleting student');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEditClick = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            phoneNumber: student.phoneNumber || '',
            address: student.address || '',
            nic: student.nic || '',
            profileImage: student.profileImage || ''
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if larger than 800px
                    const MAX_SIZE = 800;
                    if (width > MAX_SIZE || height > MAX_SIZE) {
                        if (width > height) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        } else {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData(prev => ({ ...prev, profileImage: dataUrl }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/students/${editingStudent._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedStudent = await response.json();
                // Update local state
                setStudents(students.map(s => s._id === editingStudent._id ? updatedStudent.student : s));
                setEditingStudent(null);
            } else {
                alert('Failed to update student');
            }
        } catch (error) {
            console.error('Error updating student', error);
            alert('Error updating student');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nic?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">User Maintenance</h1>
                    <p className="text-muted-foreground">Manage registered personnel records.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by name or NIC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-card/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/10 dark:border-white/5 overflow-hidden ring-1 ring-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/30 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Face</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Name</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">NIC</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Phone</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Address</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Registered At</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary border border-white/10 relative">
                                                {student.profileImage ? (
                                                    <img src={student.profileImage} alt={student.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{student.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{student.nic || '-'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{student.phoneNumber || '-'}</td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate" title={student.address}>{student.address || '-'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(student.registeredAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleEditClick(student)}
                                                    className="p-2 hover:bg-foreground/5 text-foreground/60 hover:text-foreground rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student._id)}
                                                    disabled={isDeleting === student._id}
                                                    className="p-2 hover:bg-red-500/10 text-foreground/40 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete User"
                                                >
                                                    {isDeleting === student._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-secondary/30">
                            <h2 className="text-xl font-bold">Edit User Details</h2>
                            <button
                                onClick={() => setEditingStudent(null)}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex flex-col items-center mb-4">
                                <div className="h-24 w-24 rounded-full overflow-hidden bg-secondary border-2 border-dashed border-border mb-3 relative group">
                                    {formData.profileImage ? (
                                        <img src={formData.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                                    )}
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-semibold">
                                        Change
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground">Click image to upload new photo</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Full Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-border/40 bg-secondary/20 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Phone Number</label>
                                    <input
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-border/40 bg-secondary/20 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">NIC</label>
                                    <input
                                        value={formData.nic}
                                        onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-border/40 bg-secondary/20 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-border/40 bg-secondary/20 focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[80px] transition-all"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingStudent(null)}
                                    className="px-4 py-2 rounded-xl hover:bg-secondary font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
