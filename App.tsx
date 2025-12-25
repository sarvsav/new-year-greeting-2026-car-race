import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Car } from './components/Car';
import { Track } from './components/Track';

// Game Constants
const MAX_SPEED = 25;
const ACCELERATION = 0.5;
const FRICTION = 0.2;
const FINISH_LINE_DISTANCE = 4000;

export default function App() {
    // Game State
    const [velocity, setVelocity] = useState(0);
    const [distance, setDistance] = useState(0);
    const [isGasPressed, setIsGasPressed] = useState(false);
    const [gameStatus, setGameStatus] = useState<'IDLE' | 'RACING' | 'FINISHED'>('IDLE');
    const [driver, setDriver] = useState<'male' | 'female' | null>(null);
    const [greeting, setGreeting] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    // Refs for loop
    const requestRef = useRef<number>(0);
    const velocityRef = useRef(0);
    const distanceRef = useRef(0);
    const isGasPressedRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Audio Node Refs for Engine
    const engineOscRef = useRef<OscillatorNode | null>(null);
    const engineGainRef = useRef<GainNode | null>(null);
    const engineFilterRef = useRef<BiquadFilterNode | null>(null);
    const engineLfoRef = useRef<OscillatorNode | null>(null);

    // Initialize Audio
    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                audioContextRef.current = new AudioCtx();
            }
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // Initialize Engine Sound if not exists
        if (!engineOscRef.current && audioContextRef.current) {
            const ctx = audioContextRef.current;
            const t = ctx.currentTime;

            // 1. Main Tone (Sawtooth for buzzy engine)
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = 60; // Base idle frequency

            // 2. LFO for Rumble (Frequency Modulation)
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 15; // Rumble speed
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 10; // Rumble depth

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency); // Modulate pitch

            // 3. Filter (Muffler simulation)
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Muffled start
            filter.Q.value = 1;

            // 4. Master Volume for Engine
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, t); // Start silent

            // Connections
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            // Start Generators
            osc.start(t);
            lfo.start(t);

            // Save Refs
            engineOscRef.current = osc;
            engineLfoRef.current = lfo;
            engineFilterRef.current = filter;
            engineGainRef.current = gain;
        }
    };

    const playCheerSound = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const t = ctx.currentTime;

        // --- 1. Fade out engine ---
        if (engineGainRef.current) {
            engineGainRef.current.gain.setTargetAtTime(0, t, 0.5);
        }

        // --- 2. Crowd Roar ---
        const bufferSize = ctx.sampleRate * 3; // 3 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const roarSource = ctx.createBufferSource();
        roarSource.buffer = buffer;

        // Lowpass filter for the roar (sounds like a large crowd)
        const roarFilter = ctx.createBiquadFilter();
        roarFilter.type = 'lowpass';
        roarFilter.frequency.setValueAtTime(400, t);
        roarFilter.frequency.linearRampToValueAtTime(800, t + 2); // Rising energy

        const roarGain = ctx.createGain();
        roarGain.gain.setValueAtTime(0, t);
        roarGain.gain.linearRampToValueAtTime(0.4, t + 0.5);
        roarGain.gain.exponentialRampToValueAtTime(0.01, t + 4);

        roarSource.connect(roarFilter);
        roarFilter.connect(roarGain);
        roarGain.connect(ctx.destination);
        roarSource.start();

        // --- 3. Clapping Effect ---
        // Simulate clapping by scheduling short bursts of bandpass filtered noise
        const clapCount = 20; // Number of "claps" to schedule roughly
        for (let i = 0; i < clapCount; i++) {
            // Randomize timing slightly to sound like a crowd
            const start = t + 0.2 + (Math.random() * 2.5);

            const clapBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
            const clapData = clapBuffer.getChannelData(0);
            for (let j = 0; j < clapData.length; j++) {
                clapData[j] = (Math.random() * 2 - 1);
            }

            const clapSrc = ctx.createBufferSource();
            clapSrc.buffer = clapBuffer;

            const clapFilter = ctx.createBiquadFilter();
            clapFilter.type = 'bandpass';
            clapFilter.frequency.value = 1000 + (Math.random() * 500); // Varied clap tones
            clapFilter.Q.value = 1;

            const clapGain = ctx.createGain();
            clapGain.gain.setValueAtTime(0.1, start);
            clapGain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);

            clapSrc.connect(clapFilter);
            clapFilter.connect(clapGain);
            clapGain.connect(ctx.destination);
            clapSrc.start(start);
        }

        // --- 4. Victory Fanfare (Music) ---
        // Simple melody: C4, E4, G4, C5 (Arpeggio)
        const notes = [
            { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
            { freq: 659.25, time: 0.15, dur: 0.15 }, // E5
            { freq: 783.99, time: 0.30, dur: 0.15 }, // G5
            { freq: 1046.50, time: 0.45, dur: 0.8 }, // C6
        ];

        notes.forEach(({ freq, time, dur }) => {
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();

            osc.type = 'triangle'; // 8-bit / Synth feel
            osc.frequency.setValueAtTime(freq, t + time);

            oscGain.gain.setValueAtTime(0, t + time);
            oscGain.gain.linearRampToValueAtTime(0.3, t + time + 0.05);
            oscGain.gain.linearRampToValueAtTime(0, t + time + dur);

            osc.connect(oscGain);
            oscGain.connect(ctx.destination);

            osc.start(t + time);
            osc.stop(t + time + dur + 0.1);
        });
    };

    // Sync refs with state for loop
    useEffect(() => {
        isGasPressedRef.current = isGasPressed;
    }, [isGasPressed]);

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Physics Loop
    const animate = useCallback(() => {
        let currentVelocity = velocityRef.current;
        let currentDistance = distanceRef.current;

        // Apply physics
        if (isGasPressedRef.current && currentDistance < FINISH_LINE_DISTANCE + 500) {
            currentVelocity += ACCELERATION;
        } else {
            currentVelocity -= FRICTION;
        }

        // Clamp values
        currentVelocity = Math.max(0, Math.min(currentVelocity, MAX_SPEED));
        currentDistance += currentVelocity;

        // Update Refs
        velocityRef.current = currentVelocity;
        distanceRef.current = currentDistance;

        // Update Audio Parameters based on Velocity
        if (audioContextRef.current && engineOscRef.current && engineFilterRef.current && engineGainRef.current && engineLfoRef.current) {
            const now = audioContextRef.current.currentTime;
            const v = currentVelocity;

            // Pitch: 60Hz idle -> ~200Hz max
            const targetPitch = 60 + (v * 6);
            engineOscRef.current.frequency.setTargetAtTime(targetPitch, now, 0.1);

            // Rumble Speed: 15Hz idle -> ~40Hz max
            const targetLfoFreq = 15 + (v * 1);
            engineLfoRef.current.frequency.setTargetAtTime(targetLfoFreq, now, 0.1);

            // Filter: Open up as speed increases (400Hz -> 1500Hz)
            const targetFilterFreq = 400 + (v * 50);
            engineFilterRef.current.frequency.setTargetAtTime(targetFilterFreq, now, 0.1);

            // Volume: Only audible when moving (or very slightly when just starting)
            // If speed < 0.1, mute. Otherwise scale volume 0.1 -> 0.2
            const targetGain = v > 0.1 ? Math.min(0.2, 0.05 + (v * 0.005)) : 0;
            engineGainRef.current.gain.setTargetAtTime(targetGain, now, 0.1);
        }

        // Update State for rendering
        setVelocity(currentVelocity);
        setDistance(currentDistance);

        // Check Win Condition
        if (currentDistance >= FINISH_LINE_DISTANCE && gameStatus !== 'FINISHED') {
            finishRace();
        } else {
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [gameStatus]);

    // Start Loop
    useEffect(() => {
        if (gameStatus === 'RACING') {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameStatus, animate]);

    const finishRace = async () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        setGameStatus('FINISHED');
        setShowCelebration(true);
        playCheerSound();
        setIsGenerating(true);

        const msg = "Thank you for Amazing 2025! May your filled with a lot of happiness, good health, and success.";
        setGreeting(msg);
        setIsGenerating(false);
    };

    const handleGasStart = (e: React.SyntheticEvent) => {
        e.preventDefault();
        initAudio(); // Ensure AudioContext is ready and engine is init
        if (gameStatus === 'FINISHED') return;
        if (gameStatus === 'IDLE') setGameStatus('RACING');
        setIsGasPressed(true);
    };

    const handleGasEnd = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsGasPressed(false);
    };

    const resetGame = () => {
        setGameStatus('IDLE');
        setDistance(0);
        setVelocity(0);
        setGreeting('');
        setShowCelebration(false);
        setDriver(null); // Reset driver to allow selection again
        velocityRef.current = 0;
        distanceRef.current = 0;
    };

    const selectDriver = (type: 'male' | 'female') => {
        setDriver(type);
        initAudio(); // Initialize audio context on first interaction
    };

    // Calculate Progress for UI
    const progress = Math.min(100, (distance / FINISH_LINE_DISTANCE) * 100);

    return (
        <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans select-none touch-none">

            {/* Styles for animation */}
            <style>{`
          @keyframes flash {
            0% { opacity: 0.8; }
            100% { opacity: 0; }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
      `}</style>

            {/* Background: Sunset Beach Sky */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-600 via-purple-500 to-orange-400 z-0"></div>

            {/* Sun/Moon */}
            <div className="absolute top-10 right-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 blur-sm z-0 shadow-[0_0_50px_rgba(255,200,0,0.5)]"
                style={{ transform: `translateX(${-distance * 0.02}px)` }}></div>

            {/* Ocean Horizon */}
            <div className="absolute bottom-1/2 left-0 w-full h-1/4 bg-blue-700 z-0 transform origin-bottom scale-y-110"></div>
            <div className="absolute bottom-1/2 left-0 w-[200%] h-4 bg-blue-500/50 animate-pulse z-0" style={{ transform: `translateX(${-distance * 0.05}px)` }}></div>

            {/* Sand/Ground */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#dcb162] z-0"></div>

            {/* Main Game View */}
            {/* Lifted up slightly for mobile to leave room for controls */}
            <div className="absolute inset-x-0 bottom-[20%] sm:bottom-[30%] h-[300px] sm:h-[400px] w-full overflow-hidden z-10">
                <Track distance={distance} />

                {/* Car Container */}
                {/* Adjusted top value to center car on road: top-[calc(25%+4rem+2rem)] roughly */}
                {/* Road starts at 25% + 4rem. Road height 8rem. Center is 25% + 8rem. */}
                {/* Car center is translateY(-50%). So top should be 25% + 8rem (minus slight offset for perspective). */}
                <div className="absolute left-4 sm:left-10 md:left-32 top-[calc(25%+6.5rem)] sm:top-[calc(25%+7.5rem)] transition-all duration-75 ease-out z-20"
                    style={{ transform: `translateY(calc(-50% + ${Math.sin(distance / 50) * 1.5}px))` }}>
                    <Car isMoving={velocity > 0.5} velocity={velocity} driver={driver || 'male'} />
                </div>
            </div>

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full p-4 sm:p-6 z-40 flex justify-between items-start pointer-events-none">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white italic drop-shadow-md">NYE RACER <span className="text-yellow-300">2026</span></h1>
                    {driver ? (
                        <p className="text-slate-100 text-xs sm:text-sm drop-shadow">Hold GAS to reach the new year!</p>
                    ) : (
                        <p className="text-slate-100 text-xs sm:text-sm drop-shadow animate-pulse">Select your driver...</p>
                    )}
                </div>
                {driver && (
                    <div className="text-right">
                        <div className="text-2xl sm:text-4xl font-mono text-yellow-400 font-bold drop-shadow-md">{Math.floor(velocity * 10)} <span className="text-xs sm:text-base text-white">KM/H</span></div>
                        <div className="w-24 sm:w-32 h-2 bg-slate-700/50 rounded-full mt-2 overflow-hidden backdrop-blur-sm">
                            <div className="h-full bg-yellow-400" style={{ width: `${(velocity / MAX_SPEED) * 100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {driver && (
                <div className="absolute bottom-28 sm:bottom-32 left-0 w-full px-4 sm:px-6 z-40 pointer-events-none">
                    <div className="w-full h-3 sm:h-4 bg-slate-800/80 rounded-full border border-slate-600/50 relative overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-gradient-to-r from-red-500 to-yellow-400 transition-all duration-75 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${progress}%` }}></div>
                        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-2 text-[10px] text-white font-mono items-center">
                            <span>2025</span>
                            <span>2026</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls or Driver Selection */}
            <div className="absolute bottom-0 left-0 w-full h-28 sm:h-32 bg-gradient-to-t from-black/80 to-transparent z-50 flex items-center justify-center pb-6 sm:pb-8">
                {!driver ? (
                    <div className="flex space-x-8 animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <button onClick={() => selectDriver('male')} className="flex flex-col items-center group">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500 border-4 border-white shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                {/* Simple Helmet Icon */}
                                <div className="w-8 h-8 rounded-full bg-blue-800 relative">
                                    <div className="absolute top-2 left-1 w-6 h-3 bg-black rounded-sm"></div>
                                </div>
                            </div>
                            <span className="mt-2 text-white font-bold text-sm drop-shadow-md bg-black/50 px-2 rounded">AG</span>
                        </button>
                        <button onClick={() => selectDriver('female')} className="flex flex-col items-center group">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-pink-500 border-4 border-white shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                {/* Simple Helmet Icon */}
                                <div className="w-8 h-8 rounded-full bg-pink-700 relative">
                                    <div className="absolute top-2 left-1 w-6 h-3 bg-black rounded-sm"></div>
                                </div>
                            </div>
                            <span className="mt-2 text-white font-bold text-sm drop-shadow-md bg-black/50 px-2 rounded">IG</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onMouseDown={handleGasStart}
                        onMouseUp={handleGasEnd}
                        onMouseLeave={handleGasEnd}
                        onTouchStart={handleGasStart}
                        onTouchEnd={handleGasEnd}
                        className={`
                    relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 transition-all duration-100 ease-out select-none touch-none active:scale-95
                    ${isGasPressed ? 'bg-red-600 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.8)]' : 'bg-red-700 border-red-900 shadow-xl hover:bg-red-600'}
                `}
                    >
                        <span className="absolute inset-0 flex items-center justify-center font-black text-lg sm:text-xl italic tracking-tighter text-white">GAS</span>
                        {/* Pedal Texture */}
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_50%,#000_50%)] bg-[length:4px_4px] rounded-full"></div>
                    </button>
                )}
            </div>

            {/* Celebration Effects */}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-[70]">
                    {/* Flash Overlay */}
                    <div className="absolute inset-0 bg-white" style={{ animation: 'flash 0.8s ease-out forwards' }}></div>

                    {/* Confetti */}
                    {Array.from({ length: 60 }).map((_, i) => (
                        <div key={i}
                            className="absolute top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-sm"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)],
                                animation: `confetti-fall ${2 + Math.random() * 2}s ease-out forwards`,
                                animationDelay: `${0.1 + Math.random() * 0.5}s`,
                                opacity: 0
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Victory Modal */}
            {gameStatus === 'FINISHED' && (
                <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500">
                    <div className="bg-slate-900 border border-slate-700 p-6 sm:p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>

                        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-6 drop-shadow-sm">
                            HAPPY NEW YEAR!
                        </h2>

                        <div className="min-h-[100px] flex items-center justify-center mb-8">
                            {isGenerating ? (
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-slate-400 text-sm animate-pulse">Consulting the Racing Gods...</p>
                                </div>
                            ) : (
                                <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
                                    "{greeting}"
                                </p>
                            )}
                        </div>

                        <button
                            onClick={resetGame}
                            className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-sm"
                        >
                            Race Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}