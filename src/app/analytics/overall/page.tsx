'use client';

import { useState, useEffect } from 'react';
import { Loader2, Users, Clock, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

interface AttendanceRecord {
    _id: string;
    name: string;
    studentId: string;
    timestamp: string;
    roomId?: string;
}

interface Room {
    _id: string;
    name: string;
}

export default function OverallAnalytics() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');
    const [selectedRoom, setSelectedRoom] = useState<string>('all');

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [filter, selectedRoom]);

    const fetchRooms = async () => {
        try {
            const response = await fetch('/api/rooms');
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        }
    };

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

            // Build query params
            const params: any = {
                from: fromDate.toISOString(),
                to: now.toISOString()
            };

            if (selectedRoom !== 'all') {
                params.roomId = selectedRoom;
            }

            const query = new URLSearchParams(params);

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

    // Create a lookup for room names
    const roomMap = rooms.reduce((acc, room) => {
        acc[room._id] = room.name;
        return acc;
    }, {} as Record<string, string>);

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <Link href="/analytics" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Overall Attendance Analytics</h1>
                    <p className="text-muted-foreground">View attendance history and statistics for the entire institution.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Class Filter */}
                    <div className="relative">
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2.5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer hover:bg-black/50 transition-colors w-full sm:w-48 text-foreground"
                        >
                            <option value="all" className="bg-zinc-900 text-foreground">All Classes</option>
                            {rooms.map(room => (
                                <option key={room._id} value={room._id} className="bg-zinc-900 text-foreground">{room.name}</option>
                            ))}
                        </select>
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <div className="flex bg-secondary/30 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
                        <button
                            onClick={() => setFilter('today')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'today' ? 'bg-background text-blue-500 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setFilter('week')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'week' ? 'bg-background text-blue-500 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setFilter('month')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'month' ? 'bg-background text-blue-500 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Month
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card/30 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Presence</p>
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
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Class</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Time</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Loading data...
                                        </div>
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No attendance records found for this period.
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record._id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{record.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {record.roomId && roomMap[record.roomId] ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                    {roomMap[record.roomId]}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/50 italic">Unknown</span>
                                            )}
                                        </td>
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
