# Advanced Virtual Bionic Arm

**Author:** [Zypher0903](https://github.com/Zypher0903)  
**GitHub Repository:** [https://github.com/Zypher0903/Advanced-Virtual-Bionic-Arm](https://github.com/Zypher0903/Advanced-Virtual-Bionic-Arm)

This project is a modern web application for controlling and simulating a virtual bionic arm. It provides an intuitive interface for managing gestures, sequences, telemetry, and diagnostics, with a focus on realism, interactivity, and user experience.

---

## Table of Contents

- [Features](#features)  
- [Technologies](#technologies)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Environment Variables](#environment-variables)  
  - [Running the Project](#running-the-project)  
- [Project Structure](#project-structure)  
- [Database Schema](#database-schema)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- **3D Visualization:** Interactive SVG-based representation of the bionic arm with real-time joint angle updates.  
- **Gestures:** Record, save, and play custom gestures or use built-in presets like "Full Grip" or "Peace Sign".  
- **Sequence Builder:** Combine gestures into sequences with customizable timings and loop counts.  
- **Telemetry & Analytics:** Log all movements, calibration events, and errors, with export functionality.  
- **Force Feedback Simulation:** Simulated grip and finger pressure with haptic-style alerts.  
- **Diagnostics:** Real-time system health monitoring and calibration routines.  
- **Responsive UI:** Dark-themed, futuristic interface optimized for desktop and mobile devices.  
- **Supabase Integration:** PostgreSQL database for persistent storage of gestures, sequences, telemetry, and calibration profiles.

---

## Technologies

- **Frontend:** React 18.3.1, TypeScript 5.5.3, Vite 5.4.2  
- **Styling:** Tailwind CSS 3.4.1, PostCSS 8.4.35  
- **Database:** Supabase 2.57.4 (PostgreSQL with real-time capabilities)  
- **Icons:** Lucide React 0.344.0  
- **Linting:** ESLint 9.9.1, TypeScript ESLint 8.3.0  

---

## Getting Started

### Prerequisites

- Node.js v18 or later  
- npm v8 or later  
- Supabase account for database setup  
- Git for cloning the repository  

### Installation

```bash
git clone https://github.com/Zypher0903/Advanced-Virtual-Bionic-Arm.git
cd Advanced-Virtual-Bionic-Arm
npm install
Environment Variables
Create a .env file in the project root and add your Supabase credentials:

text
Copy code
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
Obtain these from your Supabase project dashboard under Settings > API.

Running the Project
Set up the Supabase database:

Create a Supabase project.

Run the migration script in supabase/migrations/20251024005554_create_bionic_arm_tables.sql.

Enable Row-Level Security (RLS) as defined in the migration script.

Start the development server:

bash
Copy code
npm run dev
App will be available at http://localhost:5173.

Build for production:

bash
Copy code
npm run build
Run type checking and linting:

bash
Copy code
npm run typecheck
npm run lint
Project Structure
graphql
Copy code
├── public/                    # Static assets
├── src/
│   ├── components/            # React components (GestureRecorder, GestureLibrary, etc.)
│   ├── lib/
│   │   └── supabase.ts        # Supabase client and TypeScript interfaces
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # React entry point
│   ├── index.css              # Tailwind CSS global styles
│   └── vite-env.d.ts          # Vite environment types
├── supabase/
│   └── migrations/            # Database schema migrations
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript root config
├── tsconfig.app.json          # TypeScript config for src/
├── tsconfig.node.json         # TypeScript config for node files
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── eslint.config.js           # ESLint configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
Database Schema
gestures: Stores gestures with joint angles (JSONB), duration, and preset status.

gesture_sequences: Stores sequences of gestures with timings and loop counts.

telemetry_logs: Logs events like gestures, calibrations, and errors with joint and force data.

calibration_profiles: Stores joint limits and sensitivity settings.

All tables use UUIDs for primary keys and timestamptz for timestamps. RLS is enabled with permissive policies for demo purposes (restrict policies for production).

Usage
Control Tab: Adjust joint angles with sliders or quick action buttons like "Grip" and "Point". Visualize movements in real-time.

Gesture Library: View, load, import, export gestures. Filter by preset or custom gestures.

Sequence Builder: Combine gestures into sequences, play, or delete saved sequences.

Telemetry Panel: Monitor recent events and export telemetry data as JSON.

Diagnostics: Check system health and run calibration routines.

Contributing
Contributions are welcome!

Fork the repository.

Create a feature branch: git checkout -b feature/your-feature.

Commit your changes: git commit -m "Add your feature".

Push to the branch: git push origin feature/your-feature.

Open a pull request.

License
This project is licensed under the [MIT License](./LICENSE).


