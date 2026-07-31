import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Interactive Mouse Glowing Light Sphere
function MouseGlow() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      // Lerp light position smoothly towards mouse pointer
      const targetX = state.pointer.x * 6;
      const targetY = state.pointer.y * 4;

      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.05);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 3]}
      intensity={2.5}
      color="#C56E33"
      distance={9}
    />
  );
}

// Minimal Floating Ambient Dust Motes
function AmbientMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 70;

  const positions = useRef(new Float32Array(count * 3)).current;

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
  }, [count, positions]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.008;
      pointsRef.current.rotation.x = Math.sin(time * 0.01) * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#C56E33"
        sizeAttenuation
        transparent
        opacity={0.16}
        depthWrite={false}
      />
    </points>
  );
}

export default function Background3D({}: { darkMode?: boolean }) {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-white overflow-hidden select-none pointer-events-none">
      
      {/* Crisp Architectural Grid Line Background Pattern (Pure White Base) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#171717 1px, transparent 1px), linear-gradient(to right, #171717 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* WebGL 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} color="#F5F2EB" />
        <MouseGlow />
        <AmbientMotes />
      </Canvas>
    </div>
  );
}
