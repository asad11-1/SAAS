'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/auth-context';
import {
    Building2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Loader2,
    AlertTriangle,
    ShieldCheck,
    BarChart3,
    Users,
    Menu,
    X,
    Search,
    User,
    Sun,
    Moon,
    UserCheck,
    Upload,
    Home,
    ChevronRight,
    LogOut,
    Map
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

//================================================================================
// LOGIN PAGE - Modern & Elegant Redesign
//================================================================================

/**
 * A reusable container for form fields to apply consistent animations.
 */
const FormField = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
        {children}
    </motion.div>
);

/**
 * A helper component for rendering features on the branding panel.
 */
const FeatureItem = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => (
    <motion.div
        className="flex items-start gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
    >
        <div className="w-11 h-11 mt-1 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

/**
 * The primary login page component with a complete visual overhaul.
 */
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [subdomain, setSubdomain] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            // Enhanced logic for local and production environments
            if (hostname.includes('localhost')) {
                const path = window.location.pathname;
                setSubdomain(path.includes('/admin') || window.location.search.includes('admin=true') ? 'System' : 'VMTA');
            } else {
                const parts = hostname.split('.');
                setSubdomain(parts.length > 2 ? parts[0] : 'VMTA');
            }
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && !loading) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed. Please verify your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Authenticating Your Session...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Please wait a moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* Left Side: Enhanced Branding & Visuals */}
                <div className="relative hidden lg:flex flex-col justify-between bg-slate-900 p-12 overflow-hidden">
                    {/* Aurora Background Effect */}
                    <div className="absolute inset-0 z-0 opacity-40">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
                        <div className="absolute top-1/2 right-0 w-96 h-96 bg-sky-500 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2"></div>
                        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4"></div>
                    </div>

                    <div className="relative z-10">
                        {/* --- LOGO LARGER & REDESIGNED --- */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <Image
                                src="/Logo_dwars.png"
                                alt="VMTA Logo"
                                width={220} // Increased logo size
                                height={70}
                                className="object-contain drop-shadow-lg"
                                priority
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        className="relative z-10 w-full max-w-md text-white"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.2
                                }
                            }
                        }}
                    >
                        <motion.h1
                            className="text-5xl font-bold leading-tight mb-4"
                            variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            Empowering Medical Professionals
                        </motion.h1>
                        <motion.p
                            className="text-lg text-slate-300 mb-10"
                            variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            Your unified platform for training, management, and professional growth.
                        </motion.p>
                        <div className="space-y-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
                            <FeatureItem icon={<Users className="w-5 h-5 text-sky-300"/>} title="Unified Management" description="Oversee students and branches from one central hub." />
                            <FeatureItem icon={<BarChart3 className="w-5 h-5 text-green-300"/>} title="Insightful Analytics" description="Gain actionable data to track progress and success."/>
                            <FeatureItem icon={<ShieldCheck className="w-5 h-5 text-purple-300"/>} title="Secure & Compliant" description="Trust in a platform built for security and reliability." />
                        </div>
                    </motion.div>

                    <div className="relative z-10 text-xs text-slate-400">
                        © {new Date().getFullYear()} Visser Medical Training en Advisering. All Rights Reserved.
                    </div>
                </div>

                {/* Right Side: Modernized Login Form */}
                <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950">
                    <div className="w-full max-w-sm">
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-10">
                            <Image
                                src="/Logo_dwars.png"
                                alt="VMTA Logo"
                                width={160}
                                height={51}
                                className="object-contain mx-auto dark:invert-[.9] dark:saturate-0"
                            />
                        </div>

                        <motion.div
                            className="text-left mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Secure Sign In
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Welcome! Please enter your details below.
                            </p>
                            {subdomain && (
                                <div className="mt-4 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    <Building2 className="h-4 w-4" />
                                    <span>{subdomain} Portal</span>
                                </div>
                            )}
                        </motion.div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-lg flex items-center gap-3"
                                >
                                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <FormField delay={0.1}>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                                        placeholder="your.email@company.com"
                                    />
                                </div>
                            </FormField>

                            <FormField delay={0.2}>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-11 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                                        placeholder="Enter your secure password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-xl transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </FormField>

                            <FormField delay={0.3}>
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98, y: 0 }}
                                    type="submit"
                                    disabled={isLoading || !email || !password}
                                    className="w-full py-3.5 px-6 mt-2 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transform"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Signing In...</span>
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </motion.button>
                            </FormField>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Protected by{' '}
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    Enterprise-Grade Security
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aurora Animation CSS (can be moved to global.css) */}
            <style jsx global>{`
                .animate-blob {
                    animation: blob 10s infinite;
                }
                .animation-delay-2 {
                    animation-delay: -2s;
                }
                .animation-delay-4 {
                    animation-delay: -4s;
                }
                @keyframes blob {
                    0% {
                        transform: scale(1) translate(0px, 0px);
                    }
                    33% {
                        transform: scale(1.2) translate(30px, -50px);
                    }
                    66% {
                        transform: scale(0.9) translate(-20px, 30px);
                    }
                    100% {
                        transform: scale(1) translate(0px, 0px);
                    }
                }
            `}</style>
        </div>
    );
}
