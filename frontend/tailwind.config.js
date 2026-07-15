/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                cyber: {
                    bg: '#0B1220',
                    card: '#111827',
                    'card-hover': '#1F2937',
                    surface: '#1a2332',
                    border: '#1F2937',
                    'border-light': '#374151',
                },
                accent: {
                    DEFAULT: '#00E5FF',
                    glow: 'rgba(0, 229, 255, 0.2)',
                    dim: 'rgba(0, 229, 255, 0.1)',
                    dark: '#00B8D4',
                },
                danger: {
                    DEFAULT: '#FF4D4F',
                    glow: 'rgba(255, 77, 79, 0.2)',
                },
                warning: {
                    DEFAULT: '#FBBF24',
                    glow: 'rgba(251, 191, 36, 0.2)',
                },
                success: {
                    DEFAULT: '#22C55E',
                    glow: 'rgba(34, 197, 94, 0.2)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'scan': 'scan 3s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};
