import { useState, useEffect } from 'react';
import { Play, Plus, Trash2, Save, List } from 'lucide-react';
import { supabase, Gesture, GestureSequence, JointAngles } from '../lib/supabase';

interface SequenceBuilderProps {
  isPowered: boolean;
  onPlaySequence: (sequence: Gesture[]) => void;
}

export function SequenceBuilder({ isPowered, onPlaySequence }: SequenceBuilderProps) {
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [sequences, setSequences] = useState<GestureSequence[]>([]);
  const [selectedGestures, setSelectedGestures] = useState<string[]>([]);
  const [sequenceName, setSequenceName] = useState('');
  const [loopCount, setLoopCount] = useState(1);

  useEffect(() => {
    loadGestures();
    loadSequences();
  }, []);

  const loadGestures = async () => {
    const { data } = await supabase.from('gestures').select('*').order('name');
    if (data) setGestures(data);
  };

  const loadSequences = async () => {
    const { data } = await supabase.from('gesture_sequences').select('*').order('created_at', { ascending: false });
    if (data) setSequences(data);
  };

  const addGestureToSequence = (gestureId: string) => {
    setSelectedGestures([...selectedGestures, gestureId]);
  };

  const removeFromSequence = (index: number) => {
    setSelectedGestures(selectedGestures.filter((_, i) => i !== index));
  };

  const saveSequence = async () => {
    if (selectedGestures.length === 0 || !sequenceName) return;

    const timings = selectedGestures.map(() => 2000);

    const { error } = await supabase.from('gesture_sequences').insert({
      name: sequenceName,
      description: `Sequence with ${selectedGestures.length} gestures`,
      gesture_ids: selectedGestures,
      timings: timings,
      loop_count: loopCount,
    });

    if (!error) {
      setSelectedGestures([]);
      setSequenceName('');
      setLoopCount(1);
      loadSequences();
      alert('Sequence saved successfully!');
    }
  };

  const playSequence = async (sequence: GestureSequence) => {
    if (!isPowered) return;

    const gestureObjects = sequence.gesture_ids
      .map((id) => gestures.find((g) => g.id === id))
      .filter((g): g is Gesture => g !== undefined);

    onPlaySequence(gestureObjects);
  };

  const deleteSequence = async (id: string) => {
    const { error } = await supabase.from('gesture_sequences').delete().eq('id', id);
    if (!error) loadSequences();
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <List className="w-5 h-5 text-cyan-400" />
        Sequence Builder
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Available Gestures</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {gestures.map((gesture) => (
              <button
                key={gesture.id}
                onClick={() => addGestureToSequence(gesture.id)}
                disabled={!isPowered}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-sm font-medium transition-all text-left"
              >
                {gesture.name}
              </button>
            ))}
          </div>
        </div>

        {selectedGestures.length > 0 && (
          <div className="pt-4 border-t border-slate-700">
            <label className="block text-sm font-medium mb-2">
              Sequence ({selectedGestures.length} gestures)
            </label>
            <div className="space-y-2 mb-4">
              {selectedGestures.map((gestureId, index) => {
                const gesture = gestures.find((g) => g.id === gestureId);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-slate-400">{index + 1}</span>
                      <span className="text-sm font-medium">{gesture?.name}</span>
                    </div>
                    <button
                      onClick={() => removeFromSequence(index)}
                      className="p-1 hover:bg-red-600/20 rounded text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                placeholder="Sequence name"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div>
                <label className="block text-sm font-medium mb-2">Loop Count</label>
                <input
                  type="number"
                  value={loopCount}
                  onChange={(e) => setLoopCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <button
                onClick={saveSequence}
                disabled={!sequenceName}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Sequence
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-700">
          <label className="block text-sm font-medium mb-2">Saved Sequences</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sequences.map((sequence) => (
              <div
                key={sequence.id}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{sequence.name}</div>
                  <span className="text-xs text-slate-400">
                    {sequence.gesture_ids.length} gestures
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => playSequence(sequence)}
                    disabled={!isPowered}
                    className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                  <button
                    onClick={() => deleteSequence(sequence.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {sequences.length === 0 && (
              <div className="text-center py-4 text-slate-400 text-sm">No saved sequences</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
