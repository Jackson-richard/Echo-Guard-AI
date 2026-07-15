import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = useCallback((type, title, message, severity) => {
        setNotifications(prev => [{
            id: Date.now(),
            type,
            title,
            message,
            severity,
            isRead: false,
            createdAt: new Date().toISOString()
        }, ...prev].slice(0, 50)); // Keep max 50
    }, []);

    // Listen to global socket events
    useEffect(() => {
        const socket = io('/', { path: '/socket.io' }); // Uses vite proxy
        socket.on('security_event', (event) => {
            let title = 'Security Alert';
            let message = 'An event occurred.';
            let severity = 'info';

            switch (event.type) {
                case 'incident_created':
                    title = 'New Incident Detected';
                    message = event.data.description || 'A critical security incident was logged.';
                    severity = 'error';
                    break;
                case 'behavior_anomaly':
                    title = 'Behavior Anomaly';
                    message = `Anomaly Score: ${event.data.anomaly_score.toFixed(2)}`;
                    severity = 'warning';
                    break;
                case 'deepfake_detection':
                    title = 'Deepfake Scan Completed';
                    message = `Result: ${event.data.prediction} (${event.data.confidence}% confidence)`;
                    severity = event.data.prediction.toLowerCase() === 'fake' ? 'error' : 'success';
                    break;
                case 'voice_verification':
                    title = 'Voice Verification';
                    message = event.data.success ? 'Continuous Authentication verified voice.' : 'Voice mismatch detected.';
                    severity = event.data.success ? 'success' : 'error';
                    break;
                case 'auth_login':
                    title = 'User Login';
                    message = `User ${event.data.user} logged in.`;
                    severity = 'info';
                    break;
            }
            addNotification(event.type, title, message, severity);
        });

        return () => {
            socket.disconnect();
        };
    }, [addNotification]);

    const markRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be within NotificationProvider');
    return ctx;
};
