'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Invalid username or password');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-black font-sans transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Premium Background - Dynamic Light/Dark */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                {/* 1. Grid Pattern 
                     Light: Dark Grey lines (#00000008) on White
                     Dark: Light Grey lines (#80808033) on Black 
                 */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] transition-all duration-300"></div>

                {/* 2. Radial Vignette Mask (Fades grid at edges) 
                    Light: Inner Transparent, Outer White
                    Dark: Inner Transparent, Outer Black
                */}
                <div className="absolute inset-0 bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)] transition-colors duration-300"></div>

                {/* 3. Subtle Central Spotlight (Blue Tint) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none transition-colors duration-300"></div>
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8 p-4">
                {/* Header */}
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 dark:shadow-black/50 transition-colors duration-300">
                        <ShieldCheck className="h-7 w-7 text-blue-600 dark:text-blue-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm transition-colors duration-300">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium transition-colors duration-300">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Solid Enterprise Card */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 shadow-xl dark:shadow-2xl ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 transition-all duration-300">
                    <div className="p-8 sm:p-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 text-sm font-semibold text-center animate-in fade-in zoom-in-95">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1 transition-colors duration-300">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    // Light: White bg, dark text. Dark: Black bg, white text.
                                    className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 px-4 py-2 text-zinc-900 dark:text-white ring-offset-white dark:ring-offset-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1 transition-colors duration-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 px-4 py-2 pr-12 text-zinc-900 dark:text-white ring-offset-white dark:ring-offset-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full h-12 overflow-hidden rounded-xl font-semibold text-base shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Sign in"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <span className="text-zinc-500 font-medium transition-colors duration-300">
                                Don&apos;t have an account?{' '}
                            </span>
                            <Link
                                href="/signup"
                                className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-600 transition-colors duration-300">
                    Secure Access • Enterprise Edition
                </p>
            </div>
        </div>
    );
}
