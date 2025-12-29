'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, UserPlus, ClipboardCheck, Settings, BarChart3, Menu, X, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const { data: session } = useSession();

    const navLinks = [
        { href: '/', label: 'Home', icon: LayoutDashboard },
        { href: '/rooms', label: 'My Classes', icon: Users },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/maintenance', label: 'Maintenance', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-card/80 backdrop-blur border border-white/10 rounded-xl"
            >
                {isMobileOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-card/60 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <span className="text-2xl font-bold tracking-tighter text-foreground">
                            atface
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Menu</p>
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href !== '/admin'); // Fix overlapping active state for /admin subroutes if handled separately
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-500 font-medium border border-blue-500/20"
                                            : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground hover:translate-x-1"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground")} />
                                    <span>{link.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                                </Link>
                            );
                        })}

                        {/* Admin Section Removed */}
                    </nav>

                    {/* Footer / User Controls */}
                    <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-xs text-muted-foreground">Theme</p>
                            <ThemeToggle />
                        </div>

                        {session?.user ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-white/5 relative group">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold uppercase">
                                    {session.user.name?.[0] || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{session.user.name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground truncate capitalize">{(session.user as any).role || 'Member'}</p>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-red-400"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="p-3">
                                <div className="w-full h-10 bg-white/5 rounded-xl animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm lg:hidden"
                />
            )}
        </>
    );
}
