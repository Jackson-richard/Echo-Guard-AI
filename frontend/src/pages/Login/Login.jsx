import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,229,255,0.08)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.06)_0%,_transparent_50%)]" />
            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />
            {/* Floating orbs */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-3xl"
                    style={{
                        width: 200 + i * 40,
                        height: 200 + i * 40,
                        background: i % 2 === 0 ? 'rgba(0, 229, 255, 0.03)' : 'rgba(139, 92, 246, 0.03)',
                        left: `${15 + i * 18}%`,
                        top: `${10 + i * 15}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                    }}
                    transition={{
                        duration: 8 + i * 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
            {/* Scan line */}
            <motion.div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
                animate={{ y: ['-100vh', '100vh'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
}

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        const res = await login(data.email, data.password, data.rememberMe);
        if (res.success) {
            navigate('/dashboard');
        } else {
            alert(res.error || "Login Failed");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-cyber-bg flex items-center justify-center relative">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 accent-glow"
                    >
                        <ShieldCheckIcon className="w-8 h-8 text-accent" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="text-sm text-gray-400 mt-1">Sign in to EchoGuard AI Platform</p>
                </div >

                {/* Login Card */}
                < div className="glass-card-glow p-8" >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    {...register('email', { required: 'Email is required' })}
                                    type="email"
                                    placeholder="name@company.com"
                                    className="input-field pl-10"
                                    defaultValue="alex.morgan@echoguard.io"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    {...register('password', { required: 'Password is required' })}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pl-10 pr-10"
                                    defaultValue="password123"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input {...register('rememberMe')} type="checkbox" className="w-3.5 h-3.5 rounded border-cyber-border-light bg-cyber-bg text-accent focus:ring-accent/30" />
                                <span className="text-sm text-gray-400">Remember me</span>
                            </label>
                            <button type="button" className="text-sm text-accent hover:text-accent-dark font-medium">Forgot password?</button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-cyber-bg border-t-transparent rounded-full"
                                />
                            ) : (
                                <>
                                    <LockClosedIcon className="w-4 h-4" />
                                    Sign In Securely
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mt-6 mb-4">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-xs text-gray-500">CONTINUOUS AUTH ENABLED</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    <p className="text-center text-xs text-gray-500">
                        Protected by EchoGuard AI • Zero Trust Architecture
                    </p>
                </div >

                {/* Register Link */}
                < p className="text-center text-sm text-gray-400 mt-6" >
                    Don't have an account?{' '}
                    < button onClick={async () => {
                        try {
                            const r = await fetch('/api/v1/auth/request-access', { method: 'POST' });
                            const data = await r.json();
                            alert(data.message || 'Requested');
                        } catch (e) {
                            alert('Network Error');
                        }
                    }} className="text-accent hover:text-accent-dark font-medium" > Request Access</button >
                </p >
            </motion.div >
        </div >
    );
}
