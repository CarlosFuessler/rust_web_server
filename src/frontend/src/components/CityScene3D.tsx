import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three-stdlib";
import HexagonMesh3D from "./HexagonMesh3D";
import HouseholdMesh3D from "./HouseholdMesh3D";
import ConnectionLine3D from "./ConnectionLine3D";
import type { HexagonPoint, SquarePoint, LineData } from "./types";
import type { TimeOfDay, Weather } from "./SceneControls";

// ─── env presets ──────────────────────────────────────────────────────────────
const TIME_PRESETS = {
  day: { sunColor: "#f2f4f5", sunI: 1.35, sunPos: [18, 30, 12] as [n, n, n], ambColor: "#b8c5cf", ambI: 0.5 },
  sunset: { sunColor: "#d4ad8f", sunI: 0.9, sunPos: [26, 10, 10] as [n, n, n], ambColor: "#a48f80", ambI: 0.42 },
  night: { sunColor: "#9db2ca", sunI: 0.32, sunPos: [12, 24, 8] as [n, n, n], ambColor: "#475d78", ambI: 0.45 },
};
type n = number;
const WEATHER_MOD = {
  clear: { ambMul: 1.00, sunMul: 1.00, fogNear: 45, fogFar: 90, fogOverride: null as string | null },
  cloudy: { ambMul: 0.65, sunMul: 0.25, fogNear: 30, fogFar: 65, fogOverride: "#7a8898" },
  rain: { ambMul: 0.42, sunMul: 0.13, fogNear: 18, fogFar: 42, fogOverride: "#556070" },
  fog: { ambMul: 0.50, sunMul: 0.18, fogNear: 6, fogFar: 28, fogOverride: "#7c8fa0" },
  snow: { ambMul: 0.78, sunMul: 0.58, fogNear: 22, fogFar: 52, fogOverride: "#c8d4e4" },
};

const SCENE_LEVELS = {
  groundY: -0.62,
  cityY: -0.36,
  elementY: 0.08,
  lineY: 0.02,
};

// ─── rain / snow particles ─────────────────────────────────────────────────────
const RainParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 2000;
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { a[i * 3] = (Math.random() - .5) * 60; a[i * 3 + 1] = Math.random() * 22; a[i * 3 + 2] = (Math.random() - .5) * 60; }
    return a;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return g;
  }, [positions]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) { p[i * 3 + 1] -= dt * 18; if (p[i * 3 + 1] < 0) p[i * 3 + 1] = 22; }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#8ab4d8" size={0.035} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
};

const SnowParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 700;
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { a[i * 3] = (Math.random() - .5) * 60; a[i * 3 + 1] = Math.random() * 20; a[i * 3 + 2] = (Math.random() - .5) * 60; }
    return a;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return g;
  }, [positions]);
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) { p[i * 3 + 1] -= dt * 1.4; p[i * 3] += Math.sin(t * 0.5 + i) * dt * 0.15; if (p[i * 3 + 1] < 0) p[i * 3 + 1] = 20; }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#e8eef8" size={0.07} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

// ─── ground plane ─────────────────────────────────────────────────────────────
const Ground: React.FC<{ timeOfDay: TimeOfDay }> = ({ timeOfDay }) => {
  const color = timeOfDay === "night" ? "#2a3340" : timeOfDay === "sunset" ? "#4b3a32" : "#5f6972";
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SCENE_LEVELS.groundY, 0]} receiveShadow>
      <planeGeometry args={[360, 360]} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0.1}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
    </mesh>
  );
};

interface SceneBounds {
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
}

