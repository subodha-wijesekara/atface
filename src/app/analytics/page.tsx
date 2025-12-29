'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, School, Users, ArrowRight, BarChart3, PieChart } from 'lucide-react';

interface Room {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export default function AnalyticsHome() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
                    <p className="text-muted-foreground">Detailed insights for classes and overall performance.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Overall Analytics Card */}
                    <Link href="/analytics/overall" className="group">
                        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-blue-500/20 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden group-hover:bg-card/60">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                <PieChart className="w-24 h-24 transform rotate-12" />
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Dashboard</p>
                                        <h3 className="text-xl font-bold leading-tight">Overall Analytics</h3>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                    View aggregated attendance data, trends, and statistics for the entire institution.
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <span className="text-xs text-muted-foreground">
                                    All Classes
                                </span>
                                <span className="flex items-center gap-1 text-sm font-semibold text-blue-500 group-hover:translate-x-1 transition-transform">
                                    View Report <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Class Cards */}
                    {rooms.map((room) => (
                        <Link href={`/analytics/${room._id}`} key={room._id} className="group">
                            <div className="bg-card/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-md hover:bg-card/60 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                    <School className="w-24 h-24 transform rotate-12" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Class Report</p>
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
                                    <span className="flex items-center gap-1 text-sm font-semibold text-indigo-500 group-hover:translate-x-1 transition-transform">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
