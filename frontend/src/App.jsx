import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring/LiveMonitoring';
import VoiceEnrollment from './pages/VoiceEnrollment/VoiceEnrollment';
import BehaviorAnalytics from './pages/Behavior/BehaviorAnalytics';
import DeepfakeDetection from './pages/Deepfake/DeepfakeDetection';
import IncidentReports from './pages/Incidents/IncidentReports';
import ThreatIntelligence from './pages/Threats/ThreatIntelligence';

const Placeholder = ({ title }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">🚧</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">This module is part of the EchoGuard AI enterprise suite and is currently under implementation for the next milestone.</p>
    </div>
);

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
    const { isAuthenticated } = useAuth();
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />

                <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="live-monitoring" element={<LiveMonitoring />} />
                    <Route path="voice-enrollment" element={<VoiceEnrollment />} />
                    <Route path="behavior" element={<BehaviorAnalytics />} />
                    <Route path="deepfake" element={<DeepfakeDetection />} />
                    <Route path="incidents" element={<IncidentReports />} />
                    <Route path="threats" element={<ThreatIntelligence />} />

                    {/* Placeholders for remaining requested routes */}
                    <Route path="notifications" element={<Placeholder title="Notification Center" />} />
                    <Route path="blocked-sessions" element={<Placeholder title="Blocked Sessions" />} />
                    <Route path="users" element={<Placeholder title="User Management" />} />
                    <Route path="roles" element={<Placeholder title="Role Management" />} />
                    <Route path="settings" element={<Placeholder title="System Settings" />} />
                    <Route path="profile" element={<Placeholder title="User Profile" />} />

                    {/* 404 */}
                    <Route path="*" element={
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <h1 className="text-6xl font-bold text-accent font-mono mb-4">404</h1>
                            <h2 className="text-xl font-semibold text-white mb-2">Sector Not Found</h2>
                            <p className="text-gray-500 text-sm">The requested security module does not exist.</p>
                        </div>
                    } />
                </Route>
            </Routes>
        </AnimatePresence>
    );
}
