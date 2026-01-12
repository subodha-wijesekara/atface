'use client';

import { useState, useEffect, use } from 'react';
import { Loader2, Users, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface AttendanceRecord {
    _id: string;
    name: string;
    studentId: string;
    timestamp: string;
}

interface Room {
    _id: string;
    name: string;
}

export default function ClassAnalytics({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = use(params);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await fetch(`/api/rooms/${roomId}`);
                if (res.ok) {
                    const data = await res.json();
                    setRoom(data.room);
                }
            } catch (error) {
                console.error("Failed to fetch room info", error);
            }
        };
        fetchRoom();
    }, [roomId]);

    useEffect(() => {
        fetchRecords();
    }, [filter, roomId]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const now = new Date();
            let fromDate = new Date(); // default to today start

            if (filter === 'today') {
                fromDate.setHours(0, 0, 0, 0);
            } else if (filter === 'week') {
                fromDate.setDate(now.getDate() - 7);
            } else if (filter === 'month') {
                fromDate.setMonth(now.getMonth() - 1);
            }

            const query = new URLSearchParams({
                roomId: roomId,
                from: fromDate.toISOString(),
                to: now.toISOString()
            });

            const response = await fetch(`/api/attendance?${query.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setRecords(data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <Link href="/analytics" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {room ? `${room.name} Report` : 'Class Analytics'}
                    </h1>
                    <p className="text-muted-foreground">View attendance for this specific class.</p>
                </div>

                <div className="flex bg-secondary/30 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
                    <button
                        onClick={() => setFilter('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'today' ? 'bg-background text-blue-500 shadow-none border border-border/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setFilter('week')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'week' ? 'bg-background text-blue-500 shadow-none border border-border/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => setFilter('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'month' ? 'bg-background text-blue-500 shadow-none border border-border/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        This Month
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card/30 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Class Presence</p>
                            <h3 className="text-2xl font-bold">{records.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-card/30 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Period</p>
                            <h3 className="text-lg font-bold capitalize">
                                {filter === 'today' ? 'Today' : filter === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card/30 backdrop-blur-xl rounded-3xl shadow-none border border-white/10 dark:border-white/5 overflow-hidden ring-1 ring-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/30 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Name</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Time</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Loading data...
                                        </div>
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        No attendance records found for this period.
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record._id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{record.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(record.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-mono">
                                            {new Date(record.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                Present
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div >
    );
}
