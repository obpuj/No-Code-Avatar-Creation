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
  const [isTransitioningToSymmetrical, setIsTransitioningToSymmetrical] = useState(false);
  const WAVE_DURATION = 3.0; // Wave for 3 seconds, then transition to symmetrical

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

  // Track when wave starts and auto-transition to symmetrical position
  useEffect(() => {
    if (behavior === 'wave') {
      setCurrentBehavior('wave');
      setIsTransitioningToSymmetrical(false);
      waveStartTime.current = animationTime.current;
    } else if (behavior === 'nod') {
      setCurrentBehavior('nod');
      setIsTransitioningToSymmetrical(false);
    } else if (behavior !== 'wave' && currentBehavior === 'wave') {
      // If behavior changes from wave to something else, allow reset
      setCurrentBehavior(behavior);
      setIsTransitioningToSymmetrical(false);
      waveStartTime.current = null;
    } else {
      setCurrentBehavior(behavior);
      setIsTransitioningToSymmetrical(false);
      waveStartTime.current = null;
    }
  }, [behavior]);

  // Procedural animation loop
  useFrame((state, delta) => {
    animationTime.current += delta;

    // Auto-transition from wave to symmetrical position after 3 seconds
    if (currentBehavior === 'wave' && waveStartTime.current !== null) {
      const waveElapsed = animationTime.current - waveStartTime.current;
      if (waveElapsed >= WAVE_DURATION && !isTransitioningToSymmetrical) {
        setIsTransitioningToSymmetrical(true);
      }
    }

    if (currentBehavior === 'wave') {
      // Natural human wave: Two separate bones
      // BONE 1: Upper Arm (shoulder to elbow) - rightArm (PERFECT - KEEP AS IS)
      // BONE 2: Forearm (elbow to hand) - rightForeArm
      
      if (bones.rightArm) {
        // UPPER ARM (shoulder to elbow) - PERFECT, KEEP AS IS
        bones.rightArm.rotation.y = 0.7; // Arm extends out to the side (away from body)
        bones.rightArm.rotation.x = -0.25; // Elbow positioned at hip level
        const upperArmWave = Math.sin(animationTime.current * 2.5) * 0.1; // Subtle movement
        bones.rightArm.rotation.z = upperArmWave;
      }
      
      if (bones.rightForeArm) {
        // FOREARM (elbow to hand):
        // Target position: -x and -y quadrant (symmetrical to idle left arm)
        const targetX = -0.4; // Negative x (left side, mirror of left arm)
        const targetY = -0.3; // Negative y (backward/downward, mirror of left arm)
        const targetZ = 0; // No Z rotation
        
        if (isTransitioningToSymmetrical) {
          // After 3 seconds: smoothly transition to -x and -y quadrant (symmetrical position)
          // Only stop when perfectly symmetrical
          const currentX = bones.rightForeArm.rotation.x;
          const currentY = bones.rightForeArm.rotation.y;
          const currentZ = bones.rightForeArm.rotation.z;
          
          // Check if we're close enough to target (symmetrical position)
          const threshold = 0.05; // 0.05 radians tolerance
          const isSymmetrical = Math.abs(currentX - targetX) < threshold && 
                                Math.abs(currentY - targetY) < threshold && 
                                Math.abs(currentZ - targetZ) < threshold;
          
          if (!isSymmetrical) {
            // Smoothly lerp to target position until symmetrical
            bones.rightForeArm.rotation.x = THREE.MathUtils.lerp(currentX, targetX, 0.15);
            bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(currentY, targetY, 0.15);
            bones.rightForeArm.rotation.z = THREE.MathUtils.lerp(currentZ, targetZ, 0.15);
          } else {
            // Perfectly symmetrical - hold position and allow transition to idle
            bones.rightForeArm.rotation.x = targetX;
            bones.rightForeArm.rotation.y = targetY;
            bones.rightForeArm.rotation.z = targetZ;
            // Once symmetrical, we can transition to idle behavior
            if (currentBehavior === 'wave') {
              setCurrentBehavior('idle');
            }
          }
        } else {
          // During wave (0 to 3 seconds): wave from negative x + positive y to positive x + positive y
          // Keep movement in positive y quadrant (don't enter -y quadrants)
          const waveAngle = Math.sin(animationTime.current * 2.5) * Math.PI / 3; // Reduced: -π/3 to +π/3 (60° range)
          
          // X rotation: negative x to positive x (left to right movement) - REDUCED movement
          bones.rightForeArm.rotation.x = waveAngle; // Goes from -π/3 to +π/3
          
          // Y rotation: keep in positive y quadrant (forward/upward) - NEVER negative during wave
          bones.rightForeArm.rotation.y = 0.3 + Math.abs(waveAngle) * 0.2; // Stays positive (0.3 to 0.5)
          
          // Z rotation: fixed at 0 (straight up)
          bones.rightForeArm.rotation.z = 0;
        }
      }
    } else if (currentBehavior === 'nod') {
      // Nod animation: Rotate head up and down
      if (bones.head) {
        const nodRotation = Math.sin(animationTime.current * 1.5) * 0.4; // 1.5 Hz, ±0.4 radians
        bones.head.rotation.x = nodRotation;
      }
    } else if (currentBehavior === 'idle' && isTransitioningToSymmetrical) {
      // After reaching symmetrical position, hold it (don't reset to 0)
      // Keep the -x and -y position (symmetrical to left arm)
      if (bones.rightArm) {
        // Upper arm can return to neutral
        bones.rightArm.rotation.x = THREE.MathUtils.lerp(bones.rightArm.rotation.x, 0, 0.15);
        bones.rightArm.rotation.y = THREE.MathUtils.lerp(bones.rightArm.rotation.y, 0, 0.15);
        bones.rightArm.rotation.z = THREE.MathUtils.lerp(bones.rightArm.rotation.z, 0, 0.15);
      }
      if (bones.rightForeArm) {
        // Forearm stays in -x and -y quadrant (symmetrical position)
        const targetX = -0.4;
        const targetY = -0.3;
        const targetZ = 0;
        bones.rightForeArm.rotation.x = THREE.MathUtils.lerp(bones.rightForeArm.rotation.x, targetX, 0.1);
        bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(bones.rightForeArm.rotation.y, targetY, 0.1);
        bones.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.rightForeArm.rotation.z, targetZ, 0.1);
      }
      if (bones.head) {
        bones.head.rotation.x = THREE.MathUtils.lerp(bones.head.rotation.x, 0, 0.1);
      }
    } else {
      // Reset to default pose when no behavior - smoothly return hand down
      if (bones.rightArm) {
        bones.rightArm.rotation.x = THREE.MathUtils.lerp(bones.rightArm.rotation.x, 0, 0.15);
        bones.rightArm.rotation.y = THREE.MathUtils.lerp(bones.rightArm.rotation.y, 0, 0.15);
        bones.rightArm.rotation.z = THREE.MathUtils.lerp(bones.rightArm.rotation.z, 0, 0.15);
      }
      if (bones.rightForeArm) {
        bones.rightForeArm.rotation.x = THREE.MathUtils.lerp(bones.rightForeArm.rotation.x, 0, 0.15);
        bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(bones.rightForeArm.rotation.y, 0, 0.15);
        bones.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.rightForeArm.rotation.z, 0, 0.15);
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

