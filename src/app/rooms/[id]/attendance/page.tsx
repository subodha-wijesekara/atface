'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';
import { cn } from '@/lib/utils';
import { checkSmile } from '@/lib/liveness';
import { Activity, Users, ArrowLeft, Clock, Zap, CheckCircle2, Loader2, Smile, RefreshCw } from 'lucide-react';

interface Student {
    name: string;
    descriptors: number[][];
    roomIds?: string[];
}

interface AttendanceLog {
    name: string;
    timestamp: string;
}

export default function RoomAttendance({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = use(params);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);

    // Room info
    const [roomName, setRoomName] = useState<string>('');

    // Attendance Logic
    const lastMarkedRef = useRef<{ [name: string]: number }>({});
    const livenessState = useRef<{ [name: string]: { verified: boolean } }>({});
    const [scannedStudent, setScannedStudent] = useState<string | null>(null);
    const [livenessMessage, setLivenessMessage] = useState<string | null>(null);
    const [rejoinCandidate, setRejoinCandidate] = useState<string | null>(null);

    useEffect(() => {
        // Fetch Room Details
        fetch(`/api/rooms/${roomId}`)
            .then(res => res.json())
            .then(data => {
                if (data.room) setRoomName(data.room.name);
            });

        const loadResources = async () => {
            const MODEL_URL = '/models';
            try {
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);

                // Fetch Students FILTERED by Room
                // We'll need to assume the API supports this or filter client-side for now
                // Ideally backend should filter, but let's see. 
                // For now, I'll fetch all and filter client side if API doesn't support, 
                // BUT I should check if I added roomId support to GET /api/students.
                // I haven't added GET filter support explicitly in the plan step 309/314.
                // Let's implement client-side filtering safely or update the backend.
                // Actually, Step 309/316 was only POST. 
                // I should update GET /api/students to support filtering? 
                // Wait, typically I'd do `fetch('/api/students?roomId=' + roomId)`.
                // Let's assume I'll add that backend logic or just filter here.
                // Filter here is safer for immediate implementation without context switch.

                const response = await fetch('/api/students');
                if (response.ok) {
                    const data: Student[] = await response.json();
                    const roomStudents = data.filter(s => s.roomIds?.includes(roomId));
                    setStudents(roomStudents);
                }
            } catch (err) {
                console.error("Initialization error:", err);
            }

            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch((err) => console.error("Camera error:", err));
        };

        loadResources();
        loadLogs();

        // Polling logs specifically for this room (or filter on client)
        // I need to update GET attendance to filter by room too?
        // Usage: `fetchLogs`
    }, [roomId]);

    const loadLogs = async () => {
        if (!roomId) return;
        try {
            // Fetch attendance logs specific to this room
            const res = await fetch(`/api/attendance?roomId=${roomId}`);
            if (res.ok) {
                const data: AttendanceLog[] = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRejoin = () => {
        if (rejoinCandidate) {
            delete lastMarkedRef.current[rejoinCandidate];
            if (livenessState.current[rejoinCandidate]) {
                livenessState.current[rejoinCandidate].verified = false;
            }
            setRejoinCandidate(null);
        }
    };

    // Recognition Loop
    useEffect(() => {
        if (!modelsLoaded || students.length === 0) return;

        const interval = setInterval(async () => {
            if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const displaySize = { width: video.videoWidth, height: video.videoHeight };

                faceapi.matchDimensions(canvas, displaySize);
                const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
                const resizedDetections = faceapi.resizeResults(detections, displaySize);

                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);

                if (detections.length === 0) setLivenessMessage(null);

                if (detections.length > 0) {
                    const labeledDescriptors = students.map(s => {
                        const descriptors = s.descriptors.map(d => new Float32Array(d));
                        return new faceapi.LabeledFaceDescriptors(s.name, descriptors);
                    });

                    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
                    let activeMessage = null;

                    resizedDetections.forEach(detection => {
                        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                        const label = bestMatch.toString();
                        let boxColor = '#ef4444';

                        if (bestMatch.label !== 'unknown') {
                            const name = bestMatch.label;
                            const now = Date.now();
                            const lastTime = lastMarkedRef.current[name] || 0;
                            // COOLDOWN: 1 minute for testing re-entry. Was 30 minutes.
                            const COOLDOWN = 1 * 60 * 1000;
                            const inCooldown = (now - lastTime) < COOLDOWN;

                            if (inCooldown) {
                                boxColor = '#3b82f6';
                                activeMessage = "Already Marked";
                                setScannedStudent(null);
                                setLivenessMessage(null);
                                if (scannedStudent !== name) setRejoinCandidate(name);
                            } else {
                                boxColor = '#f59e0b';
                                if (!livenessState.current[name]) livenessState.current[name] = { verified: false };
                                const state = livenessState.current[name];

                                if (!state.verified) {
                                    activeMessage = "Smile to Confirm";
                                    setRejoinCandidate(null);
                                    if (checkSmile(detection.landmarks)) {
                                        state.verified = true;
                                        markAttendance(name);
                                        lastMarkedRef.current[name] = now;
                                        setScannedStudent(name);
                                        setTimeout(() => delete livenessState.current[name], COOLDOWN);
                                    }
                                } else {
                                    boxColor = '#10b981';
                                    activeMessage = "Identity Verified";
                                }
                            }
                        }

                        const box = detection.detection.box;
                        const drawBox = new faceapi.draw.DrawBox(box, { label: label, boxColor: boxColor, lineWidth: 2 });
                        drawBox.draw(canvas);
                    });
                    setLivenessMessage(activeMessage || "Scanning...");
                }
            }
        }, 100);
        return () => clearInterval(interval);
    }, [modelsLoaded, students]);

    const speakConfirmation = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice =>
                voice.name.includes('Female') ||
                voice.name.includes('Zira') ||
                voice.name.includes('Google US English')
            );
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            utterance.pitch = 1.1;
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const markAttendance = async (name: string) => {
        try {
            // Find student ID
            const student = students.find(s => s.name === name);
            // We use name as studentId usually in this app logic based on previous files, 
            // but ideally we should use _id. Previous implementation used name as ID in some places 
            // but let's stick to name for consistency with existing `attendance/page.tsx`.

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: name,
                    name,
                    roomId // Include roomId
                }),
            });
            if (res.ok) {
                speakConfirmation(`Welcome ${name}`);
                loadLogs();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 py-6 px-4 sm:px-6 md:gap-8 md:py-8 font-sans max-w-[1600px] mx-auto w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <Link href={`/rooms/${roomId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to {roomName || 'Room'}
                    </Link>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">{roomName} Attendance</h2>
                    </div>
                    <p className="text-muted-foreground font-medium ml-1">Scanning active for this class.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass-card flex items-center gap-3 px-5 py-2.5">
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-full">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold leading-none">{students.length}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Students</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid h-[650px] grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                {/* Camera Tile */}
                <div className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-black shadow-2xl lg:col-span-2 ring-1 ring-white/10">
                    <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-lg">
                        <span className="relative flex h-2.5 w-2.5 mr-1">
                            <span className={cn("inline-flex h-full w-full rounded-full opacity-75", livenessMessage === "Identity Verified" ? "animate-ping bg-emerald-400" : "bg-amber-400")}></span>
                            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", livenessMessage === "Identity Verified" ? "bg-emerald-500" : "bg-amber-500")}></span>
                        </span>
                        {livenessMessage || "Searching for faces..."}
                    </div>

                    {scannedStudent && (
                        <div className="absolute left-1/2 top-10 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-emerald-500 px-6 py-2.5 font-bold text-white shadow-xl animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>Marked: {scannedStudent}</span>
                        </div>
                    )}

                    <div className="relative flex-1 bg-black w-full h-full">
                        <video ref={videoRef} autoPlay muted className="absolute inset-0 h-full w-full object-cover opacity-90" />
                        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

                        {!modelsLoaded && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                                <span className="font-medium text-lg text-muted-foreground">Initializing Class Vision...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logs Tile */}
                <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-xl shadow-xl lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 p-6">
                        <h3 className="flex items-center gap-2.5 font-bold text-lg">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Class Activity
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                        {logs.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground gap-3">
                                <div className="p-4 rounded-full bg-secondary/50">
                                    <Activity className="h-8 w-8 opacity-30" />
                                </div>
                                <p className="text-sm font-medium">Waiting for students...</p>
                            </div>
                        ) : (
                            <div className="space-y-1 p-2">
                                {logs.map((log, i) => (
                                    <div key={i} className={cn(
                                        "group flex items-center gap-4 p-3 rounded-xl border border-transparent transition-all duration-300 animate-in fade-in slide-in-from-right-4",
                                        rejoinCandidate === log.name
                                            ? "bg-blue-500/10 border-blue-500/40"
                                            : "hover:bg-white/5 dark:hover:bg-white/5 hover:border-white/10"
                                    )}>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                                            {log.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                            <p className="text-sm font-bold leading-none truncate text-foreground">{log.name}</p>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Marked at {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </p>
                                        </div>
                                        {rejoinCandidate === log.name ? (
                                            <button
                                                onClick={handleRejoin}
                                                className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                                                Re-join
                                            </button>
                                        ) : (
                                            <div className="ml-auto">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
