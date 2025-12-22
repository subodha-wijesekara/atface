'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Users, UserPlus, FileBarChart, ArrowLeft, Loader2, PlayCircle, Settings } from 'lucide-react';

interface Room {
    _id: string;
    name: string;
    description?: string;
}

export default function RoomDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoom();
    }, [id]);

    const fetchRoom = async () => {
        try {
            const response = await fetch(`/api/rooms/${id}`);
            if (response.ok) {
                const data = await response.json();
                setRoom(data.room);
            } else {
                setRoom(null);
            }
        } catch (error) {
            console.error('Failed to fetch room', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!room) {
        return notFound();
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <Link href="/rooms" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Rooms
            </Link>

            <div className="mb-12">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold tracking-wide uppercase mb-4">
                    Classroom
                </span>
                <h1 className="text-4xl font-bold tracking-tight mb-4">{room.name}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">{room.description || 'Welcome to your room dashboard.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Action Card: Register */}
                <Link href={`/rooms/${room._id}/register`} className="group">
                    <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-none hover:bg-card/60 transition-all h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <UserPlus className="w-32 h-32 transform -rotate-12" />
                        </div>
                        <div className="mb-6 p-4 bg-emerald-500/10 rounded-2xl w-fit text-emerald-500">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Register Student</h3>
                        <p className="text-muted-foreground mb-6">Add new students specific to this room.</p>
                        <span className="inline-flex items-center text-sm font-semibold text-emerald-500 group-hover:translate-x-1 transition-transform">
                            Start Registration <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </span>
                    </div>
                </Link>

                {/* Action Card: Attendance */}
                <Link href={`/rooms/${room._id}/attendance`} className="group">
                    <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-none hover:bg-card/60 transition-all h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <PlayCircle className="w-32 h-32 transform rotate-12" />
                        </div>
                        <div className="mb-6 p-4 bg-orange-500/10 rounded-2xl w-fit text-orange-500">
                            <PlayCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Start Class</h3>
                        <p className="text-muted-foreground mb-6">Begin face scanning for attendance.</p>
                        <span className="inline-flex items-center text-sm font-semibold text-orange-500 group-hover:translate-x-1 transition-transform">
                            Launch Scanner <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </span>
                    </div>
                </Link>

                {/* Action Card: Analytics */}
                <Link href={`/rooms/${room._id}/analytics`} className="group">
                    <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-none hover:bg-card/60 transition-all h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileBarChart className="w-32 h-32 transform -rotate-6" />
                        </div>
                        <div className="mb-6 p-4 bg-blue-500/10 rounded-2xl w-fit text-blue-500">
                            <FileBarChart className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Analytics</h3>
                        <p className="text-muted-foreground mb-6">View attendance reports for this room.</p>
                        <span className="inline-flex items-center text-sm font-semibold text-blue-500 group-hover:translate-x-1 transition-transform">
                            View Reports <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </span>
                    </div>
                </Link>

                {/* Action Card: Students */}
                <Link href={`/rooms/${room._id}/students`} className="group">
                    <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-none hover:bg-card/60 transition-all h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users className="w-32 h-32 transform rotate-6" />
                        </div>
                        <div className="mb-6 p-4 bg-purple-500/10 rounded-2xl w-fit text-purple-500">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">My Students</h3>
                        <p className="text-muted-foreground mb-6">Manage class roster and students.</p>
                        <span className="inline-flex items-center text-sm font-semibold text-purple-500 group-hover:translate-x-1 transition-transform">
                            View Students <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
