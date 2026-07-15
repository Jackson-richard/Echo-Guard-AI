import { motion } from 'framer-motion';
import { GlobeAltIcon, ShieldExclamationIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function ThreatIntelligence() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Threat Intelligence</h1>
                <p className="text-sm text-gray-400 mt-1">Global threat feeds and predictive attack analysis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 glass-card-glow p-6 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain opacity-[0.05] invert" />
                    <div className="absolute w-4 h-4 bg-danger rounded-full animate-ping" style={{ top: '30%', left: '45%' }} />
                    <div className="absolute w-2 h-2 bg-warning rounded-full animate-ping" style={{ top: '50%', left: '70%' }} />
                    <div className="absolute w-3 h-3 bg-accent rounded-full animate-ping" style={{ top: '40%', left: '20%' }} />
                    <div className="z-10 text-center">
                        <GlobeAltIcon className="w-12 h-12 text-accent mx-auto mb-4 opacity-50" />
                        <p className="text-gray-400 text-sm">Live Global Attack Map</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Latest Threat Bulletins</h3>
                    <div className="space-y-4">
                        {[
                            { id: 1, type: 'APT', name: 'VoiceClone-X Campaign', risk: 'critical', desc: 'New wave of highly sophisticated AI voice clones targeting financial sectors.' },
                            { id: 2, type: 'Malware', name: 'Keystroke Logger v4', risk: 'high', desc: 'Evades traditional AV, modifies behavioral typing dynamics.' },
                            { id: 3, type: 'Phishing', name: 'Session Hijack 0-day', risk: 'high', desc: 'Exploiting stale JWT tokens. Mitigated by continuous auth.' },
                        ].map(t => (
                            <div key={t.id} className="p-3 border border-white/[0.04] rounded-lg bg-cyber-bg/50">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-accent">{t.type}</span>
                                    <span className={`badge ${t.risk === 'critical' ? 'badge-critical' : 'badge-high'}`}>{t.risk}</span>
                                </div>
                                <p className="text-sm font-semibold text-white mb-1">{t.name}</p>
                                <p className="text-xs text-gray-500">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
