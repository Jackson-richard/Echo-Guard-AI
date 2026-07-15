import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon, ArrowDownTrayIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

function IncidentBadge({ severity }) {
    const s = severity?.toLowerCase();
    if (s === 'critical') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger/20 text-danger border border-danger/30 uppercase tracking-widest">CRITICAL</span>;
    if (s === 'high') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/20 text-warning border border-warning/30 uppercase tracking-widest">HIGH</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent border border-accent/30 uppercase tracking-widest">{s || 'LOW'}</span>;
}

export default function IncidentReports() {
    const { token } = useAuth();
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const res = await fetch('/api/v1/incidents', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setIncidents(data.incidents);
                }
            } catch (err) {
                console.error("Failed to fetch incidents", err);
            }
        };
        if (token) fetchIncidents();
    }, [token]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Incident Reports</h1>
                    <p className="text-sm text-gray-400 mt-1">Audit log and forensic evidence for security events</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-ghost text-xs"><FunnelIcon className="w-4 h-4" /> Filter</button>
                    <button className="btn-primary text-xs"><ArrowDownTrayIcon className="w-4 h-4" /> Export PDF</button>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/[0.02] text-gray-300 font-semibold border-b border-white/[0.05]">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Title / MITRE Tactic</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Forensic Reason</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {incidents.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">No forensic incidents reported.</td></tr>
                            )}
                            {incidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${incident.status === 'open' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${incident.status === 'open' ? 'bg-danger' : 'bg-success'}`} />
                                            {incident.status === 'open' ? 'Active' : 'Resolved'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white">{incident.title}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-1">{incident.mitre_tactic}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <IncidentBadge severity={incident.severity || 'low'} />
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <p className="text-gray-300 truncate">{incident.reason}</p>
                                        <p className="text-xs text-accent mt-1">Action: {incident.recommended_response}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(incident.date).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-accent hover:text-accent-light transition-colors font-medium text-xs border border-accent/30 px-3 py-1 rounded hover:bg-accent/10">Analyze</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
