import { motion } from 'framer-motion';
import {
    ExclamationTriangleIcon,
    ShieldExclamationIcon,
    CpuChipIcon,
    FingerPrintIcon,
    GlobeAltIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

const ICON_MAP = {
    deepfake_detected: CpuChipIcon,
    voice_mismatch: ShieldExclamationIcon,
    behavior_anomaly: FingerPrintIcon,
    impossible_travel: GlobeAltIcon,
    session_hijack: ExclamationTriangleIcon,
    default: ExclamationTriangleIcon,
};

const SEVERITY_STYLES = {
    critical: { dot: 'bg-danger', text: 'text-danger', border: 'border-danger/20', bg: 'bg-danger/5' },
    high: { dot: 'bg-orange-400', text: 'text-orange-400', border: 'border-orange-400/20', bg: 'bg-orange-400/5' },
    medium: { dot: 'bg-warning', text: 'text-warning', border: 'border-warning/20', bg: 'bg-warning/5' },
    low: { dot: 'bg-success', text: 'text-success', border: 'border-success/20', bg: 'bg-success/5' },
    info: { dot: 'bg-accent', text: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/5' },
};

export default function ThreatCard({ threat, delay = 0 }) {
    const Icon = ICON_MAP[threat.type] || ICON_MAP.default;
    const sev = SEVERITY_STYLES[threat.severity] || SEVERITY_STYLES.info;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay * 0.06 }}
            className={`glass-card p-4 border ${sev.border} ${sev.bg} hover:border-opacity-40 transition-all duration-300`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${sev.bg} shrink-0`}>
                    <Icon className={`w-5 h-5 ${sev.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">{threat.title}</h4>
                        <span className={`badge ${threat.severity === 'critical' ? 'badge-critical' :
                                threat.severity === 'high' ? 'badge-high' :
                                    threat.severity === 'medium' ? 'badge-medium' : 'badge-low'
                            }`}>
                            {threat.severity}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{threat.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                            <ClockIcon className="w-3 h-3" />
                            {threat.time}
                        </span>
                        <span className="text-[10px] text-gray-500">•</span>
                        <span className="text-[10px] text-gray-500">{threat.user}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
