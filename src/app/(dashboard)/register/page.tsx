'use client';

import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { cn } from '@/lib/utils';
import { checkSmile, getSmileRatio } from '@/lib/liveness';
import { Smile, CheckCircle2, UserPlus, Camera, RefreshCw, Loader2, ScanFace, AlertCircle, Sparkles } from 'lucide-react';

export default function Register() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [nic, setNic] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
    const [capturedImage, setCapturedImage] = useState<string | null>(null); // To show in success modal

    // Liveness State
    const [livenessVerified, setLivenessVerified] = useState(false);
    const [smileRatio, setSmileRatio] = useState(0);

    // Instruction State
    const [instruction, setInstruction] = useState("Initializing...");

    useEffect(() => {
        const loadResources = async () => {
            const MODEL_URL = '/models';
            try {
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                setInstruction("Please smile closely at the camera to verify you are human.");
            } catch (e) {
                console.error("Model load error", e);
                setStatusType('error');
                setStatus('Failed to load AI models. Please refresh.');
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera error", err);
                setStatusType('error');
                setStatus('Camera access denied. Please allow camera permissions.');
            }
        };
        loadResources();
    }, []);

    // Active Liveness Loop
    useEffect(() => {
        if (!modelsLoaded || livenessVerified) return;

        const interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks();

                if (detections) {
                    const ratio = getSmileRatio(detections.landmarks);
                    setSmileRatio(ratio);

                    // Check Smile
                    if (checkSmile(detections.landmarks)) {
                        setLivenessVerified(true);
                        setInstruction("Liveness Verified! Great Smile! 📸");
                        setStatusType('success');
                        setStatus("Anti-spoofing check passed.");
                    }
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [modelsLoaded, livenessVerified]);


    // Room State
    const [rooms, setRooms] = useState<{ _id: string, name: string }[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch('/api/rooms');
                if (res.ok) {
                    const data = await res.json();
                    setRooms(data); // data is array of rooms
                }
            } catch (e) {
                console.error("Failed to load rooms", e);
            }
        };
        fetchRooms();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoRef.current || !name) return;

        if (!livenessVerified) {
            setStatusType('error');
            setStatus("Please smile at the camera to verify liveness first.");
            return;
        }

        setIsSubmitting(true);
        setStatus('Scanning face embedding...');
        setStatusType('info');

        try {
            const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();

            if (detections) {
                const descriptor = Array.from(detections.descriptor);

                // Capture Image
                let profileImage = '';
                if (videoRef.current) {
                    const canvas = document.createElement('canvas');
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                        profileImage = canvas.toDataURL('image/jpeg', 0.8);
                    }
                }

                const response = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        phoneNumber,
                        address,
                        nic,
                        profileImage,
                        descriptors: [descriptor],
                        roomId: selectedRoomId // Send selected room ID
                    }),
                });

                if (response.ok) {
                    setStatusType('success');
                    setStatus(`Successfully registered ${name}`);
                    setCapturedImage(profileImage);

                    setTimeout(() => {
                        setCapturedImage(null);
                        setName('');
                        setPhoneNumber('');
                        setAddress('');
                        setNic('');
                        setSelectedRoomId(''); // Reset room selection
                        setLivenessVerified(false);
                        setInstruction("Please smile closely at the camera to verify you are human.");
                        setStatus(null);
                    }, 3000);
                } else {
                    const data = await response.json();
                    setStatusType('error');
                    if (response.status === 409) {
                        setStatus(`Only one face allowed! This person is already registered as "${data.existingStudent}".`);
                    } else {
                        setStatus(data.error || 'Registration failed');
                    }
                }
            } else {
                setStatusType('error');
                setStatus('No face detected. Look at the camera.');
            }
        } catch (error: any) {
            setStatusType('error');
            setStatus(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                {/* Camera Tile */}
                <div className={cn(
                    "group relative overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-500",
                    livenessVerified
                        ? "border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : "border-white/20 ring-1 ring-black/5 dark:ring-white/10"
                )}>
                    {/* Glass Overlay/Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none z-10"></div>

                    <div className="aspect-[4/3] w-full bg-black relative rounded-3xl overflow-hidden">
                        {!modelsLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3 z-20">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                                <span className="text-sm font-medium tracking-wide">Initializing Neural Networks...</span>
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className={cn(
                                "h-full w-full object-cover transition-opacity duration-700 transform scale-x-[-1]",
                                modelsLoaded ? "opacity-100" : "opacity-0"
                            )}
                        />

                        {/* Liveness Indicator Overlay */}
                        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 pointer-events-none">
                            <div className="flex justify-center">
                                <div className={cn(
                                    "px-4 py-2 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 transition-all duration-300",
                                    livenessVerified
                                        ? "bg-emerald-500/90 border-emerald-400 text-white"
                                        : "bg-black/60 border-white/10 text-white/90"
                                )}>
                                    {livenessVerified ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-sm font-semibold tracking-wide">Verified Human</span>
                                        </>
                                    ) : (
                                        <>
                                            <Smile className="w-4 h-4 animate-pulse" />
                                            <span className="text-sm font-semibold tracking-wide">Please Smile</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {!livenessVerified && (
                                <div className="text-center space-y-2">
                                    <p className="inline-block text-white/90 bg-black/50 px-4 py-1.5 rounded-lg text-sm backdrop-blur-md font-medium border border-white/10">
                                        Smile at the camera to verify
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Scanning Overlay Effect */}
                        <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                            {/* Corner Brackets */}
                            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-blue-500/50 rounded-tl-lg"></div>
                            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-blue-500/50 rounded-tr-lg"></div>
                            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-blue-500/50 rounded-bl-lg"></div>
                            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-blue-500/50 rounded-br-lg"></div>
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white/80 backdrop-blur-md border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                                Camera Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Tile */}
                <div className="flex flex-col justify-center rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50"></div>

                    <div className="relative z-10 flex flex-col space-y-2 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "p-2.5 rounded-xl ring-1 transition-colors duration-300",
                                livenessVerified
                                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20"
                                    : "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20"
                            )}>
                                {livenessVerified ? <CheckCircle2 className="w-6 h-6" /> : <Smile className="w-6 h-6" />}
                            </div>
                            <span className={cn(
                                "text-sm font-semibold uppercase tracking-wider transition-colors duration-300",
                                livenessVerified ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                            )}>
                                {livenessVerified ? "Human Verified" : "Verification Required"}
                            </span>
                        </div>
                        <h3 className="font-bold tracking-tight text-3xl md:text-4xl text-foreground">Register Personnel</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">{instruction}</p>
                    </div>

                    <form onSubmit={handleRegister} className="relative z-10 space-y-6">
                        {/* Class Selector */}
                        <div className="space-y-2.5 relative">
                            <label className="text-sm font-semibold text-foreground/80 ml-1">
                                Assign to Class (Optional)
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    // Close on blur with delay to allow clicking options
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    className="flex h-14 w-full items-center justify-between rounded-2xl border border-input bg-secondary/30 px-4 text-lg transition-all hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                >
                                    <span className={selectedRoomId ? "text-foreground" : "text-muted-foreground/50"}>
                                        {rooms.find(r => r._id === selectedRoomId)?.name || "Select a Class..."}
                                    </span>
                                    <div className="text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-5 h-5 transition-transform duration-200", isDropdownOpen && "rotate-180")}><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </button>

                                {/* Generic Dropdown Menu */}
                                <div className={cn(
                                    "absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl transition-all duration-200 origin-top",
                                    isDropdownOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                )}>
                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedRoomId(''); setIsDropdownOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                                                selectedRoomId === '' ? "bg-blue-600/20 text-blue-400" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                            )}
                                        >
                                            None (Global Only)
                                        </button>
                                        {rooms.map((room) => (
                                            <button
                                                key={room._id}
                                                type="button"
                                                onClick={() => { setSelectedRoomId(room._id); setIsDropdownOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                                                    selectedRoomId === room._id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "text-foreground hover:bg-white/5"
                                                )}
                                            >
                                                {room.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label htmlFor="name" className="text-sm font-semibold text-foreground/80 ml-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex h-14 w-full rounded-2xl border border-input bg-secondary/30 px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-secondary/50"
                                placeholder="Enter full name"
                                autoComplete="off"
                                disabled={!livenessVerified}
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground/80 ml-1">
                                Phone Number
                            </label>
                            <input
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="flex h-14 w-full rounded-2xl border border-input bg-secondary/30 px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-secondary/50"
                                placeholder="Enter phone number"
                                autoComplete="tel"
                                disabled={!livenessVerified}
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label htmlFor="address" className="text-sm font-semibold text-foreground/80 ml-1">
                                Address
                            </label>
                            <input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="flex h-14 w-full rounded-2xl border border-input bg-secondary/30 px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-secondary/50"
                                placeholder="Enter address"
                                autoComplete="street-address"
                                disabled={!livenessVerified}
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label htmlFor="nic" className="text-sm font-semibold text-foreground/80 ml-1">
                                NIC
                            </label>
                            <input
                                id="nic"
                                value={nic}
                                onChange={(e) => setNic(e.target.value)}
                                className="flex h-14 w-full rounded-2xl border border-input bg-secondary/30 px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-secondary/50"
                                placeholder="Enter NIC"
                                autoComplete="off"
                                disabled={!livenessVerified}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!modelsLoaded || isSubmitting || !name || !phoneNumber || !address || !nic || !livenessVerified}
                            className={cn(
                                "group relative w-full h-14 overflow-hidden rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none",
                                livenessVerified
                                    ? "bg-emerald-600 dark:bg-emerald-600 text-white"
                                    : "bg-foreground text-background"
                            )}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {livenessVerified ? (
                                        "Register Face"
                                    ) : (
                                        <>Smile to Verify <Smile className="w-5 h-5 text-current opacity-70 animate-pulse" /></>
                                    )}
                                </span>
                            )}
                        </button>
                    </form>

                    {status && (
                        <div className={cn(
                            "relative z-10 mt-8 p-4 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 border",
                            statusType === 'success' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                            statusType === 'error' && "bg-destructive/10 text-destructive border-destructive/20",
                            statusType === 'info' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        )}>
                            {statusType === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
                            {statusType === 'error' && <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
                            {statusType === 'info' && <Loader2 className="h-5 w-5 shrink-0 animate-spin mt-0.5" />}
                            <p className="font-medium text-base leading-snug">{status}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {capturedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-emerald-500/20 transform animate-in zoom-in-95 duration-300">
                        <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/10">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
                        <p className="text-muted-foreground mb-6">User has been successfully registered.</p>

                        <div className="rounded-2xl overflow-hidden border-4 border-white/10 shadow-lg mx-auto w-48 h-48 bg-black mb-6 relative">
                            <img src={capturedImage} alt="Captured Face" className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm py-1 text-xs text-white/90">
                                Captured Photo
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
