import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader, mergeVertices } from "three-stdlib";
import type { HexagonPoint } from "./types";

interface HexagonMesh3DProps {
  point: HexagonPoint;
  radius: number;
  isSelected: boolean;
  onClick: (point: HexagonPoint) => void;
  backgroundImage?: string;
  isNight?: boolean;
  type?: number;
  label: string;
  position3D: [number, number, number];
}

const TYPE_COLORS: Record<number, string> = {
  1: "#f59e0b", // solar   – amber
  2: "#6366f1", // wind    – indigo
  3: "#10b981", // battery – emerald
  4: "#06b6d4", // water   – cyan
  5: "#f97316", // charging– orange
  6: "#8b5cf6", // industry– violet
  7: "#ec4899", // household–pink
};

const TYPE_HEIGHTS: Record<number, number> = {
  1: 0.4,
  2: 0.8,
  3: 0.5,
  4: 0.6,
  5: 0.45,
  6: 1.0,
  7: 0.35,
};

// ── normalise and orient STL geometry ───────────────────────────────────────

function fitGeometry(geo: THREE.BufferGeometry, targetR: number): THREE.BufferGeometry {
  let g = geo.clone();

  // STL files are typically Z-up; Three.js is Y-up → rotate -90° on X
  g.rotateX(-Math.PI / 2);

  // Center on origin
  g.computeBoundingBox();
  const center = new THREE.Vector3();
  g.boundingBox!.getCenter(center);
  g.translate(-center.x, -center.y, -center.z);

  // Scale so XZ radius matches target
  g.computeBoundingBox();
  const size = new THREE.Vector3();
  g.boundingBox!.getSize(size);
  const currentR = Math.max(size.x, size.z) / 2;
  const scale = targetR / currentR;
  g.scale(scale, scale, scale);

  // Merge duplicate vertices for clean normals
  g = mergeVertices(g);
  g.computeVertexNormals();

  // Shift up so the bottom of the mesh sits exactly on y=0
  g.computeBoundingBox();
  const minY = g.boundingBox!.min.y;
  if (minY < 0) g.translate(0, -minY, 0);

  return g;
}

// ── icon sprite floating above the hex ───────────────────────────────────────
const IconSprite: React.FC<{ imageUrl: string; y: number; radius: number }> = ({
  imageUrl,
  y,
  radius,
}) => {
  const texture = useTexture(imageUrl);
  return (
    <sprite position={[0, y + 0.12, 0]} scale={[radius * 1.75, radius * 1.75, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} opacity={0.98} />
    </sprite>
  );
};

// ── shared body (receives already-fitted geometry) ───────────────────────────
const HexBody: React.FC<{
  geo: THREE.BufferGeometry;
  color: string;
  isSelected: boolean;
  height: number;
  type?: number;
  backgroundImage?: string;
  isNight?: boolean;
  point: HexagonPoint;
  onClick: (p: HexagonPoint) => void;
  radius: number;
}> = ({ geo, color, isSelected, height, type, backgroundImage, isNight, point, onClick, radius }) => {
  const accentColor = type ? (TYPE_COLORS[type] ?? "#3b82f6") : "#3b82f6";

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.16,
        metalness: 0.35,
        emissive: isSelected ? accentColor : "#ffffff",
        emissiveIntensity: isSelected ? 0.3 : 0.08,
        side: THREE.DoubleSide,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color, isSelected, accentColor]
  );

  const glowRingGeo = useMemo(
    () => new THREE.RingGeometry(radius * 1.05, radius * 1.25, 6),
    [radius]
  );

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick(point); }}>
      {/* Glow ring on floor when selected */}
      {isSelected && (
        <mesh geometry={glowRingGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <meshStandardMaterial
            color={accentColor} emissive={accentColor} emissiveIntensity={3}
            transparent opacity={0.5} side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* STL mesh – renderOrder 1 ensures it draws on top of lines (order 0) */}
      <mesh geometry={geo} material={mat} castShadow receiveShadow renderOrder={1} />

      {/* Icon floating above (sprite, always faces camera, no UV needed) */}
      {backgroundImage && type && (
        <IconSprite imageUrl={backgroundImage} y={height} radius={radius * 0.9} />
      )}

      {/* Status LED – brighter at night */}
      {type && (
        <mesh position={[0, height + 0.22, 0]}>
          <sphereGeometry args={[0.085, 12, 12]} />
          <meshStandardMaterial
            color={accentColor} emissive={accentColor}
            emissiveIntensity={isSelected ? 6 : isNight ? 5 : 3}
          />
        </mesh>
      )}
    </group>
  );
};

// ── main component ────────────────────────────────────────────────────────────
const HexagonMesh3D: React.FC<HexagonMesh3DProps> = ({
  point, radius, isSelected, onClick, backgroundImage, type, label: _label, position3D, isNight,
}) => {
  const rawGeo = useLoader(STLLoader, "/HexagonBotom.stl");
  const effectiveRadius = radius * 0.82;

  const geo = useMemo(() => fitGeometry(rawGeo, effectiveRadius), [rawGeo, effectiveRadius]);

  const height = type ? (TYPE_HEIGHTS[type] ?? 0.3) : 0.3;
  // Always white/off-white base; type color used only for glow/LED
  const color  = "#e8edf2";

  return (
    <group position={position3D}>
      <HexBody
        geo={geo}
        color={color}
        isSelected={isSelected}
        height={height}
        type={type}
        backgroundImage={backgroundImage}
        point={point}
        onClick={onClick}
        radius={effectiveRadius}
        isNight={isNight}
      />
    </group>
  );
};

export default React.memo(HexagonMesh3D);
