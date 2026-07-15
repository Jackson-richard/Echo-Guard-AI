import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import TelemetryWorker from '../common/TelemetryWorker';

export default function DashboardLayout() {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex h-screen overflow-hidden bg-cyber-bg">
            <TelemetryWorker />
            <Sidebar />
            <motion.div
                initial={false}
                animate={{ marginLeft: isCollapsed ? 72 : 256 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex-1 flex flex-col min-w-0"
            >
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </motion.div>
        </div>
    );
}
