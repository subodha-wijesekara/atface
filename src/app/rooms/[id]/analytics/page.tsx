'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Calendar as CalendarIcon, Users, Clock, Filter, ArrowLeft, School, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
    _id: string;
    name: string;
    studentId: string;
    timestamp: string;
    roomId?: string;
    status?: string;
}

interface Student {
    _id: string;
    name: string;
    roomIds?: string[];
    profileImage?: string;
}

export default function RoomAnalytics({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = use(params);

    // Data State
    const [roomName, setRoomName] = useState('');
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);

    // Loading State
    const [loading, setLoading] = useState(true);
    const [loadingRecords, setLoadingRecords] = useState(false);

    // Calendar State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    useEffect(() => {
        const init = async () => {
            await fetchRoomDetails();
            await fetchStudents();
        };
        init();
    }, [roomId]);

    useEffect(() => {
        fetchRecordsForDate(selectedDate);
    }, [selectedDate, roomId]);

    const fetchRoomDetails = async () => {
        try {
            const res = await fetch(`/api/rooms/${roomId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.room) setRoomName(data.room.name);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        try {
            // Need to filter students by room. 
            // Assuming we fetch all and filter or API supports it. 
            // Based on previous step, I should filter on client if API doesn't support query.
            const res = await fetch('/api/students');
            if (res.ok) {
                const data: Student[] = await res.json();
                setAllStudents(data.filter(s => s.roomIds?.includes(roomId)));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRecordsForDate = async (date: Date) => {
        setLoadingRecords(true);
        try {
            const fromDate = new Date(date);
            fromDate.setHours(0, 0, 0, 0);

            const toDate = new Date(date);
            toDate.setHours(23, 59, 59, 999);

            const query = new URLSearchParams({
                from: fromDate.toISOString(),
                to: toDate.toISOString(),
                roomId: roomId
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
            setLoadingRecords(false);
        }
    };

    // Calendar Helper Functions
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (offset: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + offset);
        setCurrentMonth(newMonth);
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    // Derived Lists
    const presentStudentIds = new Set(records.map(r => r.name)); // Using name as ID for now based on legacy logic
    const presentList = records; // Showing logs directly
    const absentList = allStudents.filter(s => !presentStudentIds.has(s.name));


    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans min-h-screen">
            <Link href={`/rooms/${roomId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {roomName || 'Room'}
            </Link>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Left Column: Calendar & Filters */}
                <div className="w-full xl:w-1/3 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{roomName} Analytics</h1>
                        <p className="text-muted-foreground">Select a date to view attendance.</p>
                    </div>

                    {/* Calendar Widget */}
                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-none">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-lg">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex gap-1">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                                const day = i + 1;
                                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                const isSelected = isSameDay(date, selectedDate);
                                const isToday = isSameDay(date, new Date());

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                            isSelected
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                : "hover:bg-white/10 text-foreground",
                                            isToday && !isSelected && "border border-blue-500 text-blue-500"
                                        )}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats Summary for Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl">
                            <p className="text-emerald-500 text-sm font-bold uppercase tracking-wide mb-1">Present</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-emerald-500 leading-none">{presentStudentIds.size}</span>
                                <span className="text-emerald-500/60 font-medium mb-0.5">/ {allStudents.length}</span>
                            </div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl">
                            <p className="text-red-500 text-sm font-bold uppercase tracking-wide mb-1">Absent</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-red-500 leading-none">{absentList.length}</span>
                                <span className="text-red-500/60 font-medium mb-0.5">Students</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Lists */}
                <div className="w-full xl:w-2/3">
                    <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-none overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-bold">
                                Attendance Log
                                <span className="text-muted-foreground font-normal ml-2 text-base">
                                    for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                            </h3>
                        </div>

                        {loadingRecords ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p>Loading records...</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 h-full">
                                    {/* Present Column */}
                                    <div className="p-4">
                                        <h4 className="flex items-center gap-2 font-semibold text-emerald-500 mb-4 px-2">
                                            <CheckCircle2 className="w-5 h-5" /> Present ({presentStudentIds.size})
                                        </h4>
                                        <div className="space-y-2">
                                            {presentList.length > 0 ? (
                                                presentList.map((record, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                                                            {record.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm">{record.name}</p>
                                                            <p className="text-xs text-muted-foreground self-center">
                                                                <Clock className="w-3 h-3 inline mr-1" />
                                                                {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {record.status === 're-entry' && (
                                                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                                        Went out & came back
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground p-4 text-center italic">No one marked present.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Absent Column */}
                                    <div className="p-4">
                                        <h4 className="flex items-center gap-2 font-semibold text-red-500 mb-4 px-2">
                                            <XCircle className="w-5 h-5" /> Absent ({absentList.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {absentList.length > 0 ? (
                                                absentList.map((student, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 opacity-70">
                                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold text-sm">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm">{student.name}</p>
                                                            <p className="text-xs text-red-500/60 font-medium">
                                                                {selectedDate > new Date() ? 'Upcoming Class' : 'Not seen'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground p-4 text-center italic">Everyone is present! 🎉</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
