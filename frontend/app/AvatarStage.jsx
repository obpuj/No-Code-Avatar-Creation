"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function AvatarStage({ avatarUrl, behavior, audioSrc }) {
  const group = useRef();
  
  // --- LAYER 1: THE BODY (Hybrid Loader) ---
  const { scene } = useGLTF(avatarUrl || '/avatar.glb');

  // --- LAYER 2: THE GESTURES (Mixamo Animations) ---
  // Temporarily disable animations to ensure avatar loads
  // TODO: Re-enable once FBX loading issues are resolved
  const idleClips = [];
  const talkClips = [];
  const waveClips = [];
  const actions = {};
  
  // Uncomment below to enable animations (currently causing avatar not to load):
  // const idleResult = useFBX('/animations/idle.fbx');
  // const talkResult = useFBX('/animations/expressions/talking.fbx');
  // const waveResult = useFBX('/animations/expressions/waving.fbx');
  // const idleClips = idleResult?.animations || [];
  // const talkClips = talkResult?.animations || [];
  // const waveClips = waveResult?.animations || talkClips;
  // const animationClips = [idleClips?.[0], talkClips?.[0], waveClips?.[0]].filter(Boolean);
  // const { actions = {} } = useAnimations(animationClips, group);

  // --- LAYER 3: THE VOICE (Audio Analysis Setup) ---
  const [audio, setAudio] = useState(null);
  const analyserRef = useRef(null);
  const [isSmiling, setIsSmiling] = useState(false);

  // Initialize Audio Logic when 'audioSrc' changes
  useEffect(() => {
    if (audioSrc) {
      const newAudio = new Audio(audioSrc);
      
      // Web Audio API Context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Precision of volume check
      
      const source = audioContext.createMediaElementSource(newAudio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyserRef.current = analyser;
      setAudio(newAudio);
      newAudio.play().catch(() => console.log("Interaction needed to play audio"));
    }
  }, [audioSrc]);

  // --- RENDER LOOP (60 Frames Per Second) ---
  useFrame(() => {
    // 1. LIP SYNC LOGIC
    if (analyserRef.current && audio && !audio.paused) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate Volume (Average of frequencies)
      const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Map Volume (0-255) to Mouth Open (0.0 - 1.0)
      // We divide by 50 to make it sensitive (0.0 to 1.0 range)
      const normalizeVolume = Math.min(1, volume / 50);

      // Find the mouth mesh and morph it
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetDictionary) {
          // Ready Player Me uses 'viseme_aa' for the jaw/mouth opening
          const mouthIdx = child.morphTargetDictionary['viseme_aa'] || child.morphTargetDictionary['jawOpen'];
          
          if (mouthIdx !== undefined) {
             // Smoothly Lerp current value to new volume value (Less jittery)
             child.morphTargetInfluences[mouthIdx] = THREE.MathUtils.lerp(
               child.morphTargetInfluences[mouthIdx],
               normalizeVolume,
               0.5 
             );
          }
        }
      });
    }

    // 2. EMOTION LOGIC (The Smile)
    // If 'isSmiling' is true, morph the face into a smile slowly
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetDictionary) {
        const smileIdx = child.morphTargetDictionary['mouthSmile'] || child.morphTargetDictionary['viseme_SS'];
        if (smileIdx !== undefined) {
           const targetValue = isSmiling ? 0.6 : 0.0; // 60% smile
           child.morphTargetInfluences[smileIdx] = THREE.MathUtils.lerp(
             child.morphTargetInfluences[smileIdx],
             targetValue,
             0.1 // Slow smooth transition
           );
        }
      }
    });

    // 3. FRUSTUM CULLING FIX (Keep avatar visible)
    scene.traverse((child) => {
      if (child.isMesh) child.frustumCulled = false;
    });

  });

  // --- BEHAVIOR CONTROLLER (Signal Receiver) ---
  // Animations are currently disabled - avatar will work without gesture animations
  // Update smile state based on behavior even without animations
  useEffect(() => {
    if (behavior === 'wave' || behavior === 'talk') {
      setIsSmiling(true);
    } else {
      setIsSmiling(false);
    }
  }, [behavior]);

  return (
    <group ref={group} dispose={null} position={[0, -1, 0]}>
      <primitive object={scene} scale={1.0} />
    </group>
  );
}