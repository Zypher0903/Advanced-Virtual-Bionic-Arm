import { useState } from 'react';
import { Save, Play, Pause, Square } from 'lucide-react';
import { supabase, JointAngles } from '../lib/supabase';

interface GestureRecorderProps {
  currentJoints: JointAngles;
  isPowered: boolean;
  onPlayGesture: (joints: JointAngles) => void;
}

export function GestureRecorder({ currentJoints, isPowered, onPlayGesture }: GestureRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<{ joints: JointAngles; timestamp: number }[]>([]);
  const [recordingStartTime, setRecordingStartTime] = useState(0);
  const [gestureName, setGestureName] = useState('');
  const [gestureDescription, setGestureDescription] = useState('');

  const startRecording = () => {
    if (!isPowered) return;
    setIsRecording(true);
    setRecordedFrames([]);
    setRecordingStartTime(Date.now());

    const interval = setInterval(() => {
      setRecordedFrames(prev => [...prev, {
        joints: { ...currentJoints },
        timestamp: Date.now()
      }]);
    }, 100);

    (window as any).recordingInterval = interval;
  };

  const stopRecording = () => {
    setIsRecording(false);
    if ((window as any).recordingInterval) {
      clearInterval((window as any).recordingInterval);
    }
  };

  const saveGesture = async () => {
    if (recordedFrames.length === 0 || !gestureName) return;

    const duration = recordedFrames[recordedFrames.length - 1].timestamp - recordedFrames[0].timestamp;

    const { error } = await supabase
      .from('gestures')
      .insert({
        name: gestureName,
        description: gestureDescription,
        joint_data: recordedFrames[0].joints,
        duration: duration,
        is_preset: false
      });

    if (!error) {
      setRecordedFrames([]);
      setGestureName('');
      setGestureDescription('');
      alert('Gesture saved successfully!');
    }
  };

  const playRecording = async () => {
    if (recordedFrames.length === 0) return;

    for (let i = 0; i < recordedFrames.length; i++) {
      const frame = recordedFrames[i];
      onPlayGesture(frame.joints);

      if (i < recordedFrames.length - 1) {
        const delay = recordedFrames[i + 1].timestamp - frame.timestamp;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
        Gesture Recorder
      </h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={!isPowered}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <div className="w-3 h-3 rounded-full bg-white"></div>
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </button>
          )}

          {recordedFrames.length > 0 && !isRecording && (
            <button
              onClick={playRecording}
              disabled={!isPowered}
              className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition-all"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
        </div>

        {recordedFrames.length > 0 && !isRecording && (
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <div>
              <label className="block text-sm font-medium mb-2">Gesture Name</label>
              <input
                type="text"
                value={gestureName}
                onChange={(e) => setGestureName(e.target.value)}
                placeholder="e.g., Custom Wave"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <input
                type="text"
                value={gestureDescription}
                onChange={(e) => setGestureDescription(e.target.value)}
                placeholder="Describe the gesture"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={saveGesture}
              disabled={!gestureName}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Gesture
            </button>

            <div className="text-sm text-slate-400">
              Recorded {recordedFrames.length} frames
              ({((recordedFrames[recordedFrames.length - 1]?.timestamp - recordedFrames[0]?.timestamp) / 1000).toFixed(1)}s)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
