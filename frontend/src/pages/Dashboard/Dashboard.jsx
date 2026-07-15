import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '../../components/common/StatCard';
import TrustGauge from '../../components/common/TrustGauge';
import {
    ShieldCheckIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    ServerStackIcon,
    ClockIcon,
    Bars4Icon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const [liveData, setLiveData] = useState({
        metrics: {
            active_sessions: 0,
            open_incidents: 0,
            average_network_trust: 100
        },
        incidents: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/v1/dashboard/soc-stats');
                const data = await res.json();
                if (data.success) {
                    setLiveData({
                        metrics: data.metrics,
                        incidents: data.incidents
                    });
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Security Operations Center (SOC)</h1>
                    <p className="text-sm text-gray-400 mt-1">Real-time EchoGuard continuous assurance oversight</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-green-500 font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        LIVE
                    </span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-12 gap-5">
                {/* Network Trust Gauge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="col-span-12 lg:col-span-4 glass-card-glow p-6 flex flex-col items-center justify-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
                    <TrustGauge score={liveData.metrics.average_network_trust} size={220} />
                    <div className="mt-4 text-center z-10">
                        <p className="text-sm font-semibold text-gray-300">Global Enclave Trust</p>
                        <p className="text-xs text-gray-500">Aggregate Session Integrity</p>
                    </div>
                </motion.div>

                {/* Key Metrics */}
                <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-4">
                    <StatCard icon={UsersIcon} title="Active Sessions" value={liveData.metrics.active_sessions.toString()} color="accent" />
                    <StatCard icon={ExclamationTriangleIcon} title="Open Incidents" value={liveData.metrics.open_incidents.toString()} color={liveData.metrics.open_incidents > 0 ? "warning" : "success"} />
                    <StatCard icon={ShieldCheckIcon} title="Sessions Protected" value={liveData.metrics.active_sessions.toString()} subtitle="IdP Linked" color="success" />
                    <StatCard icon={ServerStackIcon} title="Trust Nodes" value="4 Active" subtitle="Region: US-East" color="accent" />
                </div>
            </div>

            {/* Incident SIEM Timeline */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-white font-semibold">
                        <Bars4Icon className="w-5 h-5 text-accent" />
                        Incident Feed (SIEM)
                    </div>
                    <span className="text-xs text-gray-500 font-mono">Last 50 events</span>
                </div>

                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-black/20 font-mono">
                            <tr>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Threat Type</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">MITRE ATT&CK</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {liveData.incidents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No active incidents detected.
                                        </td>
                                    </tr>
                                ) : (
                                    liveData.incidents.map((inc) => (
                                        <motion.tr
                                            key={inc.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-gray-400">
                                                {new Date(inc.date).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {inc.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${inc.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                        inc.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                    }`}>
                                                    {inc.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-400">
                                                {inc.user_id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white font-mono">
                                                    {inc.mitre_tactic}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <span className="text-xs text-gray-400">{inc.recommended_response}</span>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