const CityObjModel: React.FC<{ bounds: SceneBounds }> = ({ bounds }) => {
  const cityGeo = useLoader(STLLoader, "/city.stl");

  const cityScene = useMemo(() => {
    const geo = cityGeo.clone();
    geo.computeVertexNormals();

    const cityMaterial = new THREE.MeshStandardMaterial({
      color: "#8d949c",
      roughness: 0.45,
      metalness: 0.36,
      emissive: "#000000",
      emissiveIntensity: 0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const mesh = new THREE.Mesh(geo, cityMaterial);
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    // STL exports are commonly Z-up; rotate so city stands on the ground plane.
    mesh.rotation.x = -Math.PI / 2;

    const baseBox = new THREE.Box3().setFromObject(mesh);
    const baseCenter = baseBox.getCenter(new THREE.Vector3());
    const modelScale = SCALE;
    const leftShift = 0.0005;   // world-units to the left of scene center
    const cityGap = 0.0005;     // world-units behind scene center (negative Z)
    const yLift = 0.5;   // world-units above ground plane

    mesh.scale.set(modelScale, modelScale, modelScale);

    mesh.position.set(
      (-baseCenter.x * modelScale) + bounds.centerX - leftShift,
      (-baseBox.min.y * modelScale) + SCENE_LEVELS.cityY + yLift,
      (-baseCenter.z * modelScale) + bounds.centerZ - cityGap
    );

    return mesh;
  }, [cityGeo, bounds.centerX, bounds.centerZ, bounds.width, bounds.depth]);

  return <primitive object={cityScene} />;
};

// ─── SCALE ────────────────────────────────────────────────────────────────────
const SCALE = 0.02;

// ─── scene content ────────────────────────────────────────────────────────────
interface CitySceneContentProps {
  hexPoints: HexagonPoint[];
  squarePoints: SquarePoint[];
  lines: LineData[];
  selectedHex: HexagonPoint | null;
  selectedSquare: SquarePoint | null;
  selectedLine: LineData | null;
  onHexClick: (p: HexagonPoint) => void;
  onSquareClick: (s: SquarePoint) => void;
  onLineClick: (l: LineData) => void;
  backgroundImage?: string;
  timeOfDay: TimeOfDay;
  weather: Weather;
}

const CitySceneContent: React.FC<CitySceneContentProps> = (props) => {
  const { hexPoints, squarePoints, lines, selectedHex, selectedSquare, selectedLine,
    onHexClick, onSquareClick, onLineClick, timeOfDay, weather } = props;

  const tp = TIME_PRESETS[timeOfDay];
  const wm = WEATHER_MOD[weather];
  const isNight = timeOfDay === "night";

  const fogColor = wm.fogOverride ?? (timeOfDay === "night" ? "#2d3a4b" : timeOfDay === "sunset" ? "#8a5b46" : "#a8b0b6");
  const fogNear = timeOfDay === "night" ? Math.max(wm.fogNear, 32) : wm.fogNear;
  const fogFar = timeOfDay === "night" ? Math.max(wm.fogFar, 96) : wm.fogFar;

  const hexRadius = useMemo(() => hexPoints[0]?.radius ?? (50 * SCALE), [hexPoints]);
  const sceneBounds = useMemo<SceneBounds>(() => {
    const xValues: number[] = [];
    const zValues: number[] = [];

    hexPoints.forEach((p) => {
      xValues.push(p.x * SCALE);
      zValues.push(p.y * SCALE);
    });
    squarePoints.forEach((s) => {
      xValues.push(s.x * SCALE);
      zValues.push(s.y * SCALE);
    });
    lines.forEach((l) => {
      xValues.push(l.x1 * SCALE, l.x2 * SCALE);
      zValues.push(l.y1 * SCALE, l.y2 * SCALE);
    });

    if (!xValues.length || !zValues.length) {
      return { centerX: 0, centerZ: 0, width: 14, depth: 14 };
    }

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minZ = Math.min(...zValues);
    const maxZ = Math.max(...zValues);
    return {
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
      width: Math.max(maxX - minX, 12),
      depth: Math.max(maxZ - minZ, 12),
    };
  }, [hexPoints, squarePoints, lines]);

  const cityBounds = useMemo<SceneBounds>(() => {
    if (!squarePoints.length) {
      return sceneBounds;
    }

    const xValues = squarePoints.map((s) => s.x * SCALE);
    const zValues = squarePoints.map((s) => s.y * SCALE);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minZ = Math.min(...zValues);
    const maxZ = Math.max(...zValues);

    return {
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
      width: Math.max(maxX - minX + 1.2, 4),
      depth: Math.max(maxZ - minZ + 1.8, 8),
    };
  }, [squarePoints, sceneBounds]);
  return (
    <>
      <color attach="background" args={[isNight ? "#2f3a48" : timeOfDay === "sunset" ? "#897063" : "#b6bec6"]} />
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      <ambientLight color={tp.ambColor} intensity={tp.ambI * wm.ambMul} />
      <hemisphereLight
        args={[
          isNight ? "#8b9db0" : "#d2d9de",
          isNight ? "#2b3440" : "#6d756b",
          isNight ? 0.38 * wm.ambMul : 0.28 * wm.ambMul,
        ]}
      />
      <directionalLight
        color={tp.sunColor} intensity={tp.sunI * wm.sunMul}
        position={tp.sunPos} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-bias={-0.00008}
        shadow-normalBias={0.05}
      />
      {isNight && (
        <directionalLight color="#9aaec2" intensity={0.42 * wm.sunMul} position={[-16, 18, -8]} />
      )}
      <pointLight color={isNight ? "#7f8fa0" : "#7a8b9a"} intensity={isNight ? 0.24 : 0.16} position={[0, 8, 0]} />

      <Ground timeOfDay={timeOfDay} />
      <CityObjModel bounds={cityBounds} />

      {weather === "rain" && <RainParticles />}
      {weather === "snow" && <SnowParticles />}

      {lines.map((line, idx) => {
        const start = new THREE.Vector3(line.x1 * SCALE, SCENE_LEVELS.lineY, line.y1 * SCALE);
        const end = new THREE.Vector3(line.x2 * SCALE, SCENE_LEVELS.lineY, line.y2 * SCALE);
        const dir = end.clone().sub(start);
        const dist = dir.length();
        if (dist > 1e-6) {
          dir.normalize();
          const trim = Math.min(hexRadius * 0.62, dist * 0.33);
          start.addScaledVector(dir, trim);
          end.addScaledVector(dir, -trim);
        }
        const sp: [number, number, number] = [start.x, start.y, start.z];
        const ep: [number, number, number] = [end.x, end.y, end.z];
        return (
          <ConnectionLine3D key={line.id ?? idx} line={line} isSelected={selectedLine?.id === line.id}
            onClick={onLineClick} start3D={sp} end3D={ep}
            ledColor={line.color} isNight={isNight} />
        );
      })}

      {hexPoints.map(p => (
        <HexagonMesh3D key={`${p.row}_${p.col}`} point={p} radius={hexRadius}
          isSelected={selectedHex?.row === p.row && selectedHex?.col === p.col}
          onClick={onHexClick}
          backgroundImage={p.backgroundImage}
          type={p.type}
          label={p.label ?? ""}
          position3D={[p.x * SCALE, SCENE_LEVELS.elementY, p.y * SCALE]}
          isNight={isNight} />
      ))}

      {squarePoints.map(s => (
        <HouseholdMesh3D key={s.index} square={s}
          isSelected={selectedSquare?.index === s.index}
          onClick={onSquareClick} position3D={[s.x * SCALE, SCENE_LEVELS.elementY, s.y * SCALE]} isNight={isNight} />
      ))}

      <OrbitControls makeDefault enablePan={false} enableRotate enableZoom
        minDistance={8} maxDistance={30} minPolarAngle={0.4} maxPolarAngle={Math.PI / 2.2}
        target={[sceneBounds.centerX, 0, sceneBounds.centerZ]} />
    </>
  );
};

// ─── exported wrapper ─────────────────────────────────────────────────────────
interface CityScene3DProps extends Omit<CitySceneContentProps, "timeOfDay" | "weather"> {
  timeOfDay?: TimeOfDay;
  weather?: Weather;
}

const CityScene3D: React.FC<CityScene3DProps> = ({ timeOfDay = "day", weather = "clear", ...rest }) => (
  <Canvas
    shadows
    camera={{ position: [0, 14, 18], fov: 52, near: 0.1, far: 200 }}
    style={{ width: "100%", height: "100%" }}
    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
  >
    <CitySceneContent {...rest} timeOfDay={timeOfDay} weather={weather} />
  </Canvas>
);

export default CityScene3D;
