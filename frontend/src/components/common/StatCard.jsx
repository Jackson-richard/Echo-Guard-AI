import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'accent', delay = 0 }) {
    const colorMap = {
        accent: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
        danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
        warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
        success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
    };
    const c = colorMap[color] || colorMap.accent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.08 }}
            className="stat-card"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${c.bg} ${c.border} border`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                {trend !== undefined && (
                    <span className={`text-xs font-semibold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-white font-mono tracking-tight">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </motion.div>
    );
}
