# UX Monitor App

(WIP) A live UX performance monitor that captures and visualizes animation metrics from real user sessions. 

Provides devs with a lightweight performance HUD that tracks and visualizes real-time rendering metrics in the browser. It calculates FPS, dropped frames, and an overall UX health score (0–100) based on animation smoothness. A mini bar graph highlights recent performance blips to help identify jank and frame drops. Ideal for debugging animation-heavy UIs.


## Install and use in your next project!
@https://www.npmjs.com/package/ux-dev-monitor-tool

```bash 
npm install ux-dev-monitor-tool

import UXMonitorOverlay from 'ux-dev-monitor-tool' ----> in component/page of choice as <UXMonitorOverlay /> 
```

---

## Key Metrics & Formulas:

FPS (frames per second):
FPS = frameCount / (totalTime / 1000)

Dropped Frames:
Dropped = expectedFrames - 1
(Assumes 60fps target; 1 frame always rendered)

UX Score:
Score = 100 − (60 − avgFPS) × 3 − droppedFrames × 5
**(Stricter penalties for jank & stutter)**

📊 Includes a real-time blip bar to visualize dropped frames over the last ~3 seconds

## 🗂 Project Structure

ux-monitor-app/
├── frontend/ # Vite + React app


## 🚀 Getting Started

### Install dependencies

```bash
cd frontend && npm install

# Run development servers #
# Frontend
cd frontend
npm run dev



🛠 Tech Stack
React + Vite (Frontend)

