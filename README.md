Virtual Realistic Bionic Arm Control System
A modern web application for controlling and simulating a virtual bionic arm, built with React, TypeScript, Vite, Tailwind CSS, and Supabase. This project provides an intuitive interface for managing gestures, sequences, telemetry, and diagnostics for a virtual bionic arm, with a focus on extensibility and user experience.
Table of Contents

Features
Technologies
Getting Started

Prerequisites
Installation
Environment Variables
Running the Project


Project Structure
Database Schema
Usage
Contributing
License

Features

3D Visualization: Interactive SVG-based visualization of the bionic arm with real-time joint angle updates.
Gesture Management: Record, save, and play custom gestures with a library of preset gestures (e.g., "Full Grip", "Peace Sign").
Sequence Builder: Create and play sequences of gestures with customizable timing and loop counts.
Telemetry & Analytics: Log and analyze arm movements, calibration events, and errors with export functionality.
Force Sensors: Simulated force feedback for grip and finger pressure with haptic alerts.
Diagnostics: Real-time system health monitoring and calibration routines.
Responsive UI: Dark-themed, futuristic interface powered by Tailwind CSS, optimized for desktop and mobile.
Supabase Integration: Persistent storage for gestures, sequences, telemetry, and calibration profiles using a PostgreSQL database.

Technologies

Frontend: React 18.3.1, TypeScript 5.5.3, Vite 5.4.2
Styling: Tailwind CSS 3.4.1, PostCSS 8.4.35
Database: Supabase 2.57.4 (PostgreSQL with real-time capabilities)
Icons: Lucide React 0.344.0
Linting: ESLint 9.9.1, TypeScript ESLint 8.3.0
Build Tool: Vite for fast development and optimized builds

Getting Started
Prerequisites

Node.js: Version 18 or later
npm: Version 8 or later
Supabase Account: Required for database setup
Git: For cloning the repository

Installation

Clone the repository:
bashgit clone https://github.com/your-username/virtual-bionic-arm.git
cd virtual-bionic-arm

Install dependencies:
bashnpm install


Environment Variables
Create a .env file in the project root and add the following Supabase credentials:
textVITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
Obtain these from your Supabase project dashboard under Settings > API.
Running the Project

Set up the Supabase database:

Create a Supabase project.
Run the migration script (supabase/migrations/20251024005554_create_bionic_arm_tables.sql) to create the necessary tables and insert default data.
Enable Row-Level Security (RLS) as defined in the migration script.


Start the development server:
bashnpm run dev
The app will be available at http://localhost:5173.
Build for production:
bashnpm run build

Run type checking and linting:
bashnpm run typecheck
npm run lint


Project Structure
text├── public/                    # Static assets
├── src/
│   ├── components/            # React components (GestureRecorder, GestureLibrary, etc.)
│   ├── lib/
│   │   └── supabase.ts       # Supabase client and TypeScript interfaces
│   ├── App.tsx               # Main app component with UI and logic
│   ├── main.tsx              # Entry point for React
│   ├── index.css             # Global Tailwind CSS styles
│   └── vite-env.d.ts         # Vite environment type definitions
├── supabase/
│   └── migrations/            # Database schema migrations
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration (root)
├── tsconfig.app.json         # TypeScript configuration for src/
├── tsconfig.node.json        # TypeScript configuration for node files
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
Database Schema
The project uses a Supabase (PostgreSQL) database with the following tables:

gestures: Stores individual gestures with joint angles (joint_data as JSONB), duration, and preset status.
gesture_sequences: Stores sequences of gestures with timings and loop counts.
telemetry_logs: Logs events like gestures, calibrations, or errors with joint and force data.
calibration_profiles: Stores joint limits and sensitivity settings for calibration.

All tables use UUIDs for primary keys and timestamptz for timestamps. Row-Level Security (RLS) is enabled with permissive policies for demo purposes. Note: For production, restrict RLS policies to authenticated users.
Usage

Control Tab:

Adjust joint angles (shoulder, elbow, wrist, fingers) using sliders.
Use quick action buttons (e.g., "Grip", "Point") for predefined gestures.
Visualize arm movements in real-time with the SVG-based 3D model.


Gesture Library:

View, load, import, or export gestures.
Filter by preset or custom gestures.


Sequence Builder:

Create sequences by combining gestures with custom timings and loop counts.
Play or delete saved sequences.


Telemetry Panel:

Monitor recent events (gestures, calibrations, errors).
Export telemetry data as JSON or clear logs.


Diagnostics:

View system health (power, motor load, joint stress).
Run calibration routines to log system state.



Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

Please ensure code follows the ESLint and TypeScript rules defined in the project.
License
This project is licensed under the MIT License. See the LICENSE file for details.
