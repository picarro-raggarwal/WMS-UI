import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, Text } from "@react-three/drei";
import { useState, useRef } from "react";
import * as THREE from "three";

function RoundedBox({
  width = 1,
  height = 1,
  depth = 1,
  radius = 0.1,
  position = [0, 0, 0] as [number, number, number],
}) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const w = width;
  const h = height;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + w - radius, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + radius);
  shape.lineTo(x + w, y + h - radius);
  shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  shape.lineTo(x + radius, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: radius * 0.3,
    bevelThickness: radius * 0.3,
  };

  return (
    <mesh position={position}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color="#666666"
        opacity={0.2}
        transparent={true}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

function Cabinet() {
  const [hovered, setHovered] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002; // Adjust speed as needed
    }
  });

  // Define component positions with explicit tuple types
  const components: Record<string, [number, number, number]> = {
    anemometer: [0, 4, 0],
    hvac: [-0.8, 0.5, 0.6],
    analyzer: [0, 0, 0],
    sampleHandler: [0, 1.5, 0],
    cpu: [0, -1, 0],
  };

  const labels: Record<string, [number, number, number]> = {
    anemometer: [1.5, 4, 0],
    hvac: [-2, 0.5, 0],
    analyzer: [1.5, 0, 0],
    sampleHandler: [1.5, 1.5, 0],
    cpu: [1.5, -1, 0],
  };

  return (
    <group ref={groupRef}>
      {/* Main Cabinet Body - Using rounded corners */}
      <group position={[0, 0.5, 0]}>
        <RoundedBox width={1.5} height={3} depth={1} radius={0.1} />

        {/* Ventilation Grills */}
        <mesh position={[-0.76, 0.5, 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial
            color="#444444"
            wireframe={true}
            wireframeLinewidth={2}
            opacity={0.5}
          />
        </mesh>

        {/* Cabinet Door Edges */}
        <mesh position={[0.76, 0, 0]}>
          <boxGeometry args={[0.02, 2.8, 0.9]} />
          <meshStandardMaterial color="#555555" opacity={0.5} />
        </mesh>

        {/* Door Handle */}
        <mesh position={[0.77, 0, 0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.2]} />
          <meshStandardMaterial color="#333333" opacity={0.5} />
        </mesh>
      </group>

      {/* Anemometer Assembly */}
      <group position={[0, 4, 0]}>
        {/* Main Sensor Housing */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.3]} />
          <meshStandardMaterial color="#444444" />
        </mesh>

        {/* Sensor Cups */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0.2, 0, 0]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          </group>
        ))}

        {/* Support Pole */}
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>

      {/* Internal Components with More Detail */}
      {/* Analyzer Unit (Picarro) */}
      <group position={[0, 0, 0]}>
        <RoundedBox width={1.2} height={0.4} depth={0.8} radius={0.05} position={[0, 0, 0]} />
        <Text
          position={[0, 0, 0.41]}
          fontSize={0.1}
          color="#44ff44"
          anchorX="center"
          anchorY="middle">
          PICARRO
        </Text>
      </group>

      {/* Sample Handler */}
      <group position={[0, 1.5, 0]}>
        <RoundedBox width={1.2} height={0.3} depth={0.8} radius={0.05} position={[0, 0, 0]} />
        <mesh position={[0.4, 0, 0.41]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshStandardMaterial color="#222222" wireframe={true} wireframeLinewidth={2} />
        </mesh>
      </group>

      {/* CPU/HMI Unit */}
      <group position={[0, -1, 0]}>
        <RoundedBox width={1.2} height={0.4} depth={0.8} radius={0.05} position={[0, 0, 0]} />
        <mesh position={[0.5, 0, 0.41]}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>
      </group>

      {/* HVAC Unit */}
      <group position={components.hvac}>
        <RoundedBox width={0.4} height={0.8} depth={0.4} radius={0.05} />
        <mesh position={[0, 0, 0.21]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.3, 0.6]} />
          <meshStandardMaterial color="#333333" wireframe={true} wireframeLinewidth={2} />
        </mesh>
      </group>

      {/* Component Labels and Lines */}
      {Object.entries(components).map(([name, position]) => {
        const labelPos = labels[name as keyof typeof labels];
        return (
          <group key={name}>
            <Line
              points={[position, labelPos]}
              color={hovered === name ? "#ff0000" : "#666666"}
              lineWidth={1}
            />
            <Html position={labelPos as [number, number, number]}>
              <div
                className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-sm whitespace-nowrap"
                style={{
                  transform: "translate3d(10px, -10px, 0)",
                }}
                onPointerEnter={() => setHovered(name)}
                onPointerLeave={() => setHovered(null)}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function Scene() {
  return (
    <div className="w-full h-[50vh]">
      <Canvas camera={{ position: [5, 2, 5], fov: 50 }} shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />
        <Cabinet />
        <OrbitControls
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          enableZoom={true}
          enablePan={true}
        />
      </Canvas>
    </div>
  );
}
