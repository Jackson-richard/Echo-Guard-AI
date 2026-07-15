import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip } from 'chart.js';
import { FingerPrintIcon, CursorArrowRaysIcon, ClockIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

export default function BehaviorAnalytics() {
    const [stats, setStats] = useState({
        mouseVelocity: 0,
        clickFrequency: 0,
        typingCadence: 0,
        behaviorScore: 100, // Derived from auth or state
        risk: 'low',
        reason: 'Analyzing baseline...'
    });

    const [history, setHistory] = useState({
        scores: [],
        typing: []
    });

    useEffect(() => {
        const handleTrustUpdate = (e) => {
            const { payload, response } = e.detail;

            if (response && response.success) {
                setStats(s => ({
                    mouseVelocity: payload.mouse_frequency,
                    clickFrequency: payload.click_frequency,
                    typingCadence: payload.typing_cadence,
                    behaviorScore: 100 + response.risk_modifier,
                    risk: response.risk_modifier < 0 ? 'high' : 'low',
                    reason: `Mode: ${response.status} (Modifier: ${response.risk_modifier})`
                }));

                setHistory(h => {
                    const nextScores = [...h.scores, 100 + response.risk_modifier].slice(-15);
                    const nextTyping = [...h.typing, payload.typing_cadence].slice(-15);
                    return { scores: nextScores, typing: nextTyping };
                });
            }
        };

        window.addEventListener('trust_engine_update', handleTrustUpdate);
        return () => window.removeEventListener('trust_engine_update', handleTrustUpdate);
    }, []);

    const anomalyData = {
        labels: history.scores.map((_, i) => i),
        datasets: [{
            label: 'Trust Score',
            data: history.scores,
            borderColor: '#34D399',
            backgroundColor: 'rgba(52, 211, 153, 0.08)',
            fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2,
        }],
    };

    const typingData = {
        labels: history.typing.map((_, i) => i),
        datasets: [{
            label: 'Typing Frequency',
            data: history.typing,
            backgroundColor: 'rgba(0, 229, 255, 0.5)',
            borderRadius: 4, barThickness: 16,
        }],
    };

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, titleColor: '#F9FAFB', bodyColor: '#9CA3AF', cornerRadius: 8, padding: 10 } },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { display: false } },
            y: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: '#6B7280', font: { size: 11 } }, min: 0, max: 100 },
        },
    };

    // adjust max for typing
    const typingChartOpts = { ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, max: undefined } } };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Behavior Analytics (Privacy-Preserving)</h1>
                <p className="text-sm text-gray-400 mt-1">Live Trust Engine metrics fueled by the background TelemetryWorker</p>
            </div>

            <div className={`p-4 rounded-lg border flex items-start gap-3 ${stats.risk === 'low' ? 'bg-success/5 border-success/20 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}>
                <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" />
                <div>
                    <p className="font-semibold">{stats.risk === 'low' ? 'Verification Stable' : 'Behavior Anomaly Detected'}</p>
                    <p className="text-sm opacity-80">{stats.reason}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card glass-card p-4">
                    <p className="text-sm text-gray-400">Mouse Metrics (10s)</p>
                    <p className="text-2xl font-bold text-white font-mono">{stats.mouseVelocity}</p>
                </div>
                <div className="stat-card glass-card p-4">
                    <p className="text-sm text-gray-400">Click Freq (10s)</p>
                    <p className="text-2xl font-bold text-white font-mono">{stats.clickFrequency}</p>
                </div>
                <div className="stat-card glass-card p-4">
                    <p className="text-sm text-gray-400">Typing Cadence</p>
                    <p className="text-2xl font-bold text-white font-mono">{stats.typingCadence}</p>
                </div>
                <div className="stat-card glass-card p-4">
                    <p className="text-sm text-gray-400">Current Trust</p>
                    <p className="text-2xl font-bold text-white font-mono text-accent">{stats.behaviorScore}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-white mb-1">Live Trust Score (Engine Output)</h3>
                    <div className="h-56"><Line data={anomalyData} options={chartOpts} /></div>
                </div>
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-white mb-1">Typing Cadence (No keylogging)</h3>
                    <div className="h-56"><Bar data={typingData} options={typingChartOpts} /></div>
                </div>
            </div>
        </div>
    );
}
