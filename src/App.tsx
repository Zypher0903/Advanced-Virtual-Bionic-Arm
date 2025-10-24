import { useState } from 'react';
import { Hand, RotateCw, Power, Cpu } from 'lucide-react';
import { JointAngles, Gesture, supabase } from './lib/supabase';
import { GestureRecorder } from './components/GestureRecorder';
import { GestureLibrary } from './components/GestureLibrary';
import { ForceSensors } from './components/ForceSensors';
import { Diagnostics } from './components/Diagnostics';
import { TelemetryPanel } from './components/TelemetryPanel';
import { SequenceBuilder } from './components/SequenceBuilder';

function App() {
  const [joints, setJoints] = useState<JointAngles>({
    shoulder: 0,
    elbow: 0,
    wrist: 0,
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  });

  const [isPowered, setIsPowered] = useState(true);
  const [activeTab, setActiveTab] = useState<'control' | 'library' | 'sequence' | 'telemetry'>('control');
  const [motorSpeed, setMotorSpeed] = useState(50);

  const updateJoint = (joint: keyof JointAngles, value: number) => {
    if (!isPowered) return;
    setJoints(prev => {
      const newJoints = { ...prev, [joint]: value };
      logTelemetry('joint_update', newJoints);
      return newJoints;
    });
  };

  const loadGesture = async (gestureJoints: JointAngles) => {
    if (!isPowered) return;

    const startJoints = { ...joints };
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const interpolated: JointAngles = {} as JointAngles;

      (Object.keys(gestureJoints) as Array<keyof JointAngles>).forEach(key => {
        interpolated[key] = Math.round(
          startJoints[key] + (gestureJoints[key] - startJoints[key]) * progress
        );
      });

      setJoints(interpolated);
      await new Promise(resolve => setTimeout(resolve, (100 - motorSpeed) * 2));
    }

    await logTelemetry('gesture', gestureJoints);
  };

  const playSequence = async (gestures: Gesture[]) => {
    for (const gesture of gestures) {
      await loadGesture(gesture.joint_data);
      await new Promise(resolve => setTimeout(resolve, gesture.duration));
    }
  };

  const logTelemetry = async (eventType: string, jointData: JointAngles) => {
    await supabase.from('telemetry_logs').insert({
      event_type: eventType,
      joint_data: jointData,
      force_data: {},
      metadata: { timestamp: new Date().toISOString() }
    });
  };

  const resetPosition = () => {
    if (!isPowered) return;
    setJoints({
      shoulder: 0,
      elbow: 0,
      wrist: 0,
      thumb: 0,
      index: 0,
      middle: 0,
      ring: 0,
      pinky: 0,
    });
  };

  const quickGestures = [
    { name: 'Open', joints: { shoulder: 0, elbow: 0, wrist: 0, thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 } },
    { name: 'Grip', joints: { shoulder: 0, elbow: 0, wrist: 0, thumb: 90, index: 90, middle: 90, ring: 90, pinky: 90 } },
    { name: 'Point', joints: { shoulder: 0, elbow: 0, wrist: 0, thumb: 45, index: 0, middle: 90, ring: 90, pinky: 90 } },
    { name: 'Peace', joints: { shoulder: 0, elbow: 0, wrist: 0, thumb: 45, index: 0, middle: 0, ring: 90, pinky: 90 } },
    { name: 'Thumbs Up', joints: { shoulder: 0, elbow: 0, wrist: -20, thumb: 0, index: 90, middle: 90, ring: 90, pinky: 90 } },
    { name: 'OK', joints: { shoulder: 0, elbow: 0, wrist: 0, thumb: 45, index: 45, middle: 0, ring: 0, pinky: 0 } },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hand className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Advanced Bionic Arm System
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Professional Control Interface v2.0</p>
              </div>
            </div>
            <button
              onClick={() => setIsPowered(!isPowered)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isPowered
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <Power className="w-5 h-5" />
              {isPowered ? 'Powered' : 'Off'}
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            {(['control', 'library', 'sequence', 'telemetry'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {activeTab === 'control' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  3D Visualization
                </h2>
                <div className="aspect-square bg-slate-900/50 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-700">
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full"
                    style={{ filter: isPowered ? 'none' : 'grayscale(1) opacity(0.3)' }}
                  >
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100,200,255,0.1)" strokeWidth="0.5" />
                      </pattern>
                      <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#94a3b8', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#cbd5e1', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#64748b', stopOpacity: 1 }} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <rect width="400" height="400" fill="url(#grid)" />

                    <g transform={`translate(200, 80) rotate(${joints.shoulder})`}>
                      <circle cx="0" cy="0" r="12" fill="#0ea5e9" filter="url(#glow)" />

                      <g transform="translate(0, 0)">
                        <rect
                          x="-10"
                          y="0"
                          width="20"
                          height="80"
                          fill="url(#metalGradient)"
                          stroke="#0ea5e9"
                          strokeWidth="2"
                          rx="4"
                        />
                        <line x1="0" y1="20" x2="0" y2="60" stroke="#0ea5e9" strokeWidth="1" opacity="0.5" />

                        <g transform={`translate(0, 80) rotate(${joints.elbow})`}>
                          <circle cx="0" cy="0" r="10" fill="#06b6d4" filter="url(#glow)" />

                          <rect
                            x="-8"
                            y="0"
                            width="16"
                            height="70"
                            fill="url(#metalGradient)"
                            stroke="#06b6d4"
                            strokeWidth="2"
                            rx="4"
                          />
                          <line x1="0" y1="15" x2="0" y2="55" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />

                          <g transform={`translate(0, 70) rotate(${joints.wrist})`}>
                            <circle cx="0" cy="0" r="8" fill="#22d3ee" filter="url(#glow)" />

                            <rect
                              x="-12"
                              y="0"
                              width="24"
                              height="30"
                              fill="url(#metalGradient)"
                              stroke="#22d3ee"
                              strokeWidth="2"
                              rx="6"
                            />

                            <g transform={`translate(-12, 8) rotate(${-45 + joints.thumb * 0.5})`}>
                              <rect
                                x="-3"
                                y="0"
                                width="6"
                                height="22"
                                fill="#94a3b8"
                                stroke="#22d3ee"
                                strokeWidth="1.5"
                                rx="3"
                              />
                            </g>

                            {[
                              { x: -8, joint: joints.index },
                              { x: -2, joint: joints.middle },
                              { x: 4, joint: joints.ring },
                              { x: 10, joint: joints.pinky }
                            ].map((finger, i) => (
                              <g key={i} transform={`translate(${finger.x}, 30)`}>
                                <rect
                                  x="-2.5"
                                  y="0"
                                  width="5"
                                  height={25 + (i === 1 ? 3 : i === 3 ? -3 : 0)}
                                  fill="#94a3b8"
                                  stroke="#22d3ee"
                                  strokeWidth="1.5"
                                  rx="2.5"
                                  transform={`rotate(${finger.joint})`}
                                  style={{ transformOrigin: 'center top' }}
                                />
                              </g>
                            ))}
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
              </div>

              <ForceSensors joints={joints} isPowered={isPowered} />
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-3 gap-3">
                  {quickGestures.map((gesture) => (
                    <button
                      key={gesture.name}
                      onClick={() => loadGesture(gesture.joints)}
                      disabled={!isPowered}
                      className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition-all"
                    >
                      {gesture.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={resetPosition}
                  disabled={!isPowered}
                  className="w-full mt-3 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-5 h-5" />
                  Reset Position
                </button>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Joint Controls</h2>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-slate-400">Speed: {motorSpeed}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={motorSpeed}
                    onChange={(e) => setMotorSpeed(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Arm</h3>
                    {(['shoulder', 'elbow', 'wrist'] as const).map((joint) => (
                      <div key={joint}>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium capitalize">{joint}</label>
                          <span className="text-sm text-slate-400">{joints[joint]}°</span>
                        </div>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          value={joints[joint]}
                          onChange={(e) => updateJoint(joint, parseInt(e.target.value))}
                          disabled={!isPowered}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-cyan-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-700">
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Fingers</h3>
                    {(['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map((joint) => (
                      <div key={joint}>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium capitalize">{joint}</label>
                          <span className="text-sm text-slate-400">{joints[joint]}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={joints[joint]}
                          onChange={(e) => updateJoint(joint, parseInt(e.target.value))}
                          disabled={!isPowered}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-cyan-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <GestureRecorder
                currentJoints={joints}
                isPowered={isPowered}
                onPlayGesture={loadGesture}
              />

              <Diagnostics joints={joints} isPowered={isPowered} />
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="max-w-4xl mx-auto">
            <GestureLibrary isPowered={isPowered} onLoadGesture={loadGesture} />
          </div>
        )}

        {activeTab === 'sequence' && (
          <div className="max-w-4xl mx-auto">
            <SequenceBuilder isPowered={isPowered} onPlaySequence={playSequence} />
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="max-w-4xl mx-auto">
            <TelemetryPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
