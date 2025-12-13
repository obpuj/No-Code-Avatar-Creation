# Pages Explanation

## Persona Builder (`/persona_builder`)
**Purpose**: Testing and configuration tool for the backend API

- **What it does**: 
  - Allows you to test the backend API directly without needing a 3D avatar
  - Configure persona prompts and knowledge context
  - See raw API responses (text, audio, behavior signals)
  - Perfect for debugging and testing the AI integration

- **When to use**:
  - Testing backend functionality
  - Debugging API responses
  - Configuring personas and knowledge bases
  - Quick testing without 3D rendering overhead

- **Features**:
  - Text input for prompts
  - Persona prompt configuration
  - Knowledge context input
  - Audio playback
  - Behavior signals display

## Avatar Page (`/avatar_page`)
**Purpose**: Full interactive experience with 3D avatar

- **What it does**:
  - Displays a 3D avatar (from Ready Player Me)
  - Interactive chat interface
  - Real-time avatar animations based on behavior signals
  - Lip sync with audio
  - Full integration with backend

- **When to use**:
  - Demo/presentation
  - User-facing experience
  - Testing complete integration
  - Seeing the full avatar experience

- **Features**:
  - 3D avatar rendering
  - Chat interface
  - Avatar animations (idle, talking, wave)
  - Lip sync
  - Settings for persona and knowledge context
  - Audio playback with visual feedback

## Summary

- **Persona Builder** = Backend testing tool (no 3D, faster, easier debugging)
- **Avatar Page** = Full experience (3D avatar, animations, complete integration)

Both pages connect to the same backend API, but Avatar Page adds the 3D visualization layer.

