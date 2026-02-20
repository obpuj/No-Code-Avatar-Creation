# No-Code-Avatar-Creation

## PersonaFlow: 3D Avatar Creation & Persona Builder Platform

A full-stack 3D avatar platform designed to simplify avatar creation, export, rendering, and animation workflows.  
This system integrates **Ready Player Me**, **React Three Fiber**, and a modular backend to enable scalable digital identity management.

---

## Project Overview

The **Avatar Creation Platform** enables users to generate customizable 3D avatars and render them dynamically inside a web-based 3D environment.

### The system supports:

- **Avatar generation via Ready Player Me**
- **GLB export and URL capture**
- **Interactive 3D scene rendering**
- **Animation library integration**
- **Modular frontend-backend architecture**
- **Extensible persona configuration layer**

---

## Extra Features Included

To extend beyond basic avatar embedding, the following enhancements were implemented:

- **Event-Based Export System**  
  Implemented full iframe handshake (`v1.frame.ready`) and export subscription (`v1.avatar.exported`) to reliably capture GLB URLs.

- **Dynamic GLB Rendering**  
  Integrated `@react-three/fiber` for real-time 3D avatar rendering with lighting and camera controls.

- **Animation Library Integration**  
  Connected a reusable GLB animation asset system to support motion presets.

- **Modular Architecture**  
  Structured frontend and backend for future AI persona expansion.

- **Search & Preset UI**  
  Designed a custom modal interface for applying persona traits and presets.

---



## Technical Stack

### Frontend
- Next.js  
- React Three Fiber  
- Ready Player Me  

### Backend
- Node.js services  
- Modular API endpoints  

### 3D & Assets
- GLB models  
- Animation library  
- OrbitControls  

---

## Getting Started

### 1. Clone the Repository

### 2. Start Backend

or manually:
cd Backend
npm install
npm start

### 3. Start Frontend
./start-frontend.sh

or manually:
cd frontend
npm install
npm run dev


---

## Future Scope

- AI-driven persona configuration engine  
- Emotion-based animation switching  
- Cloud avatar storage  
- Multi-user avatar sessions  
- SDK extraction for third-party integration  

---


