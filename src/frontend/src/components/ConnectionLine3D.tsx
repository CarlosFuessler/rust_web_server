// Diese Datei ist für die Leitung (Netze) zwischen den Hexegons

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { LineData } from "./types";

interface ConnectionLine3DProps {
  line: LineData;
  isSelected: boolean; // Überprüft, ob ein Netz ausgewählt ist oder nicht 
  onClick: (line: LineData) => void; // ist das eine Funktion ?
  start3D: [number, number, number];
  end3D: [number, number, number];
  ledColor?: string; // Speichert die Farbe von dem Netzteil
  isNight?: boolean; // Überprüft, ob man dunkelmodus hat oder nicht 
}

const ConnectionLine3D: React.FC<ConnectionLine3DProps> = ({
  line, isSelected, onClick, start3D, end3D, ledColor, isNight,
}) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null); // Was ist das ?

  const tubeGeometry = useMemo(() => {
    const s = new THREE.Vector3(...start3D); // Ist das eine Position ?
    const e = new THREE.Vector3(...end3D);
    const mid = s.clone().add(e).multiplyScalar(0.5); // Hier berechnet man den Mittelpunkt => Ziel: geborgene Form 
    mid.y = ((s.y + e.y) / 2) + 0.1; // man verschiebt den Mittelpunkt nach oben 
    const curve = new THREE.CatmullRomCurve3([s, mid, e]); // Hier erstellt man eine Kurve
    return new THREE.TubeGeometry(curve, 12, isSelected ? 0.065 : 0.05, 10, false); // Hier erstellt man die Verbindung 
  }, [start3D, end3D, isSelected]);

  const defaultColor = isNight ? "#2c77cd" : "hsl(149, 61%, 70%)";
  const storedColor = line.color ?? defaultColor; // benutzt dafaultColor, wenn line.color undefiniert ist 
  const color = isSelected ? (ledColor ?? storedColor) : storedColor;
  const emissiveI = isSelected ? 1.2 : line.color ? (isNight ? 0.9 : 0.7) : (isNight ? 0.75 : 0.55);

  useFrame(({ clock }) => {
    if (!materialRef.current) return; // Hier überprüft man ob materialRef gleich null ist 
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
