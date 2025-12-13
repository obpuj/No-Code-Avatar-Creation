"use client";
import React, { useEffect, useState } from 'react';
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Separate component for animations - can fail without breaking avatar
export function AvatarAnimations({ group, behavior, onSmileChange }) {
  const [idleClips, setIdleClips] = useState([]);
  const [talkClips, setTalkClips] = useState([]);
  const [waveClips, setWaveClips] = useState([]);
  const [animationsLoaded, setAnimationsLoaded] = useState(false);
  
  // Load animations asynchronously to avoid blocking avatar render
  useEffect(() => {
    const loader = new FBXLoader();
    let mounted = true;
    
    const loadAnimations = async () => {
      try {
        // Load animations in parallel
        const [idleData, talkData, waveData] = await Promise.allSettled([
          loader.loadAsync('/animations/idle.fbx').catch(e => {
            console.warn('Idle animation failed to load:', e);
            return null;
          }),
          loader.loadAsync('/animations/expressions/talking.fbx').catch(e => {
            console.warn('Talking animation failed to load:', e);
            return null;
          }),
          loader.loadAsync('/animations/expressions/waving.fbx').catch(e => {
            console.warn('Waving animation failed to load:', e);
            return null;
          })
        ]);
        
        if (!mounted) return;
        
        const idle = idleData.status === 'fulfilled' ? idleData.value : null;
        const talk = talkData.status === 'fulfilled' ? talkData.value : null;
        const wave = waveData.status === 'fulfilled' ? waveData.value : null;
        
        setIdleClips(idle?.animations || []);
        setTalkClips(talk?.animations || []);
        setWaveClips(wave?.animations || talk?.animations || []);
        setAnimationsLoaded(true);
      } catch (e) {
        console.warn('Animation loading error (non-critical):', e);
        setAnimationsLoaded(true); // Mark as loaded even if failed
      }
    };
    
    loadAnimations();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  // Only create actions if we have valid clips
  // Always call useAnimations (hooks must be called unconditionally)
  // Pass empty array if no clips - drei handles this gracefully
  const animationClips = [idleClips?.[0], talkClips?.[0], waveClips?.[0]].filter(Boolean);
  const { actions = {} } = useAnimations(animationClips, group);
  
  // Handle behavior changes
  useEffect(() => {
    if (!animationsLoaded) return; // Wait for animations to load
    
    if (!actions || Object.keys(actions).length === 0) {
      // Still update smile state even without animations
      if (behavior === 'wave' || behavior === 'talk') {
        onSmileChange?.(true);
      } else {
        onSmileChange?.(false);
      }
      return;
    }
    
    try {
      // Fade out incompatible actions
      Object.values(actions).forEach(action => {
        if (action && action.isRunning() && talkClips?.[0] && action !== actions[talkClips[0].name]) {
          action.fadeOut(0.3);
        }
      });

      // IDLE
      if (behavior === 'idle' && idleClips && idleClips[0] && actions[idleClips[0].name]) {
        actions[idleClips[0].name].reset().fadeIn(0.5).play();
        onSmileChange?.(false);
      }

      // TALK
      if (behavior === 'talk' && talkClips && talkClips[0] && actions[talkClips[0].name]) {
        actions[talkClips[0].name].reset().fadeIn(0.5).setLoop(THREE.LoopRepeat).play();
        onSmileChange?.(true);
      }

      // WAVE
      if (behavior === 'wave' && waveClips && waveClips[0] && actions[waveClips[0].name]) {
        const wave = actions[waveClips[0].name];
        if (wave) {
          wave.reset().fadeIn(0.5).setLoop(THREE.LoopOnce, 1).play();
          wave.clampWhenFinished = true;
        }
        onSmileChange?.(true);
      }
    } catch (e) {
      console.warn('Animation playback error (non-critical):', e);
      // Still update smile state
      if (behavior === 'wave' || behavior === 'talk') {
        onSmileChange?.(true);
      } else {
        onSmileChange?.(false);
      }
    }
  }, [behavior, actions, idleClips, talkClips, waveClips, animationsLoaded, onSmileChange]);
  
  return null; // This component doesn't render anything, just manages animations
}
