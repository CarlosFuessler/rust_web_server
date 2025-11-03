import React from "react";
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
  const points = generateHexagonPoints(point.x, point.y, radius);
  const hexagonId = `hexagon-${point.row}-${point.col}`;

  return (
    <>
      {/* Definiere das Hintergrundbild-Pattern falls vorhanden */}
      {backgroundImage && (
        <defs>
          <pattern
            id={`${hexagonId}-pattern`}
            patternUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <image
              href={backgroundImage}
              x="0"
              y="0"
              width={radius*2}
              height={radius*2}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        </defs>
      )}
      
      <polygon
        points={points}
        fill={backgroundImage ? `url(#${hexagonId}-pattern)` : isSelected ? "#FF6B6B" : "#4ECDC4"}
        stroke="#333"
        strokeWidth="2"
        className={`hexagon ${isSelected ? "hexagon-selected" : ""} ${backgroundImage ? "hexagon-with-image" : ""}`}
        onClick={() => onClick(point)}
      />
    </>
  );
};

export default Hexagon;
