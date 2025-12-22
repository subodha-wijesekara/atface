'use client';

import { useState, useEffect } from 'react';
import { Loader2, Calendar, Users, Clock, Filter } from 'lucide-react';

interface AttendanceRecord {
    _id: string;
    name: string;
    studentId: string;
    timestamp: string;
}

export default function Analytics() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');

    useEffect(() => {
        fetchRecords();
    }, [filter]);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Attendance Analytics</h1>
                    <p className="text-muted-foreground">View attendance history and statistics.</p>
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
