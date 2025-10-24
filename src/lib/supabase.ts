import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface JointAngles {
  shoulder: number;
  elbow: number;
  wrist: number;
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface Gesture {
  id: string;
  name: string;
  description: string;
  joint_data: JointAngles;
  duration: number;
  is_preset: boolean;
  created_at: string;
  updated_at: string;
}

export interface GestureSequence {
  id: string;
  name: string;
  description: string;
  gesture_ids: string[];
  timings: number[];
  loop_count: number;
  created_at: string;
  updated_at: string;
}

export interface TelemetryLog {
  id: string;
  event_type: string;
  joint_data: JointAngles;
  force_data: Record<string, number>;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CalibrationProfile {
  id: string;
  name: string;
  joint_limits: Record<string, { min: number; max: number }>;
  force_calibration: Record<string, any>;
  sensitivity: Record<string, number>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
