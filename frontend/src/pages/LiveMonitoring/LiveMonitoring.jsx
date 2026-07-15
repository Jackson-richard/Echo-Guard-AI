import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import StatCard from '../../components/common/StatCard';
import TrustGauge from '../../components/common/TrustGauge';
import {
    SignalIcon,
    MicrophoneIcon,
    FingerPrintIcon,
    CpuChipIcon,
    MapPinIcon,
    DevicePhoneMobileIcon,
    ClockIcon,
    ShieldCheckIcon,
    WifiIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

function LiveStatusCard({ icon: Icon, label, status, detail, color, pulse }) {
    const colorMap = {
        success: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success', border: 'border-success/20' },
        warning: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning', border: 'border-warning/20' },
        danger: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger', border: 'border-danger/20' },
        accent: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent', border: 'border-accent/20' },
    };
    const c = colorMap[color] || colorMap.accent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-5 border ${c.border}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${c.text}`} />
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {pulse && (
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-75`} />
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
                        </span>
                    )}
                    <span className={`text-xs font-semibold ${c.text}`}>{status}</span>
                </div>
            </div>
            <p className="text-lg font-bold text-white font-mono truncate">{detail}</p>
        </motion.div>
    );
}

export default function LiveMonitoring() {
    const [trustScore, setTrustScore] = useState(100);
    const [events, setEvents] = useState([]);
    const [statusData, setStatusData] = useState({
        voice: { status: 'Waiting...', confidence: 0, color: 'accent' },
        typing: { status: 'Waiting...', wpm: 0, color: 'accent' },
        deepfake: { status: 'Waiting...', confidence: 0, color: 'accent' },
        device: 'MacBook Pro • Chrome 126',
        location: 'Mumbai, India',
        ip: '192.168.1.42',
        sessionDuration: '1h 12m',
        riskLevel: { label: 'Unknown', color: 'accent' }
    });

    useEffect(() => {
        const socket = io('/', { path: '/socket.io' });

        socket.on('connect', () => {
            setEvents(prev => [{ time: new Date().toLocaleTimeString(), event: 'SOC Live Stream Connected', score: 100, type: 'success' }, ...prev].slice(0, 50));
        });

        socket.on('security_event', (msg) => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            const { type, data } = msg;

            if (type === 'auth_login') {
                setEvents(prev => [{ time, event: `User ${data.user} authenticated via IdP.`, score: 100, type: 'success' }, ...prev]);
            } else if (type === 'trust_updated') {
                setEvents(prev => [{ time, event: `Trust Engine tick: Score ${data.new_score} [${data.status}]`, score: data.new_score, type: data.new_score >= 80 ? 'success' : 'warning' }, ...prev]);
                setStatusData(prev => ({ ...prev, typing: { status: data.status, wpm: 'Private', color: data.new_score >= 80 ? 'success' : 'warning' }, riskLevel: { label: data.new_score >= 80 ? 'Low' : 'High', color: data.new_score >= 80 ? 'success' : 'danger' } }));
                setTrustScore(data.new_score);
            } else if (type === 'trust_restored') {
                setEvents(prev => [{ time, event: `Voice Challenge Passed. Trust restoring to 100.`, score: 100, type: 'success' }, ...prev]);
                setStatusData(prev => ({ ...prev, voice: { status: 'Verified', confidence: 100, color: 'success' } }));
                setTrustScore(100);
            } else if (type === 'incident_created') {
                setEvents(prev => [{ time, event: `INCIDENT FIRE: ${data.incident} [Severity: ${data.severity}]`, score: 0, type: 'danger' }, ...prev]);
                if (data.severity === 'critical') setTrustScore(0);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Live Monitoring</h1>
                <p className="text-sm text-gray-400 mt-1">Real-time session authentication & biometric status via WebSocket</p>
            </div>

            <div className="grid grid-cols-12 gap-5">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-12 lg:col-span-4 glass-card-glow p-6 flex flex-col items-center"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                        </span>
                        <span className="text-xs font-semibold text-success tracking-wide">LIVE STREAM</span>
                    </div>
                    <TrustGauge score={Math.round(trustScore)} size={220} />
                    <p className="text-xs text-gray-500 mt-3">Listening via WSS Transport</p>
                </motion.div>

                <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-4">
                    <LiveStatusCard icon={MicrophoneIcon} label="Voice Status" status={statusData.voice.status} detail={`${statusData.voice.confidence}%`} color={statusData.voice.color} pulse />
                    <LiveStatusCard icon={FingerPrintIcon} label="Typing Pattern" status={statusData.typing.status} detail={`${statusData.typing.wpm} / Active`} color={statusData.typing.color} pulse />
                    <LiveStatusCard icon={CpuChipIcon} label="Deepfake Scanning" status={statusData.deepfake.status} detail={`${statusData.deepfake.confidence}%`} color={statusData.deepfake.color} pulse />
                    <LiveStatusCard icon={ExclamationTriangleIcon} label="Risk Level" status={statusData.riskLevel.label} detail="Real-time" color={statusData.riskLevel.color} />
                    <LiveStatusCard icon={DevicePhoneMobileIcon} label="Device Context" status="Secure" detail={statusData.device} color="accent" />
                    <LiveStatusCard icon={MapPinIcon} label="Location" status="Static" detail={statusData.location} color="accent" />
                    <LiveStatusCard icon={WifiIcon} label="IP Address" status="Known" detail={statusData.ip} color="accent" />
                    <LiveStatusCard icon={ClockIcon} label="Session Duration" status="Active" detail={statusData.sessionDuration} color="accent" />
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Authentication Activity Log</h3>
                <div className="space-y-3">
                    {events.length === 0 && (
                        <div className="text-sm text-gray-500 p-2">Listening for network telemetry...</div>
                    )}
                    {events.map((log, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm py-2 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                            <span className="text-xs font-mono text-gray-500 w-20">{log.time}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'success' ? 'bg-success' : log.type === 'danger' ? 'bg-danger' : 'bg-warning'}`} />
                            <span className="text-gray-300 flex-1">{log.event}</span>
                            <span className={`text-xs font-bold font-mono ${log.score >= 80 ? 'text-success' : log.score >= 50 ? 'text-warning' : 'text-danger'}`}>{log.score} SCORE</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
