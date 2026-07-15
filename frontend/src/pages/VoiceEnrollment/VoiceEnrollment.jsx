import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MicrophoneIcon,
    PlayIcon,
    StopIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    SignalIcon,
} from '@heroicons/react/24/outline';

const PHRASES = [
    'The quick brown fox jumps over the lazy dog',
    'My voice is my passport, verify me',
    'Security is not a product, but a process',
];

function WaveformBar({ height, delay }) {
    return (
        <motion.div
            className="w-1 rounded-full bg-accent"
            animate={{ height: [4, height, 4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
    );
}

export default function VoiceEnrollment() {
    const [step, setStep] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [samples, setSamples] = useState([]);
    const [quality, setQuality] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const startRecording = async () => {
        try {
            setErrorMsg('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            // Most browsers support audio/webm; we'll send to backend, and ffmpeg/torchaudio handles webm out of box or we send as wav if needed, 
            // but standard torchaudio handles webm files too. 

            const audioChunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data) };

            recorder.onstop = async () => {
                setIsProcessing(true);
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

                // Stop tracks
                stream.getTracks().forEach(track => track.stop());

                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.wav');

                try {
                    const res = await fetch('/api/v1/voice/enroll', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                        const q = data.metrics.quality_score;
                        setQuality(Math.round(q));
                        setSamples(prev => {
                            const updated = [...prev, { id: prev.length + 1, quality: Math.round(q), duration: data.metrics.duration.toFixed(1) + 's' }];
                            if (updated.length >= 3) setStep(2);
                            return updated;
                        });
                    } else {
                        setErrorMsg(data.error || 'Enrollment failed due to voice quality.');
                        setQuality(0);
                    }
                } catch (err) {
                    setErrorMsg('Network error connecting to biometric engine.');
                }
                setIsProcessing(false);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setQuality(0);
        } catch (err) {
            setErrorMsg('Microphone access denied or unavailable.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleRecord = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white">Voice Enrollment</h1>
                <p className="text-sm text-gray-400 mt-1">Register your voice for continuous biometric authentication</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 px-2">
                {['Record Samples', 'Quality Check', 'Enrollment Complete'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < step ? 'bg-success text-white' :
                            i === step ? 'bg-accent text-cyber-bg' :
                                'bg-white/5 text-gray-500 border border-white/10'
                            }`}>
                            {i < step ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-xs font-medium hidden sm:inline ${i <= step ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                        {i < 2 && <div className={`flex-1 h-px ${i < step ? 'bg-success' : 'bg-white/10'}`} />}
                    </div>
                ))}
            </div>

            {/* Recording Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-glow p-8"
            >
                {step < 2 ? (
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-2">Please read the phrase aloud:</p>
                        <p className="text-lg font-semibold text-accent mb-8">"{PHRASES[samples.length % PHRASES.length]}"</p>

                        {/* Waveform */}
                        <div className="flex items-center justify-center gap-1 h-24 mb-8">
                            {isRecording ? (
                                [...Array(40)].map((_, i) => (
                                    <WaveformBar key={i} height={12 + Math.random() * 60} delay={i * 0.03} />
                                ))
                            ) : isProcessing ? (
                                <div className="text-accent animate-pulse flex items-center gap-2">
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    <span>Processing audio and extracting biometrics...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MicrophoneIcon className="w-6 h-6" />
                                    <span className="text-sm">Click to start recording</span>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                                {errorMsg}
                            </div>
                        )}

                        {/* Record Button */}
                        <motion.button
                            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
                            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
                            onClick={handleRecord}
                            disabled={isProcessing}
                            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${isRecording
                                ? 'bg-danger shadow-[0_0_30px_rgba(255,77,79,0.3)]'
                                : isProcessing
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-accent shadow-[0_0_30px_rgba(0,229,255,0.3)]'
                                }`}
                        >
                            {isRecording ? (
                                <StopIcon className="w-8 h-8 text-white" />
                            ) : (
                                <MicrophoneIcon className="w-8 h-8 text-cyber-bg" />
                            )}
                        </motion.button>
                        <p className="text-xs text-gray-500 mt-4">{isRecording ? 'Recording... Click to stop' : `Sample ${samples.length + 1} of 3`}</p>

                        {/* Quality Indicator */}
                        {quality > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20"
                            >
                                <SignalIcon className="w-4 h-4 text-success" />
                                <span className="text-sm font-medium text-success">Quality: {quality}%</span>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="w-20 h-20 rounded-full bg-success/10 border-2 border-success flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircleIcon className="w-10 h-10 text-success" />
                        </motion.div>
                        <h2 className="text-xl font-bold text-white">Enrollment Complete!</h2>
                        <p className="text-sm text-gray-400 mt-2">Your voice profile has been created successfully.</p>
                        <p className="text-xs text-gray-500 mt-1">3 samples collected • Average quality: {Math.round(samples.reduce((a, s) => a + s.quality, 0) / samples.length)}%</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Samples List */}
            {samples.length > 0 && (
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-white mb-3">Recorded Samples</h3>
                    <div className="space-y-2">
                        {samples.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                    <CheckCircleIcon className="w-4 h-4 text-success" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-white">Sample {s.id}</p>
                                    <p className="text-xs text-gray-500">Duration: {s.duration}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-success font-mono">{s.quality}%</p>
                                    <p className="text-[10px] text-gray-500">Quality</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Verification Test Module for Judges */}
            {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-glow p-8 mt-8 border border-accent/30">
                    <h2 className="text-xl font-bold text-white mb-2">Test Voice Verification</h2>
                    <p className="text-sm text-gray-400 mb-6">Read the challenge phrase to verify your voice and test anti-spoofing.</p>

                    <div className="text-center mb-6">
                        <p className="text-xs text-accent uppercase tracking-widest mb-2 shadow-accent">Challenge Phrase</p>
                        <p className="text-2xl font-mono text-white bg-black/30 py-3 px-6 rounded-lg inline-block border border-white/10">"Echo Delta Nine"</p>
                    </div>

                    <VerificationTest />
                </motion.div>
            )}
        </div>
    );
}

function VerificationTest() {
    const [isRecording, setIsRecording] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const checkVerification = async () => {
        try {
            setResult(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            const audioChunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data) };

            recorder.onstop = async () => {
                setIsVerifying(true);
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());

                const formData = new FormData();
                formData.append('audio', audioBlob, 'verify.wav');
                formData.append('user_id', 'default_user'); // For test module
                formData.append('challenge_phrase', 'Echo Delta Nine');

                try {
                    const res = await fetch('/voice/verify', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    setResult(data);
                } catch (err) {
                    setResult({ error: 'Network error connecting to verification engine.' });
                }
                setIsVerifying(false);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            setResult({ error: 'Microphone access denied.' });
        }
    };

    const stopVerification = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    return (
        <div>
            <div className="flex justify-center mb-8">
                <motion.button
                    whileHover={{ scale: isVerifying ? 1 : 1.05 }}
                    whileTap={{ scale: isVerifying ? 1 : 0.95 }}
                    onClick={isRecording ? stopVerification : checkVerification}
                    disabled={isVerifying}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording
                        ? 'bg-danger shadow-[0_0_20px_rgba(255,77,79,0.5)]'
                        : isVerifying
                            ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                            : 'bg-accent shadow-[0_0_20px_rgba(0,229,255,0.4)]'}`}
                >
                    {isRecording ? <StopIcon className="w-6 h-6 text-white" /> : <MicrophoneIcon className="w-6 h-6 text-cyber-bg" />}
                </motion.button>
            </div>

            {isVerifying && (
                <div className="text-center text-accent animate-pulse mb-6">
                    <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto mb-2" />
                    <span>Analyzing vocal tract and checking deepfake signatures...</span>
                </div>
            )}

            {result && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-5 rounded-lg border ${result.verified ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${result.verified ? 'text-success' : 'text-danger'}`}>
                        {result.verified ? <CheckCircleIcon className="w-6 h-6" /> : <ShieldExclamationIcon className="w-6 h-6" />}
                        Decision: {result.verified ? 'VERIFIED' : 'REJECTED'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase">Similarity Score</p>
                            <p className="text-xl font-mono text-white">
                                {result.similarity !== undefined ? result.similarity.toFixed(4) : 'N/A'}
                            </p>
                        </div>
                        <div className="bg-black/20 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase">Threshold</p>
                            <p className="text-xl font-mono text-white">
                                {result.threshold !== undefined ? result.threshold.toFixed(4) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {(!result.verified && result.reason) && (
                        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-200 text-sm">
                            <span className="font-bold text-red-400">Reason: </span> {result.reason}
                        </div>
                    )}
                    {result.error && (
                        <div className="mt-4 text-danger text-sm text-center">{result.error}</div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

// Ensure ShieldExclamationIcon is imported (just define it locally if we don't have it imported at top)
function ShieldExclamationIcon(props) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    )
}
