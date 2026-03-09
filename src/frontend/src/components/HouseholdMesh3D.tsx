import React from "react";
import * as THREE from "three";
import type { SquarePoint } from "./types";

interface HouseholdMesh3DProps {
  square: SquarePoint;
  isSelected: boolean;
  onClick: (square: SquarePoint) => void;
  position3D: [number, number, number];
  isNight?: boolean;
}

const HouseholdMesh3D: React.FC<HouseholdMesh3DProps> = ({
  square,
  isSelected,
  onClick,
  position3D,
  isNight = false,
}) => {
  const accentColor = isSelected ? "#6abf4b" : isNight ? "#90b9ff" : "#008c6e";

  return (
    <group position={position3D} onClick={(e) => { e.stopPropagation(); onClick(square); }}>
      <mesh position={[0, 3, 0]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[0.85, 0.14, 0.85]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
        />
      </mesh>

      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.145, 0]}>
          <ringGeometry args={[0.36, 0.9, 4]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.6}
            transparent
            opacity={0.72}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default React.memo(HouseholdMesh3D);
