import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Settings, TrendingUp } from 'lucide-react';
import { supabase, JointAngles } from '../lib/supabase';

interface DiagnosticsProps {
  joints: JointAngles;
  isPowered: boolean;
}

interface DiagnosticStatus {
  component: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

export function Diagnostics({ joints, isPowered }: DiagnosticsProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticStatus[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [operationCount, setOperationCount] = useState(0);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    runDiagnostics();
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [joints, isPowered]);

  const runDiagnostics = () => {
    const results: DiagnosticStatus[] = [];

    if (!isPowered) {
      results.push({
        component: 'Power System',
        status: 'error',
        message: 'System offline',
      });
      setDiagnostics(results);
      return;
    }

    results.push({
      component: 'Power System',
      status: 'ok',
      message: 'Operating normally',
    });

    const activeJoints = Object.values(joints).filter((v) => Math.abs(v) > 45).length;
    if (activeJoints > 6) {
      results.push({
        component: 'Motor Load',
        status: 'warning',
        message: `High load: ${activeJoints}/8 joints active`,
      });
    } else {
      results.push({
        component: 'Motor Load',
        status: 'ok',
        message: `Normal load: ${activeJoints}/8 joints active`,
      });
    }

    const shoulderStress = Math.abs(joints.shoulder) > 70;
    const elbowStress = Math.abs(joints.elbow) > 70;

    if (shoulderStress || elbowStress) {
      results.push({
        component: 'Joint Stress',
        status: 'warning',
        message: 'High stress on primary joints',
      });
    } else {
      results.push({
        component: 'Joint Stress',
        status: 'ok',
        message: 'All joints within safe limits',
      });
    }

    results.push({
      component: 'Sensors',
      status: 'ok',
      message: 'All sensors responsive',
    });

    results.push({
      component: 'Communication',
      status: 'ok',
      message: 'Real-time sync active',
    });

    setDiagnostics(results);
  };

  const runCalibration = async () => {
    if (!isPowered) return;

    setIsCalibrating(true);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const { error } = await supabase.from('telemetry_logs').insert({
      event_type: 'calibration',
      joint_data: joints,
      force_data: {},
      metadata: { timestamp: new Date().toISOString(), success: true },
    });

    setIsCalibrating(false);
    setOperationCount((prev) => prev + 1);
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-cyan-400" />
        System Diagnostics
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{formatUptime(uptime)}</div>
            <div className="text-xs text-slate-400 mt-1">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{operationCount}</div>
            <div className="text-xs text-slate-400 mt-1">Operations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {diagnostics.filter((d) => d.status === 'ok').length}/
              {diagnostics.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Health</div>
          </div>
        </div>

        <div className="space-y-2">
          {diagnostics.map((diag, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700"
            >
              {diag.status === 'ok' ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : diag.status === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-medium text-sm">{diag.component}</div>
                <div className="text-xs text-slate-400">{diag.message}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={runCalibration}
          disabled={!isPowered || isCalibrating}
          className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          {isCalibrating ? 'Calibrating...' : 'Run Calibration'}
        </button>

        {isCalibrating && (
          <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
            Running system calibration...
          </div>
        )}
      </div>
    </div>
  );
}
