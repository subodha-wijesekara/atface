"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/rooms', label: 'Rooms' },
        { href: '/register', label: 'Register' },
        { href: '/attendance', label: 'Attendance' },
        { href: '/maintenance', label: 'Maintenance' },
        { href: '/analytics', label: 'Analytics' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-extrabold tracking-tighter text-2xl text-foreground">
                            atface
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname === link.href ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
