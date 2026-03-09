import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { LineData } from "./types";

interface ConnectionLine3DProps {
  line: LineData;
  isSelected: boolean;
  onClick: (line: LineData) => void;
  start3D: [number, number, number];
  end3D: [number, number, number];
  ledColor?: string;
  isNight?: boolean;
}

const ConnectionLine3D: React.FC<ConnectionLine3DProps> = ({
  line, isSelected, onClick, start3D, end3D, ledColor, isNight,
}) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const tubeGeometry = useMemo(() => {
    const s = new THREE.Vector3(...start3D);
    const e = new THREE.Vector3(...end3D);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    mid.y = ((s.y + e.y) / 2) + 0.08;
    const curve = new THREE.CatmullRomCurve3([s, mid, e]);
    return new THREE.TubeGeometry(curve, 12, isSelected ? 0.065 : 0.05, 8, false);
  }, [start3D, end3D, isSelected]);

  const defaultColor = isNight ? "#9db4cf" : "#5f7f9a";
  const storedColor = line.color ?? defaultColor;
  const color = isSelected ? (ledColor ?? storedColor) : storedColor;
  const emissiveI = isSelected ? 1.2 : line.color ? (isNight ? 0.9 : 0.7) : (isNight ? 0.75 : 0.55);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    if (isSelected) {
      materialRef.current.emissiveIntensity = 0.75 + Math.sin(clock.getElapsedTime() * 4) * 0.35;
    }
  });

  return (
    <mesh geometry={tubeGeometry} renderOrder={2}
      onClick={(e) => { e.stopPropagation(); onClick(line); }}>
      <meshStandardMaterial
        ref={materialRef}
        color={color} emissive={color} emissiveIntensity={emissiveI}
        roughness={0.25} metalness={0.45}
        depthWrite={true} depthTest={true}
      />
    </mesh>
  );
};

export default React.memo(ConnectionLine3D);
