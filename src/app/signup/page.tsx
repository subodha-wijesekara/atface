'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, ShieldPlus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SignupPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, fullName }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Signup failed');
            }

            router.push('/login');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-background text-foreground p-4 transition-colors duration-300">
            {/* Background Ambience - Dark Mode Only */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden hidden dark:block">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-500/30 mb-4">
                        <ShieldPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create Account</h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Join the attendance system</p>
                </div>

                <div className="rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-xl p-8 transition-all duration-300">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 dark:text-red-500 text-sm font-bold text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1 text-gray-900 dark:text-gray-300">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-500 focus-visible:ring-offset-0 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white font-medium"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1 text-gray-900 dark:text-gray-300">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-500 focus-visible:ring-offset-0 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white font-medium"
                                placeholder="johndoe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1 text-gray-900 dark:text-gray-300">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 pr-12 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-500 focus-visible:ring-offset-0 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1 text-gray-900 dark:text-gray-300">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 pr-12 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-500 focus-visible:ring-offset-0 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                        </button>

                        <div className="pt-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Already have an account?{" "}
                            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
