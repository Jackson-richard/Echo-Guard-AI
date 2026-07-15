import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheckIcon,
    HomeIcon,
    SignalIcon,
    FingerPrintIcon,
    ShieldExclamationIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    BellAlertIcon,
    NoSymbolIcon,
    UsersIcon,
    KeyIcon,
    Cog6ToothIcon,
    MicrophoneIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    CpuChipIcon,
} from '@heroicons/react/24/outline';

const NAV_SECTIONS = [
    {
        title: 'Overview',
        items: [
            { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
            { to: '/live-monitoring', icon: SignalIcon, label: 'Live Monitoring' },
        ],
    },
    {
        title: 'Authentication',
        items: [
            { to: '/voice-enrollment', icon: MicrophoneIcon, label: 'Voice Enrollment' },
            { to: '/behavior', icon: FingerPrintIcon, label: 'Behavior Analytics' },
            { to: '/deepfake', icon: CpuChipIcon, label: 'Deepfake Detection' },
        ],
    },
    {
        title: 'Security',
        items: [
            { to: '/threats', icon: GlobeAltIcon, label: 'Threat Intelligence' },
            { to: '/incidents', icon: DocumentTextIcon, label: 'Incident Reports' },
            { to: '/notifications', icon: BellAlertIcon, label: 'Notifications' },
            { to: '/blocked-sessions', icon: NoSymbolIcon, label: 'Blocked Sessions' },
        ],
    },
    {
        title: 'Administration',
        items: [
            { to: '/users', icon: UsersIcon, label: 'Users' },
            { to: '/roles', icon: KeyIcon, label: 'Role Management' },
            { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
        ],
    },
];

export default function Sidebar() {
    const { isCollapsed, toggle } = useSidebar();
    const location = useLocation();

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 256 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed top-0 left-0 h-screen bg-cyber-card/50 backdrop-blur-xl border-r border-white/[0.06] z-40 flex flex-col overflow-hidden"
        >
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] shrink-0">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <ShieldCheckIcon className="w-5 h-5 text-accent" />
                </div>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <h1 className="text-sm font-bold text-white tracking-wide">EchoGuard</h1>
                            <p className="text-[10px] text-accent font-medium tracking-widest uppercase">AI Platform</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.title}>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="px-3 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                                >
                                    {section.title}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <div className="space-y-1">
                            {section.items.map(({ to, icon: Icon, label }) => {
                                const isActive = location.pathname === to;
                                return (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        title={label}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group ${isActive
                                                ? 'text-accent bg-accent/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent' : ''}`} />
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="overflow-hidden whitespace-nowrap"
                                                >
                                                    {label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={toggle}
                className="flex items-center justify-center h-12 border-t border-white/[0.06] text-gray-500 hover:text-accent transition-colors shrink-0"
            >
                {isCollapsed ? (
                    <ChevronDoubleRightIcon className="w-4 h-4" />
                ) : (
                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                )}
            </button>
        </motion.aside>
    );
}
