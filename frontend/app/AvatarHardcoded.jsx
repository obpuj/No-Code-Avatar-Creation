"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function AvatarHardcoded({ avatarUrl, behavior }) {
  const group = useRef();
  const [bones, setBones] = useState({
    rightArm: null,
    rightForeArm: null,
    head: null
  });
  const animationTime = useRef(0);
  const waveStartTime = useRef(null);
  const [currentBehavior, setCurrentBehavior] = useState(behavior);
  const [isTransitioningToIdle, setIsTransitioningToIdle] = useState(false);
  const WAVE_DURATION = 2.0; // Wave for 2 seconds, then return to idle

  // Load avatar model
  const { scene } = useGLTF(avatarUrl || '/avatar.glb');

  // Find bones in the skeleton
  useEffect(() => {
    if (!scene) return;

    const findBonesRecursive = (object) => {
      if (object.isBone) {
        const name = object.name.toLowerCase();
        
        // Ready Player Me and Mixamo bone naming conventions
        // Right Arm (Upper Arm)
        if ((name.includes('rightarm') && !name.includes('forearm') && !name.includes('lower')) ||
            name.includes('right_upperarm') ||
            name === 'mixamorigrightarm' ||
            name === 'rightarm' ||
            name === 'upperarm_r') {
          setBones(prev => ({ ...prev, rightArm: object }));
        }
        
        // Right Forearm (Lower Arm)
        if (name.includes('rightforearm') ||
            name.includes('right_lowerarm') ||
            name.includes('rightfore') ||
            name === 'mixamorigrightforearm' ||
            name === 'rightforearm' ||
            name === 'lowerarm_r') {
          setBones(prev => ({ ...prev, rightForeArm: object }));
        }
        
        // Head
        if ((name.includes('head') && !name.includes('shoulder') && !name.includes('neck')) ||
            name === 'mixamorighead' ||
            name === 'head') {
          setBones(prev => ({ ...prev, head: object }));
        }
      }
      
      // Recursively search children
      object.children.forEach(child => findBonesRecursive(child));
    };

    // Search through the entire scene
    scene.traverse((object) => {
      findBonesRecursive(object);
    });

    // Also check if there's a skeleton in skinned meshes
    scene.traverse((object) => {
      if (object.isSkinnedMesh && object.skeleton) {
        object.skeleton.bones.forEach((bone) => {
          findBonesRecursive(bone);
        });
      }
    });
  }, [scene]);

  // Track when wave starts and auto-transition to idle
  useEffect(() => {
    if (behavior === 'wave') {
      setCurrentBehavior('wave');
      setIsTransitioningToIdle(false);
      waveStartTime.current = animationTime.current;
    } else if (behavior === 'nod') {
      setCurrentBehavior('nod');
      setIsTransitioningToIdle(false);
    } else if (behavior !== 'wave' && currentBehavior === 'wave') {
      // If behavior changes from wave to something else, allow reset
      setCurrentBehavior(behavior);
      setIsTransitioningToIdle(false);
      waveStartTime.current = null;
    } else {
      setCurrentBehavior(behavior);
      setIsTransitioningToIdle(false);
      waveStartTime.current = null;
    }
  }, [behavior]);

  // Procedural animation loop
  useFrame((state, delta) => {
    animationTime.current += delta;

    // Auto-transition from wave to idle after 2 seconds
    if (currentBehavior === 'wave' && waveStartTime.current !== null) {
      const waveElapsed = animationTime.current - waveStartTime.current;
      if (waveElapsed >= WAVE_DURATION && !isTransitioningToIdle) {
        setIsTransitioningToIdle(true);
        setCurrentBehavior('idle');
      }
    }

    if (currentBehavior === 'wave' && !isTransitioningToIdle) {
      // Waving animation: Hand facing upward, palm moving side to side
      
      if (bones.rightArm) {
        // UPPER ARM: Raise arm up to shoulder height
        bones.rightArm.rotation.x = -1.2; // Lift arm up
        bones.rightArm.rotation.y = 0.3; // Slight outward angle
        bones.rightArm.rotation.z = 0.2; // Slight tilt
      }
      
      if (bones.rightForeArm) {
        // FOREARM: Hand pointing upward, palm waving side to side
        // Z rotation makes the hand face upward (palm forward)
        bones.rightForeArm.rotation.z = -1.5; // Hand pointing up (90 degrees)
        
        // X rotation creates the side-to-side waving motion
        const waveMotion = Math.sin(animationTime.current * 4) * 0.6; // Fast wave
        bones.rightForeArm.rotation.x = waveMotion; // Side to side motion
        
        bones.rightForeArm.rotation.y = 0; // No Y rotation needed
      }
      
      // Keep head steady during wave
      if (bones.head) {
        bones.head.rotation.x = 0;
      }
    } else if (currentBehavior === 'nod') {
      // Nod animation: Rotate head up and down
      if (bones.head) {
        const nodRotation = Math.sin(animationTime.current * 1.5) * 0.4;
        bones.head.rotation.x = nodRotation;
      }
      
      // Reset arms to idle during nod
      if (bones.rightArm) {
        bones.rightArm.rotation.x = THREE.MathUtils.lerp(bones.rightArm.rotation.x, 0, 0.1);
        bones.rightArm.rotation.y = THREE.MathUtils.lerp(bones.rightArm.rotation.y, 0, 0.1);
        bones.rightArm.rotation.z = THREE.MathUtils.lerp(bones.rightArm.rotation.z, 0, 0.1);
      }
      if (bones.rightForeArm) {
        bones.rightForeArm.rotation.x = THREE.MathUtils.lerp(bones.rightForeArm.rotation.x, 0, 0.1);
        bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(bones.rightForeArm.rotation.y, 0, 0.1);
        bones.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.rightForeArm.rotation.z, 0, 0.1);
      }
    } else {
      // Idle/reset: Return arm to resting position (down by side)
      if (bones.rightArm) {
        bones.rightArm.rotation.x = THREE.MathUtils.lerp(bones.rightArm.rotation.x, 0, 0.1);
        bones.rightArm.rotation.y = THREE.MathUtils.lerp(bones.rightArm.rotation.y, 0, 0.1);
        bones.rightArm.rotation.z = THREE.MathUtils.lerp(bones.rightArm.rotation.z, 0, 0.1);
      }
      if (bones.rightForeArm) {
        bones.rightForeArm.rotation.x = THREE.MathUtils.lerp(bones.rightForeArm.rotation.x, 0, 0.1);
        bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(bones.rightForeArm.rotation.y, 0, 0.1);
        bones.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.rightForeArm.rotation.z, 0, 0.1);
      }
      if (bones.head) {
        bones.head.rotation.x = THREE.MathUtils.lerp(bones.head.rotation.x, 0, 0.1);
      }
    }

    // Keep avatar visible (frustum culling fix)
    scene.traverse((child) => {
      if (child.isMesh) child.frustumCulled = false;
    });
  });

  return (
    <group ref={group} dispose={null} position={[0, -1, 0]}>
      <primitive object={scene} scale={1.0} />
    </group>
  );
}