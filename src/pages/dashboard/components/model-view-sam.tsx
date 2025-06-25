import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import type * as THREE from "three";

function Model({ isRotating }: { isRotating: boolean }) {
  const gltf = useGLTF("/Dkrasniy_p01.glb");
  const modelRef = useRef<THREE.Group>();

  useFrame((state) => {
    if (modelRef.current && isRotating) {
      modelRef.current.rotation.y += 0.005;
    } else if (modelRef.current && !isRotating) {
      // Smoothly rotate to front view (0 degrees)
      modelRef.current.rotation.y += (0 - modelRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <primitive
      object={gltf.scene}
      ref={modelRef}
      scale={[0.5, 0.5, 0.5]}
      position={[0, -0.75, 0.95]}
    />
  );
}

export default function ModelViewer({ isRotating }: { isRotating: boolean }) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: isRotating ? [0, -0.25, 3.5] : [0, 1, 2.5],
          fov: isRotating ? 30 : 50,
        }}>
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Model isRotating={isRotating} />
        {/* <OrbitControls /> */}
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
