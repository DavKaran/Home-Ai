Home-AI

HomeAI is an advanced AI-powered smart home troubleshooting platform that helps users diagnose and fix issues in connected devices using intelligent analysis, simulated telemetry, and visual evidence.

📖 About

HomeAI is designed to simplify smart home troubleshooting by combining AI diagnostics, real-time simulation, and visual analysis into a single modern interface.

The system leverages Google Gemini (gemini-2.5-flash) to analyze:

User-reported symptoms
Device telemetry (simulated)
Uploaded media (images/video/audio)

It produces accurate diagnoses, confidence scores, and step-by-step solutions, making troubleshooting faster and more reliable.

📂 Project Structure
home-ai/
│
├── src/
│   ├── App.jsx                  # Core dashboard + AI logic + telemetry simulation
│   ├── Chatbot.jsx              # "Roger" AI assistant (knowledge-based chatbot)
│   │
│   ├── pages/
│   │   ├── HomePage.jsx        # Landing page UI
│   │   └── FeaturesPage.jsx    # Features explanation page
│   │
│   ├── components/
│   │   └── Navbar.jsx          # Navigation bar
│
├── public/                     # Static assets (if any)
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite configuration
└── README.md                  # Documentation


⚙️ Tech Stack
1. Frontend
2. React 19	UI & component-based architecture
3. Vite	Fast dev server & bundling
4. Tailwind CSS	Styling & responsive design
5. React Router v7	Page navigation
6. Lucide React	Icons
7. AI & Media
8. Technology	Purpose
9. Google Gemini API	AI diagnostics engine
10. MediaRecorder API	Record audio/video
11. getUserMedia API	Camera access
12. Canvas API	Image processing


🚀 Prerequisites

1. Node.js (v18+)
2. npm (v9+)
3. Git

Check versions:

node --version
npm --version
git --version
⚡ Quick Start

# 1. Clone repository
git clone <repository-url>

# 2. Navigate to project
cd home-ai

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev

Open:
http://localhost:5173 

🧠 How It Works

Step-by-step Flow
1. Select device (type + brand + model)
2. Choose observed symptoms
3. Upload media (optional)
4. Start AI diagnosis
5. Receive report with:
- Priority level
- Confidence score

Step-by-step fixes
🔍 Core Features

1. AI Diagnostics Engine
Powered by Gemini API
Multi-input analysis
Generates structured reports

2. Visual Evidence Analysis
Detects LED status, errors, signals
Prioritizes real visual data over user input

3. Simulated Telemetry
Mimics real IoT device behavior
Adjusts device status dynamically

4. "Roger" Chatbot
Context-aware assistant
Uses predefined smart home knowledge base
Instant troubleshooting responses

5. Diagnosis History
Stores past sessions
Easy review of previous issues

6. UI/UX Design
Glassmorphism interface
Smooth animations
Responsive layout


📱 Supported Devices

1.  Smart Bulbs:
Philips Hue, LIFX, TP-Link Kasa, Wyze, Sengled

2. Security Cameras:

3. Smart Speakers:
Amazon Echo, Sonos, Apple HomePod, Bose

4. Thermostats:
Google Nest, Ecobee, Honeywell Home, Emerson

5. Smart Plugs:
TP-Link Kasa, Wemo, Wyze, Amazon Basics, Gosund


🔐 Environment Variables

Create a .env file:
VITE_GEMINI_API_KEY=your_api_key_here


📜 Scripts
Command	Description
npm run dev	Start development server
npm run build	Build for production
npm run preview	Preview production build
🚀 Deployment


🔥 Key Highlights
AI + visual troubleshooting combined
Works even with incomplete user input
Realistic IoT simulation
Clean and premium UI

📚 What This Project Demonstrates
React-based architecture
AI integration (Gemini API)
Media handling in browser
Component-based UI design
Real-world problem solving