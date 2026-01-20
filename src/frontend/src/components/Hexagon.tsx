import React, { useMemo } from "react";
import type { HexagonProps } from "./types";

const generateHexagonPoints = (
  centerX: number,
  centerY: number,
  radius: number
): string => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
};

const Hexagon: React.FC<HexagonProps> = ({
  point,
  radius,
  isSelected,
  onClick,
  backgroundImage,
}) => {
  const points = useMemo(
    () => generateHexagonPoints(point.x, point.y, radius),
    [point.x, point.y, radius]
  );
  
  const hexagonId = `hexagon-${point.row}-${point.col}`;

  // Memoize clip path ID to prevent re-renders
  const clipPathId = React.useMemo(() => `hex-clip-${hexagonId}`, [hexagonId]);
  const gradientId = React.useMemo(() => `hex-grad-${hexagonId}`, [hexagonId]);
  
  // Memoize background image for stable reference
  const stableImage = useMemo(() => backgroundImage, [backgroundImage]);

  return (
    <g className="hexagon-group" onClick={() => onClick(point)}>
      <defs>
        {/* Clip Path for Hexagon */}
        <clipPath id={clipPathId}>
          <polygon points={points} />
        </clipPath>
        
        {/* Gradient for Hex Background */}
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.08)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
        </radialGradient>
      </defs>
      
      {/* Base Hexagon */}
      <polygon
        points={points}
        fill={backgroundImage ? 'rgba(30, 30, 40, 0.9)' : `url(#${gradientId})`}
        className={`hexagon ${isSelected ? "hexagon-selected" : ""} ${backgroundImage ? "hexagon-with-image" : ""}`}
      />
      
      {/* Image as regular image element with clip path */}
      {stableImage && (
        <image
          key={`${hexagonId}-img`}
          href={stableImage}
          x={point.x - radius}
          y={point.y - radius}
          width={radius * 2}
          height={radius * 2}
          clipPath={`url(#${clipPathId})`}
          preserveAspectRatio="xMidYMid slice"
          opacity="0.85"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* Overlay Effect for Images */}
      {stableImage && (
        <polygon
          points={points}
          fill="rgba(15, 17, 21, 0.15)"
          pointerEvents="none"
        />
      )}
      
      {/* Power Status Indicator */}
      {stableImage && (
        <circle
          cx={point.x}
          cy={point.y - radius + 12}
          r="5"
          fill="#10b981"
          className="status-led"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  );
};

export default React.memo(Hexagon);
