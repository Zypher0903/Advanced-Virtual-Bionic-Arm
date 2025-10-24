/*
  # Bionic Arm Control System Database Schema

  1. New Tables
    - `gestures`
      - `id` (uuid, primary key) - Unique gesture identifier
      - `name` (text) - Name of the gesture
      - `description` (text) - Description of what the gesture does
      - `joint_data` (jsonb) - Stored joint angles for all 8 joints
      - `duration` (integer) - Duration in milliseconds
      - `is_preset` (boolean) - Whether this is a system preset or user-created
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `gesture_sequences`
      - `id` (uuid, primary key) - Unique sequence identifier
      - `name` (text) - Name of the sequence
      - `description` (text) - Description of the sequence
      - `gesture_ids` (jsonb) - Array of gesture IDs in order
      - `timings` (jsonb) - Timing data for each gesture transition
      - `loop_count` (integer) - Number of times to repeat (-1 for infinite)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `telemetry_logs`
      - `id` (uuid, primary key) - Unique log entry identifier
      - `event_type` (text) - Type of event (gesture, calibration, error, etc.)
      - `joint_data` (jsonb) - Joint angles at time of event
      - `force_data` (jsonb) - Force sensor readings
      - `metadata` (jsonb) - Additional event metadata
      - `created_at` (timestamptz) - Event timestamp

    - `calibration_profiles`
      - `id` (uuid, primary key) - Unique profile identifier
      - `name` (text) - Profile name
      - `joint_limits` (jsonb) - Min/max limits for each joint
      - `force_calibration` (jsonb) - Force sensor calibration data
      - `sensitivity` (jsonb) - Sensitivity settings for each joint
      - `is_active` (boolean) - Whether this profile is currently active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (demo mode)
    - Add policies for insert/update/delete operations

  3. Important Notes
    - This is a demo application, so RLS policies allow public access
    - In production, these should be restricted to authenticated users
    - JSON data structures allow flexible storage of complex arm data
*/

-- Create gestures table
CREATE TABLE IF NOT EXISTS gestures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  joint_data jsonb NOT NULL,
  duration integer DEFAULT 1000,
  is_preset boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gesture_sequences table
CREATE TABLE IF NOT EXISTS gesture_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  gesture_ids jsonb NOT NULL,
  timings jsonb NOT NULL,
  loop_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create telemetry_logs table
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  joint_data jsonb NOT NULL,
  force_data jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create calibration_profiles table
CREATE TABLE IF NOT EXISTS calibration_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  joint_limits jsonb NOT NULL,
  force_calibration jsonb DEFAULT '{}',
  sensitivity jsonb DEFAULT '{}',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gestures ENABLE ROW LEVEL SECURITY;
ALTER TABLE gesture_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Public access for demo)
CREATE POLICY "Anyone can view gestures"
  ON gestures FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create gestures"
  ON gestures FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update gestures"
  ON gestures FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete gestures"
  ON gestures FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view sequences"
  ON gesture_sequences FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sequences"
  ON gesture_sequences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sequences"
  ON gesture_sequences FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sequences"
  ON gesture_sequences FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view telemetry"
  ON telemetry_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create telemetry"
  ON telemetry_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view calibration profiles"
  ON calibration_profiles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create calibration profiles"
  ON calibration_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update calibration profiles"
  ON calibration_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete calibration profiles"
  ON calibration_profiles FOR DELETE
  USING (true);

-- Insert default preset gestures
INSERT INTO gestures (name, description, joint_data, is_preset) VALUES
  ('Rest Position', 'Neutral resting position', '{"shoulder":0,"elbow":0,"wrist":0,"thumb":0,"index":0,"middle":0,"ring":0,"pinky":0}', true),
  ('Full Grip', 'Close all fingers for gripping', '{"shoulder":0,"elbow":0,"wrist":0,"thumb":90,"index":90,"middle":90,"ring":90,"pinky":90}', true),
  ('Point', 'Index finger pointing gesture', '{"shoulder":0,"elbow":0,"wrist":0,"thumb":45,"index":0,"middle":90,"ring":90,"pinky":90}', true),
  ('Peace Sign', 'Victory or peace gesture', '{"shoulder":0,"elbow":0,"wrist":0,"thumb":45,"index":0,"middle":0,"ring":90,"pinky":90}', true),
  ('Thumbs Up', 'Approval gesture', '{"shoulder":0,"elbow":0,"wrist":-20,"thumb":0,"index":90,"middle":90,"ring":90,"pinky":90}', true),
  ('OK Sign', 'OK hand gesture', '{"shoulder":0,"elbow":0,"wrist":0,"thumb":45,"index":45,"middle":0,"ring":0,"pinky":0}', true),
  ('Wave Ready', 'Arm raised for waving', '{"shoulder":45,"elbow":-45,"wrist":0,"thumb":0,"index":0,"middle":0,"ring":0,"pinky":0}', true),
  ('Pinch', 'Precision pinch with thumb and index', '{"shoulder":0,"elbow":0,"wrist":0,"thumb":60,"index":60,"middle":0,"ring":0,"pinky":0}', true);

-- Insert default calibration profile
INSERT INTO calibration_profiles (name, joint_limits, is_active) VALUES
  ('Default Profile', '{"shoulder":{"min":-90,"max":90},"elbow":{"min":-90,"max":90},"wrist":{"min":-90,"max":90},"thumb":{"min":0,"max":90},"index":{"min":0,"max":90},"middle":{"min":0,"max":90},"ring":{"min":0,"max":90},"pinky":{"min":0,"max":90}}', true);