import { useState, useEffect } from 'react';
import { Activity, Zap } from 'lucide-react';
import { JointAngles } from '../lib/supabase';

interface ForceSensorsProps {
  joints: JointAngles;
  isPowered: boolean;
}

export function ForceSensors({ joints, isPowered }: ForceSensorsProps) {
  const [forces, setForces] = useState({
    grip: 0,
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  });

  const [hapticFeedback, setHapticFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isPowered) {
      setForces({
        grip: 0,
        thumb: 0,
        index: 0,
        middle: 0,
        ring: 0,
        pinky: 0,
      });
      return;
    }

    const calculateForce = (angle: number) => {
      return Math.floor((angle / 90) * 100);
    };

    const newForces = {
      grip: Math.floor(
        (joints.thumb + joints.index + joints.middle + joints.ring + joints.pinky) / 5
      ),
      thumb: calculateForce(joints.thumb),
      index: calculateForce(joints.index),
      middle: calculateForce(joints.middle),
      ring: calculateForce(joints.ring),
      pinky: calculateForce(joints.pinky),
    };

    setForces(newForces);

    if (newForces.grip > 70) {
      setHapticFeedback('Strong grip detected');
      setTimeout(() => setHapticFeedback(null), 2000);
    }
  }, [joints, isPowered]);

  const getForceColor = (force: number) => {
    if (force < 30) return 'bg-green-500';
    if (force < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getForceLevel = (force: number) => {
    if (force < 30) return 'Low';
    if (force < 70) return 'Medium';
    return 'High';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" />
        Force Sensors & Haptics
      </h2>

      {hapticFeedback && (
        <div className="mb-4 p-3 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center gap-2 animate-pulse">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-300">{hapticFeedback}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="p-4 bg-slate-900/50 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-cyan-400">Overall Grip Force</span>
            <span className="text-sm text-slate-400">{forces.grip}%</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getForceColor(forces.grip)} transition-all duration-300`}
              style={{ width: `${forces.grip}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-slate-400">{getForceLevel(forces.grip)} Force</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map((finger) => (
            <div key={finger} className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium capitalize">{finger}</span>
                <span className="text-xs text-slate-400">{forces[finger]}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getForceColor(forces[finger])} transition-all duration-300`}
                  style={{ width: `${forces[finger]}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Sensor Status
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPowered ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
              <span className="text-slate-400">Palm Sensor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPowered ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
              <span className="text-slate-400">Fingertip Array</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPowered ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
              <span className="text-slate-400">Pressure Matrix</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
