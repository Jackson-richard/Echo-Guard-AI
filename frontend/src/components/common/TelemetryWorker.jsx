import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function TelemetryWorker() {
    const { isAuthenticated, token } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        let mouseMovements = 0;
        let clicks = 0;
        let keystrokes = 0; // Only count, not actual keys
        let lastMove = Date.now();
        let activeTimes = 0;

        const handleMouseMove = () => {
            mouseMovements++;
            const now = Date.now();
            if (now - lastMove < 500) activeTimes += (now - lastMove);
            lastMove = now;
        };

        const handleClick = () => clicks++;
        const handleKeyDown = () => keystrokes++;

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleKeyDown);

        const interval = setInterval(async () => {
            if (mouseMovements === 0 && clicks === 0 && keystrokes === 0) return; // User is idle

            const payload = {
                mouse_frequency: mouseMovements,
                click_frequency: clicks,
                typing_cadence: keystrokes,
                active_ratio: Math.min((activeTimes / 10000), 1.0)
            };

            // Reset
            mouseMovements = 0;
            clicks = 0;
            keystrokes = 0;
            activeTimes = 0;

            try {
                await fetch('/api/v1/telemetry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                window.dispatchEvent(new CustomEvent('trust_engine_update', { detail: { payload, response: data } }));
            } catch (err) {
                console.error("Telemetry error", err);
            }
        }, 10000);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(interval);
        };
    }, [isAuthenticated, token]);

    return null; // Silent background worker
}
