import { useState, useEffect } from 'react';
import { Play, Trash2, Download, Upload } from 'lucide-react';
import { supabase, Gesture, JointAngles } from '../lib/supabase';

interface GestureLibraryProps {
  isPowered: boolean;
  onLoadGesture: (joints: JointAngles) => void;
}

export function GestureLibrary({ isPowered, onLoadGesture }: GestureLibraryProps) {
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [filter, setFilter] = useState<'all' | 'preset' | 'custom'>('all');

  useEffect(() => {
    loadGestures();
  }, []);

  const loadGestures = async () => {
    const { data, error } = await supabase
      .from('gestures')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setGestures(data);
    }
  };

  const deleteGesture = async (id: string) => {
    const { error } = await supabase
      .from('gestures')
      .delete()
      .eq('id', id);

    if (!error) {
      loadGestures();
    }
  };

  const exportGesture = (gesture: Gesture) => {
    const dataStr = JSON.stringify(gesture, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${gesture.name.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  const importGesture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const gesture = JSON.parse(text);

        const { error } = await supabase
          .from('gestures')
          .insert({
            name: gesture.name,
            description: gesture.description,
            joint_data: gesture.joint_data,
            duration: gesture.duration,
            is_preset: false
          });

        if (!error) {
          loadGestures();
        }
      }
    };
    input.click();
  };

  const filteredGestures = gestures.filter(g => {
    if (filter === 'preset') return g.is_preset;
    if (filter === 'custom') return !g.is_preset;
    return true;
  });

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Gesture Library</h2>
        <button
          onClick={importGesture}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'preset', 'custom'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredGestures.map((gesture) => (
          <div
            key={gesture.id}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{gesture.name}</h3>
                  {gesture.is_preset && (
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                      Preset
                    </span>
                  )}
                </div>
                {gesture.description && (
                  <p className="text-sm text-slate-400 mt-1">{gesture.description}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onLoadGesture(gesture.joint_data)}
                disabled={!isPowered}
                className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Load
              </button>
              <button
                onClick={() => exportGesture(gesture)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
              {!gesture.is_preset && (
                <button
                  onClick={() => deleteGesture(gesture.id)}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredGestures.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No gestures found
          </div>
        )}
      </div>
    </div>
  );
}
