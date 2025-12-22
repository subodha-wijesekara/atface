'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Card */}
                <div className="flex flex-col justify-center rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-xl shadow-xl p-8 sm:p-10 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50"></div>

                    <div className="relative z-10">
                        <form className="space-y-6 text-left" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 ml-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="flex h-14 w-full rounded-2xl border border-input bg-secondary/30 px-4 py-2 text-lg ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-secondary/50"
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex h-14 w-full rounded-2xl border border-input bg-secondary/30 px-4 py-2 pr-12 text-lg ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-secondary/50"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full h-14 overflow-hidden rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Sign in"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <span className="text-muted-foreground font-medium">
                                Don&apos;t have an account?{' '}
                            </span>
                            <Link
                                href="/signup"
                                className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs font-semibold text-gray-500 dark:text-gray-500">
                    Secure Access • Admin Protected
                </p>
            </div>
        </div>
    );
}
