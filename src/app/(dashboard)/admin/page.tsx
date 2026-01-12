'use client';

import { useState, useEffect } from 'react';
import { School, Users, CheckCircle, Clock } from 'lucide-react';

const PieChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let currentAngle = 0;

    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                {data.map((item, index) => {
                    const sliceAngle = (item.value / total) * 360;
                    const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + sliceAngle)) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + sliceAngle)) / 180);

                    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    currentAngle += sliceAngle;

                    return (
                        <path
                            key={index}
                            d={pathData}
                            fill={item.color}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                    );
                })}
                <circle cx="50" cy="50" r="30" fill="currentColor" className="text-card" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-lg font-bold">{total}</span>
                <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
        </div>
    );
};

const BarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    const max = Math.max(...data.map(d => d.value)) || 1;

    return (
        <div className="flex items-end justify-between h-48 gap-2 w-full pt-6">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1 gap-2 group">
                    <div className="w-full relative flex items-end justify-center h-full">
                        <div
                            className="w-full max-w-[40px] bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-400"
                            style={{ height: `${(item.value / max) * 100}%` }}
                        ></div>
                        <div className="absolute -top-8 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.value}
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground truncate w-full text-center">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default function AdminAnalytics() {
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalTeachers: 0,
        totalStudents: 0,
        activeToday: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [roomsRes, teachersRes] = await Promise.all([
                    fetch('/api/rooms'),
                    fetch('/api/users/teachers')
                ]);

                const rooms = await roomsRes.json();
                const teachers = await teachersRes.json();

                setStats({
                    totalClasses: rooms.length || 0,
                    totalTeachers: teachers.length || 0,
                    totalStudents: 142,
                    activeToday: 24
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const userDistribution = [
        { name: 'Teachers', value: stats.totalTeachers, color: '#3b82f6' },
        { name: 'Students', value: stats.totalStudents, color: '#a855f7' },
    ];

    const attendanceData = [
        { label: 'Mon', value: 45 },
        { label: 'Tue', value: 52 },
        { label: 'Wed', value: 38 },
        { label: 'Thu', value: 65 },
        { label: 'Fri', value: 48 },
        { label: 'Sat', value: 15 },
        { label: 'Sun', value: 10 },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Classes', value: stats.totalClasses, icon: School, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Active Teachers', value: stats.totalTeachers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Registered Faces', value: stats.totalStudents, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Attendance Today', value: stats.activeToday, icon: CheckCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card border border-border/50 p-8 rounded-[2rem] shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Weekly Attendance</h3>
                        <select className="bg-secondary/50 border-none rounded-lg text-sm p-2 outline-none">
                            <option>This Week</option>
                            <option>Last Week</option>
                        </select>
                    </div>
                    <BarChart data={attendanceData} />
                </div>

                <div className="bg-card border border-border/50 p-8 rounded-[2rem] shadow-sm">
                    <h3 className="text-lg font-bold mb-8">User Distribution</h3>
                    <PieChart data={userDistribution} />
                    <div className="mt-8 space-y-3">
                        {userDistribution.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </div>
                                <span className="font-bold">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border/50 p-8 rounded-[2rem] shadow-sm">
                <h3 className="text-lg font-bold mb-6">Recent System Activity</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/20 border border-border/10">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">New class "Computer Science A" created</p>
                                <p className="text-xs text-muted-foreground">2 hours ago by Admin</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
