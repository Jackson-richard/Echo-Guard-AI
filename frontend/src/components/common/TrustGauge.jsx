import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function TrustGauge({ score = 85, size = 180 }) {
    const [displayScore, setDisplayScore] = useState(0);
    const prevScore = useRef(0);

    useEffect(() => {
        const start = prevScore.current;
        const end = score;
        const duration = 800;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
        prevScore.current = score;
    }, [score]);

    const getColor = (s) => {
        if (s >= 80) return { stroke: '#22C55E', label: 'HIGH', bg: 'rgba(34, 197, 94, 0.1)' };
        if (s >= 50) return { stroke: '#FBBF24', label: 'MEDIUM', bg: 'rgba(251, 191, 36, 0.1)' };
        if (s >= 20) return { stroke: '#F97316', label: 'LOW', bg: 'rgba(249, 115, 22, 0.1)' };
        return { stroke: '#FF4D4F', label: 'CRITICAL', bg: 'rgba(255, 77, 79, 0.1)' };
    };

    const { stroke, label, bg } = getColor(displayScore);
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius * 0.75;
    const dashOffset = circumference - (displayScore / 100) * circumference;
    const center = size / 2;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
        >
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-[135deg]">
                    {/* Background track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * 0.25}
                    />
                    {/* Score arc */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
                            filter: `drop-shadow(0 0 8px ${stroke}40)`,
                        }}
                    />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white font-mono">{displayScore}</span>
                    <span className="text-xs font-semibold mt-1 tracking-widest" style={{ color: stroke }}>{label}</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">TRUST SCORE</span>
                </div>
            </div>
        </motion.div>
    );
}
