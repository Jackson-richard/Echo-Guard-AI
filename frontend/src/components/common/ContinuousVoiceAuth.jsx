import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ContinuousVoiceAuth() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    useEffect(() => {
        let interval;
        const initiateVerificationLoop = async () => {
            try {
                // Request mic permission silently
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const startRecording = () => {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') return;
                    audioChunksRef.current = [];
                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = (e) => {
                        if (e.data.size > 0) audioChunksRef.current.push(e.data);
                    };
                    mediaRecorderRef.current.onstop = async () => {
                        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                        await verifyVoice(blob);
                    };
                    mediaRecorderRef.current.start();
                    // Record for 4 seconds
                    setTimeout(() => {
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                            mediaRecorderRef.current.stop();
                        }
                    }, 4000);
                };

                // Trigger every N seconds (e.g. 15 seconds for testing)
                // In prod set to much longer.
                interval = setInterval(startRecording, 15000);
            } catch (err) {
                console.error("Mic access denied for continuous auth.", err);
            }
        };

        const verifyVoice = async (blob) => {
            if (!token) return;
            const formData = new FormData();
            formData.append('audio', blob, 'verify.wav');

            try {
                const res = await fetch('/api/v1/voice/verify', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const data = await res.json();

                if (res.status === 404) {
                    // User hasn't enrolled, ignore silent verification
                    return;
                }

                if (data.success && data.result.verified === false) {
                    alert(`🚨 CONTINUOUS AUTH FAILED 🚨\nVoice mismatch detected. Security Incident generated.`);
                    logout();
                    navigate('/login');
                }
            } catch (e) {
                console.error("Continuous auth check failed", e);
            }
        };

        if (token) {
            initiateVerificationLoop();
        }

        return () => {
            clearInterval(interval);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [token, logout, navigate]);

    return null;
}
