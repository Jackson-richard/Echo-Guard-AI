import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#F9FAFB',
            bodyColor: '#9CA3AF',
            cornerRadius: 8,
            padding: 12,
            titleFont: { family: 'Inter', size: 13, weight: 600 },
            bodyFont: { family: 'Inter', size: 12 },
        },
    },
    scales: {
        x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { color: '#6B7280', font: { family: 'Inter', size: 11 } },
        },
        y: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { color: '#6B7280', font: { family: 'Inter', size: 11 } },
        },
    },
};

export function TrustScoreChart({ data }) {
    const labels = data?.labels || [];
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Trust Score',
                data: data?.data || [],
                borderColor: '#00E5FF',
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00E5FF',
                pointBorderColor: 'transparent',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
            },
        ],
    };
    return (
        <ChartWrapper title="Trust Score Timeline" subtitle={data ? "Last 7 Days" : "Feature Not Implemented"}>
            <Line data={chartData} options={{ ...CHART_DEFAULTS, scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 } } }} />
        </ChartWrapper>
    );
}

export function ThreatDistributionChart({ data }) {
    const chartData = {
        labels: data?.labels || [],
        datasets: [
            {
                data: data?.data || [],
                backgroundColor: ['#FF4D4F', '#F97316', '#FBBF24', '#00E5FF', '#8B5CF6'],
                borderColor: 'transparent',
                borderWidth: 0,
                spacing: 3,
                borderRadius: 4,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: { display: false },
            tooltip: CHART_DEFAULTS.plugins.tooltip,
        },
    };
    return (
        <ChartWrapper title="Threat Distribution" subtitle={data ? "By category" : "Feature Not Implemented"}>
            <div className="flex items-center gap-6">
                <div className="w-40 h-40"><Doughnut data={chartData} options={options} /></div>

                {data && (
                    <div className="space-y-2">
                        {chartData.labels.map((label, i) => (
                            <div key={label} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }} />
                                <span className="text-xs text-gray-400">{label}</span>
                                <span className="text-xs font-semibold text-white ml-auto">{chartData.datasets[0].data[i]}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ChartWrapper>
    );
}

export function AuthTrendsChart({ data }) {
    const labels = ["Activity"];
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Successful',
                data: [data?.success || 0],
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderRadius: 4,
                barThickness: 12,
            },
            {
                label: 'Failed',
                data: [data?.fail || 0],
                backgroundColor: 'rgba(255, 77, 79, 0.6)',
                borderRadius: 4,
                barThickness: 12,
            },
        ],
    };
    const options = {
        ...CHART_DEFAULTS,
        plugins: {
            ...CHART_DEFAULTS.plugins,
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: { color: '#9CA3AF', font: { family: 'Inter', size: 11 }, boxWidth: 8, boxHeight: 8, borderRadius: 4, useBorderRadius: true },
            },
        },
    };
    return (
        <ChartWrapper title="Authentication Trends" subtitle={data ? "All Time" : "Feature Not Implemented"}>
            <Bar data={chartData} options={options} />
        </ChartWrapper>
    );
}

export function SessionTimelineChart({ data }) {
    const labels = data?.labels || [];
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Normal',
                data: data?.normal || [],
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderColor: '#22C55E',
                borderWidth: 1.5,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                label: 'Elevated Risk',
                data: data?.elevated || [],
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: '#F59E0B',
                borderWidth: 1.5,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                label: 'Critical',
                data: data?.critical || [],
                backgroundColor: 'rgba(255, 77, 79, 0.2)',
                borderColor: '#FF4D4F',
                borderWidth: 1.5,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };
    return (
        <ChartWrapper title="Session Risk Timeline" subtitle={data ? "Last 12 Hours" : "Feature Not Implemented"}>
            <Line data={chartData} options={{ ...CHART_DEFAULTS, scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, stacked: true } } }} />
        </ChartWrapper>
    );
}

function ChartWrapper({ title, subtitle, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="h-56">
                {children}
            </div>
        </motion.div>
    );
}
