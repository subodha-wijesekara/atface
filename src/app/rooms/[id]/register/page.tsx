'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as faceapi from 'face-api.js';
import { cn } from '@/lib/utils';
import { checkSmile, getSmileRatio } from '@/lib/liveness';
import { Smile, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function RoomRegister({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = use(params);
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [nic, setNic] = useState('');

    // Status State
    const [status, setStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Liveness State
    const [livenessVerified, setLivenessVerified] = useState(false);
    const [smileRatio, setSmileRatio] = useState(0);
    const [instruction, setInstruction] = useState("Initializing...");

    // Room Details (Optional fetch for UI context)
    const [roomName, setRoomName] = useState<string>('');

    useEffect(() => {
        // Fetch Room Name for context
        fetch(`/api/rooms/${roomId}`)
            .then(res => res.json())
            .then(data => {
                if (data.room) setRoomName(data.room.name);
            })
            .catch(err => console.error(err));

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
    }, [roomId]);

    // Active Liveness Loop
    useEffect(() => {
        if (!modelsLoaded || livenessVerified) return;

        const interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks();

                if (detections) {
                    const ratio = getSmileRatio(detections.landmarks);
                    setSmileRatio(ratio);

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

                // Capture Image (Resized)
                let profileImage = '';
                if (videoRef.current) {
                    const canvas = document.createElement('canvas');
                    let width = videoRef.current.videoWidth;
                    let height = videoRef.current.videoHeight;
                    const MAX_SIZE = 800;
                    if (width > MAX_SIZE || height > MAX_SIZE) {
                        if (width > height) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        } else {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.translate(width, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(videoRef.current, 0, 0, width, height);
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
                        roomId // Pass the roomId here
                    }),
                });

                if (response.ok) {
                    setStatusType('success');
                    setStatus(`Successfully registered ${name} to ${roomName}`);
                    setCapturedImage(profileImage);

                    setTimeout(() => {
                        setCapturedImage(null);
                        setName('');
                        setPhoneNumber('');
                        setAddress('');
                        setNic('');
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
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen">
            <Link href={`/rooms/${roomId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {roomName || 'Room'}
            </Link>

            <div className="flex flex-col md:flex-row gap-12 items-start justify-center">
                {/* Camera Section */}
                <div className="w-full max-w-lg mx-auto md:mx-0">
                    <div className={cn(
                        "relative overflow-hidden rounded-[2rem] border shadow-2xl aspect-[4/3] bg-black",
                        livenessVerified ? "border-emerald-500/50 ring-4 ring-emerald-500/10" : "border-white/10"
                    )}>
                        {!modelsLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3 z-20 bg-zinc-900">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                                <span className="text-sm font-medium">Loading AI Models...</span>
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className={cn(
                                "h-full w-full object-cover transform scale-x-[-1] transition-opacity duration-500",
                                modelsLoaded ? "opacity-100" : "opacity-0"
                            )}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                            <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border text-sm font-semibold shadow-lg transition-all",
                                livenessVerified
                                    ? "bg-emerald-500/90 border-emerald-400 text-white"
                                    : "bg-black/60 border-white/10 text-white/90"
                            )}>
                                {livenessVerified ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Verified Human
                                    </>
                                ) : (
                                    <>
                                        <Smile className="w-4 h-4 animate-pulse" />
                                        Smile to Verify
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full max-w-md mx-auto md:mx-0 bg-card/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-xl">
                    <div className="mb-8">
                        <span className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-2 block">Registration</span>
                        <h1 className="text-3xl font-bold mb-2">Add Student</h1>
                        <p className="text-muted-foreground">{roomName ? `Adding to ${roomName}` : 'Register a new student to this class.'}</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                placeholder="Enter full name"
                                disabled={!livenessVerified}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 ml-1">Phone Number</label>
                            <input
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                placeholder="Enter phone number"
                                disabled={!livenessVerified}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 ml-1">Address</label>
                            <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                placeholder="Enter address"
                                disabled={!livenessVerified}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 ml-1">NIC</label>
                            <input
                                value={nic}
                                onChange={(e) => setNic(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-blue-500 focus:bg-background transition-all outline-none"
                                placeholder="Enter NIC"
                                disabled={!livenessVerified}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!modelsLoaded || isSubmitting || !name || !livenessVerified}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4",
                                livenessVerified ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-zinc-700 text-zinc-400"
                            )}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : livenessVerified ? 'Register Student' : 'Verify Liveness First'}
                        </button>
                    </form>

                    {status && (
                        <div className={cn(
                            "mt-6 p-4 rounded-xl flex items-start gap-3 text-sm border",
                            statusType === 'success' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                            statusType === 'error' && "bg-red-500/10 text-red-600 border-red-500/20",
                            statusType === 'info' && "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        )}>
                            {statusType === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                            {statusType === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                            <p className="font-medium">{status}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {capturedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border border-emerald-500/20 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-500/10">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Registered!</h2>
                        <p className="text-muted-foreground mb-6">{name} has been added to {roomName}.</p>
                        <div className="aspect-square w-48 mx-auto rounded-2xl overflow-hidden border-4 border-white/10 shadow-lg bg-black relative">
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
