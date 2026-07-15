import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CpuChipIcon,
    MicrophoneIcon,
    ArrowUpTrayIcon,
    PlayIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    DocumentMagnifyingGlassIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function DeepfakeDetection() {

    const { token } = useAuth();
    const [scans, setScans] = useState([]);
    const [result, setResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const res = await fetch('/api/v1/scans/deepfake', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setScans(data.scans);
                }
            } catch (err) {
                console.error("Failed to fetch scans", err);
            }
        };
        if (token) fetchScans();
    }, [token]);

    const startRecording = async () => {
        try {
            setErrorMsg('');
            setResult(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            const audioChunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data) };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());
                const fakeFile = new File([audioBlob], 'live_recording.wav', { type: 'audio/wav' });
                setFileName('live_recording.wav');
                processAudio(fakeFile);
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            processAudio(file);
        }
    };

    const processAudio = async (audioFile) => {
        setAnalyzing(true);
        setErrorMsg('');
        const formData = new FormData();
        formData.append('audio', audioFile);

        try {
            const res = await fetch('/api/v1/voice/deepfake', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setResult(data.result);
                // Prepend to top of list
                setScans(prev => [{ ...data.result, id: Math.random().toString(), timestamp: new Date().toISOString(), file: fileName }, ...prev].slice(0, 50));
            } else {
                setErrorMsg(data.error || 'Failed to analyze audio.');
            }
        } catch (err) {
            setErrorMsg('Network error connecting to anti-spoof engine.');
        }
        setAnalyzing(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Deepfake Detection</h1>
                <p className="text-sm text-gray-400 mt-1">AI-powered voice authenticity verification</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Upload / Record */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-glow p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Audio Input</h3>
                    <label className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-accent/30 transition-colors flex flex-col items-center cursor-pointer">
                        <ArrowUpTrayIcon className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-300 font-medium">Click or Drag & drop audio file</p>
                        <p className="text-xs text-gray-500 mt-1">{fileName ? `Selected: ${fileName}` : 'WAV, WebM, OGG • Max 10MB'}</p>
                        <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                        <span className="btn-ghost text-xs mt-4">
                            <ArrowUpTrayIcon className="w-4 h-4 inline" /> Browse Files
                        </span>
                    </label>
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-xs text-gray-500">OR</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>
                    {errorMsg && <p className="text-danger text-sm mb-4 text-center">{errorMsg}</p>}

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`btn-primary w-full transition-colors ${isRecording ? 'bg-danger hover:bg-danger/80' : ''}`}
                    >
                        {isRecording ? <><ArrowPathIcon className="w-4 h-4 animate-spin inline mr-2" /> Stop Recording</> : <><MicrophoneIcon className="w-4 h-4 inline mr-2" /> Record Audio</>}
                    </button>

                    {/* Waveform placeholder */}
                    <div className="mt-5 h-16 rounded-lg bg-cyber-bg/50 border border-white/[0.04] flex items-center justify-center gap-0.5 px-4">
                        {[...Array(50)].map((_, i) => (
                            <div key={i} className="w-1 bg-accent/30 rounded-full" style={{ height: isRecording || analyzing ? `${6 + Math.sin(i * 0.3) * 16 + Math.random() * 10}px` : '4px' }} />
                        ))}
                    </div>

                    <div className="flex gap-3 mt-4">
                        <div className="flex-1 text-center py-2 text-xs text-gray-400">
                            {analyzing ? (
                                <><ArrowPathIcon className="w-4 h-4 animate-spin inline mr-1" /> Analyzing...</>
                            ) : (
                                "Ready for Analysis"
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Results */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Detection Results</h3>
                    {result ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                            <div className={`flex items-center gap-4 p-4 rounded-xl border ${result.verdict === 'Deepfake' ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'}`}>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${result.verdict === 'Deepfake' ? 'bg-danger/10' : 'bg-success/10'}`}>
                                    <ShieldCheckIcon className={`w-7 h-7 ${result.verdict === 'Deepfake' ? 'text-danger' : 'text-success'}`} />
                                </div>
                                <div>
                                    <p className={`text-lg font-bold ${result.verdict === 'Deepfake' ? 'text-danger' : 'text-success'}`}>{result.verdict}</p>
                                    <p className="text-xs text-gray-400">{result.verdict === 'Deepfake' ? 'Synthetic voice detected' : 'Audio verified as authentic'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                    <p className="text-xs text-gray-500">Confidence</p>
                                    <p className="text-xl font-bold text-white font-mono">{result.confidence}%</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                    <p className="text-xs text-gray-500">Risk Level</p>
                                    <p className="text-xl font-bold text-success font-mono capitalize">{result.risk}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <p className="text-xs text-gray-500 mb-2">AI Explanation</p>
                                <p className="text-sm text-gray-300 leading-relaxed">{result.explanation}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <CpuChipIcon className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-sm">Upload or record audio to analyze</p>
                            <p className="text-xs text-gray-600 mt-1">Results will appear here</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Previous Scans */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Previous Scans</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-white/[0.06]">
                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk</th>
                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scans.length === 0 && <tr><td colSpan="5" className="py-4 text-center text-gray-500">No scans available.</td></tr>}
                            {scans.map((scan) => (
                                <tr key={scan.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 text-gray-300 font-mono text-xs">{scan.file || 'File'}</td>
                                    <td className="py-3">
                                        <span className={scan.verdict === 'Genuine' ? 'text-success font-semibold' : 'text-danger font-semibold'}>{scan.verdict}</span>
                                    </td>
                                    <td className="py-3 text-white font-mono">{scan.confidence}%</td>
                                    <td className="py-3"><span className={`badge ${scan.risk === 'critical' ? 'badge-critical' : 'badge-low'}`}>{scan.risk}</span></td>
                                    <td className="py-3 text-gray-500 text-xs">{new Date(scan.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
