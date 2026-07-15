import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useSidebar } from '../../context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BellIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    Bars3Icon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const ROUTE_TITLES = {
    '/dashboard': 'Dashboard',
    '/live-monitoring': 'Live Monitoring',
    '/voice-enrollment': 'Voice Enrollment',
    '/behavior': 'Behavior Analytics',
    '/deepfake': 'Deepfake Detection',
    '/threats': 'Threat Intelligence',
    '/incidents': 'Incident Reports',
    '/notifications': 'Notifications',
    '/blocked-sessions': 'Blocked Sessions',
    '/users': 'User Management',
    '/roles': 'Role Management',
    '/settings': 'Settings',
    '/profile': 'Profile',
};

function NotificationDropdown({ notifications, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 glass-card-glow rounded-xl shadow-2xl overflow-hidden z-50"
        >
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <span className="badge badge-info">{notifications.filter(n => !n.isRead).length} New</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                    <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer ${!n.isRead ? 'bg-accent/[0.03]' : ''}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.severity === 'critical' ? 'bg-danger' :
                                    n.severity === 'high' ? 'bg-orange-400' :
                                        n.severity === 'medium' ? 'bg-warning' : 'bg-accent'
                                }`} />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{n.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5 truncate">{n.message}</p>
                                <p className="text-[10px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="px-4 py-2.5 border-t border-white/[0.06]">
                <button className="text-xs text-accent hover:text-accent-dark font-medium w-full text-center">View All Notifications</button>
            </div>
        </motion.div>
    );
}

function ProfileDropdown({ user, onLogout, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 glass-card-glow rounded-xl shadow-2xl overflow-hidden z-50"
        >
            <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <span className="badge badge-info mt-2">{user.role}</span>
            </div>
            <div className="py-1">
                {[
                    { icon: UserCircleIcon, label: 'Profile', to: '/profile' },
                    { icon: Cog6ToothIcon, label: 'Settings', to: '/settings' },
                ].map(({ icon: Icon, label }) => (
                    <button key={label} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>
            <div className="border-t border-white/[0.06] py-1">
                <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors">
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </motion.div>
    );
}

export default function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { notifications, unreadCount } = useNotifications();
    const { toggle } = useSidebar();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const pageTitle = ROUTE_TITLES[location.pathname] || 'EchoGuard AI';

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="h-16 bg-cyber-card/30 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left: Hamburger + Breadcrumb */}
            <div className="flex items-center gap-4">
                <button onClick={toggle} className="lg:hidden text-gray-400 hover:text-white transition-colors">
                    <Bars3Icon className="w-5 h-5" />
                </button>
                <nav className="flex items-center gap-2 text-sm">
                    <ShieldCheckIcon className="w-4 h-4 text-accent" />
                    <span className="text-gray-500">EchoGuard</span>
                    <ChevronRightIcon className="w-3 h-3 text-gray-600" />
                    <span className="text-white font-medium">{pageTitle}</span>
                </nav>
            </div>

            {/* Right: Search + Notifications + Profile */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden md:flex items-center gap-2 bg-cyber-bg/50 border border-cyber-border rounded-lg px-3 py-2">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-sm text-gray-300 placeholder-gray-500 outline-none w-40 lg:w-56"
                    />
                    <kbd className="hidden lg:inline text-[10px] text-gray-500 bg-cyber-bg px-1.5 py-0.5 rounded border border-cyber-border">⌘K</kbd>
                </div>

                {/* Live Status */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                    <span className="text-xs font-medium text-success">Protected</span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
                        className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        <BellIcon className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1 right-1 w-4 h-4 bg-danger text-[10px] font-bold text-white rounded-full flex items-center justify-center"
                            >
                                {unreadCount}
                            </motion.span>
                        )}
                    </button>
                    <AnimatePresence>
                        {showNotifs && <NotificationDropdown notifications={notifications} onClose={() => setShowNotifs(false)} />}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
                        className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/30 to-cyan-600/30 flex items-center justify-center border border-accent/20">
                            <span className="text-xs font-bold text-accent">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                        </div>
                    </button>
                    <AnimatePresence>
                        {showProfile && <ProfileDropdown user={user} onLogout={logout} onClose={() => setShowProfile(false)} />}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
