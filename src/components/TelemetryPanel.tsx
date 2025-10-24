import { useState, useEffect } from 'react';
import { BarChart3, Download, Trash2 } from 'lucide-react';
import { supabase, TelemetryLog } from '../lib/supabase';

export function TelemetryPanel() {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    gestureEvents: 0,
    calibrationEvents: 0,
    errorEvents: 0,
  });

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTelemetry = async () => {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setLogs(data);
      setStats({
        totalEvents: data.length,
        gestureEvents: data.filter((l) => l.event_type === 'gesture').length,
        calibrationEvents: data.filter((l) => l.event_type === 'calibration').length,
        errorEvents: data.filter((l) => l.event_type === 'error').length,
      });
    }
  };

  const clearTelemetry = async () => {
    if (!confirm('Clear all telemetry data?')) return;

    const { error } = await supabase.from('telemetry_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (!error) {
      loadTelemetry();
    }
  };

  const exportTelemetry = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `telemetry_${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Telemetry & Analytics
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportTelemetry}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={clearTelemetry}
            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-cyan-400">{stats.totalEvents}</div>
          <div className="text-xs text-slate-400 mt-1">Total Events</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-green-400">{stats.gestureEvents}</div>
          <div className="text-xs text-slate-400 mt-1">Gestures</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{stats.calibrationEvents}</div>
          <div className="text-xs text-slate-400 mt-1">Calibrations</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-red-400">{stats.errorEvents}</div>
          <div className="text-xs text-slate-400 mt-1">Errors</div>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  log.event_type === 'gesture'
                    ? 'bg-green-500/20 text-green-400'
                    : log.event_type === 'calibration'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                }`}
              >
                {log.event_type}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Joints: S:{log.joint_data.shoulder}° E:{log.joint_data.elbow}° W:{log.joint_data.wrist}°
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-8 text-slate-400">No telemetry data available</div>
        )}
      </div>
    </div>
  );
}
