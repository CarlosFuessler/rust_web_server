import type {
  HexagonPoint,
  HexagonLabel,
  LineData,
  LineLabel,
  DirectionVector,
  Direction,
} from "./types";

export const hexagonLabels: HexagonLabel[] = [
  { row: 2, col: 0, text: "1" },
  { row: 2, col: 2, text: "2" },
  { row: 2, col: 4, text: "3" },
  { row: 2, col: 1, text: "4" },
  { row: 2, col: 3, text: "5" },
  { row: 1, col: 0, text: "6" },
  { row: 1, col: 2, text: "7" },
  { row: 1, col: 4, text: "8" },
  { row: 1, col: 1, text: "9" },
  { row: 1, col: 3, text: "10" },
  { row: 0, col: 0, text: "11" },
  { row: 0, col: 2, text: "12" },
  { row: 0, col: 4, text: "13" },
  { row: 0, col: 1, text: "14" },
  { row: 0, col: 3, text: "15" },
];

export const squareLabels: HexagonLabel[] = [{ row: 0, col: 0, text: "0" }];

// Labels für Linien - IDs basieren auf Start- und End-Koordinaten
export const lineLabels: LineLabel[] = [
  { id: "line_0_2_-1_2", text: "29" },
  { id: "line_0_2_0_1", text: "28" },
  { id: "line_0_1_-1_0", text: "27" },
  { id: "line_0_0_-1_-1", text: "26" },
  { id: "line_0_1_0_0", text: "25" },
  { id: "line_1_1_0_1", text: "24" },
  { id: "line_1_1_0_0", text: "23" },
  { id: "line_1_0_0_0", text: "22" },
  { id: "line_1_1_1_0", text: "21" },
  { id: "line_2_1_1_1", text: "20" },
  { id: "line_2_1_1_2", text: "19" },
  { id: "line_1_2_1_1", text: "18" },
  { id: "line_1_1_0_2", text: "17" },
  { id: "line_1_2_0_2", text: "16" },
  { id: "line_1_3_1_2", text: "15" },
  { id: "line_1_3_0_2", text: "14" },
  { id: "line_0_3_0_2", text: "13" },
  { id: "line_1_3_0_3", text: "12" },
  { id: "line_1_3_0_4", text: "11" },
  { id: "line_1_4_0_4", text: "10" },
  { id: "line_1_4_1_3", text: "9" },
  { id: "line_2_3_1_3", text: "8" },
  { id: "line_2_3_1_4", text: "7" },
  { id: "line_2_4_1_4", text: "6" },
  { id: "line_2_4_2_3", text: "5" },
  { id: "line_2_3_1_2", text: "4" },
  { id: "line_2_2_1_2", text: "3" },
  { id: "line_2_2_2_1", text: "2" },
  { id: "line_2_1_2_0", text: "1" },
  { id: "line_2_0_1_-1", text: "0" },
];

export const getHexagonLabel = (point: HexagonPoint): string => {
  const label = hexagonLabels.find(
    (label) => label.row === point.row && label.col === point.col
  );
  return label ? label.text : `${point.row},${point.col}`;
};

export const getSquareLabel = (): string => {
  // Alle Squares bekommen das Label "0"
  return "0";
};

// Hilfsfunktion um eine eindeutige ID für eine Linie zu generieren
export const generateLineId = (
  newRow: number,
  newCol: number,
  oldRow: number,
  oldCol: number
): string => {
  return `line_${newRow}_${newCol}_${oldRow}_${oldCol}`;
};

// Funktion um das Label einer Linie zu erhalten
export const getLineLabel = (line: LineData): string | number | undefined => {
  const lineId = line.id;
  const label = lineLabels.find((label) => label.id === lineId);
  return label?.text;
};

// Funktion um die Position eines Line-Labels zu berechnen
export const calculateLineLabelPosition = (
  line: LineData,
  position: "start" | "middle" | "end" = "middle"
) => {
  const { x1, y1, x2, y2 } = line;

  switch (position) {
    case "start":
      return { x: x1, y: y1 };
    case "end":
      return { x: x2, y: y2 };
    case "middle":
    default:
      return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  }
};

export const calculateGridDimensions = (
  hexRadius: number,
  cols: number,
  rows: number,
  padding: number,
  squareOffset: number
) => {
  const xSpacing = hexRadius * 1.5 * 2;
  const ySpacing = hexRadius * Math.sqrt(3) * 2;

  const gridWidth = (cols - 1) * xSpacing + 2 * hexRadius + xSpacing;
  const gridHeight = (rows - 1) * ySpacing + 2 * hexRadius + ySpacing;

  const svgWidth = gridWidth + 2 * padding + squareOffset;
  const svgHeight = gridHeight + 2 * padding;

  const offsetX = svgWidth / 2 - ((cols - 1) * xSpacing) / 2;
  const offsetY = padding + hexRadius + ySpacing * 0.75;

  return {
    svgWidth,
    svgHeight,
    offsetX,
    offsetY,
    xSpacing,
    ySpacing,
  };
};

export const generateHexagonPoints = (
  cols: number,
  rows: number,
  offsetX: number,
  offsetY: number,
  xSpacing: number,
  ySpacing: number
): HexagonPoint[] => {
  const points: HexagonPoint[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + col * xSpacing;
      const y = offsetY + row * ySpacing - (col % 2) * (ySpacing / 2);
      points.push({ x, y, row, col });
    }
  }
  return points;
};

export const calculateHexagonLines = (
  points: HexagonPoint[],
  cols: number,
  rows: number,
  xSpacing: number,
  ySpacing: number
): LineData[] => {
  const pointMap = new Map<string, HexagonPoint>();
  points.forEach((p) => pointMap.set(`${p.row},${p.col}`, p));

  const neighborOffsets = [
    { dc: +1, dr: 0 },
    { dc: 0, dr: +1 },
    { dc: -1, dr: +1 },
    { dc: -1, dr: 0 },
    { dc: 0, dr: -1 },
    { dc: +1, dr: -1 },
    { dc: +1, dr: +1 },
  ];

  const maxDistance = Math.max(xSpacing, ySpacing) * 1.1;
  const lines: LineData[] = [];

  points.forEach((p) => {
    neighborOffsets.forEach(({ dr, dc }) => {
      const nRow = p.row + dr;
      const nCol = p.col + dc;
      if (nRow >= 0 && nRow < rows && nCol >= 0 && nCol < cols) {
        if (nRow > p.row || (nRow === p.row && nCol > p.col)) {
          const neighbor = pointMap.get(`${nRow},${nCol}`);
          if (neighbor) {
            const dx = neighbor.x - p.x;
            const dy = neighbor.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= maxDistance) {
              const lineData: LineData = {
                x1: p.x,
                y1: p.y,
                x2: neighbor.x,
                y2: neighbor.y,
              };
              lineData.id = generateLineId(nRow, nCol, p.row, p.col);
              lines.push(lineData);
            }
          }
        }
      }
    });
  });

  // Komplexe Linien-Berechnung
  const baseHex = pointMap.get("1,1");
  let neighborVectors: DirectionVector[] = [];
  if (baseHex) {
    const directions: Direction[] = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 0 },
      { dr: -1, dc: 1 },
    ];
    neighborVectors = directions
      .map(({ dr, dc }) => {
        const nRow = baseHex.row + dr;
        const nCol = baseHex.col + dc;
        const neighbor = pointMap.get(`${nRow},${nCol}`);
        if (neighbor) {
          return {
            dr,
            dc,
            vx: neighbor.x - baseHex.x,
            vy: neighbor.y - baseHex.y,
          };
        }
        return null;
      })
      .filter((v): v is DirectionVector => v !== null);
  }

  const extraLines = [
    { row: 0, col: 0, dr: -1, dc: -1, extraLenght: -0.25 },
    { row: 0, col: 1, dr: -1, dc: -1, extraLenght: -0.25 },
    { row: 0, col: 2, dr: -1, dc: 0 },
    { row: 2, col: 0, dr: -1, dc: -1, extraLenght: -0.25 },
  ];

  const removeLines = [
    { row: 1, col: 0, dr: 1, dc: 0 },
    { row: 2, col: 2, dr: -1, dc: 1 },
    { row: 0, col: 3, dr: 1, dc: 1 },
    { row: 1, col: 0, dr: 1, dc: 1 },
  ];

  const matchesDirection = (a: Direction, b: Direction) => {
    return (
      (a.dr === b.dr && a.dc === b.dc) || (a.dr === -b.dr && a.dc === -b.dc)
    );
  };

  const getLinePos = (
    row: number,
    col: number,
    dr: number,
    dc: number,
    extraLenght: number = 0
  ) => {
    const p = pointMap.get(`${row},${col}`);
    if (!p) return null;
    const v = neighborVectors.find((vec) => matchesDirection(vec, { dr, dc }));
    if (v) {
      const invert = v.dr === -dr && v.dc === -dc;
      return {
        x1: p.x,
        y1: p.y,
        x2:
          p.x +
          (invert ? -v.vx : v.vx) +
          (extraLenght != 0 ? v.vx * extraLenght : 0),
        y2:
          p.y +
          (invert ? -v.vy : v.vy) +
          (extraLenght != 0 ? v.vy * extraLenght : 0),
      };
    }
    return null;
  };

  const isSameLine = (a: LineData, b: LineData) => {
    return (
      Math.abs(a.x1 - b.x1) < 1e-6 &&
      Math.abs(a.y1 - b.y1) < 1e-6 &&
      Math.abs(a.x2 - b.x2) < 1e-6 &&
      Math.abs(a.y2 - b.y2) < 1e-6
    );
  };

  // Linien entfernen
  removeLines.forEach(({ row, col, dr, dc }) => {
    const newLine = getLinePos(row, col, dr, dc);
    if (newLine) {
      const idx = lines.findIndex((line) => isSameLine(line, newLine));
      if (idx !== -1) {
        lines.splice(idx, 1);
      }
    }
  });

  // Zusätzliche Linien hinzufügen
  extraLines.forEach(({ row, col, dr, dc, extraLenght }) => {
    const newLinePos = getLinePos(row, col, dr, dc, extraLenght);
    if (newLinePos) {
      const newLine: LineData = {
        ...newLinePos,
        id: generateLineId(row, col, row + dr, col + dc),
      };
      lines.push(newLine);
    }
  });

  return lines;
};

const removeSquare = [
  { row: 0, col: 1 },
  { row: 2, col: 1 },
  { row: 8, col: 1 },
  { row: 2, col: 2 },
  { row: 3, col: 2 },
  { row: 5, col: 2 },
  { row: 6, col: 2 },
  { row: 7, col: 2 },
  { row: 8, col: 2 },
  { row: 0, col: 3 },
  { row: 3, col: 3 },
  { row: 4, col: 3 },
  { row: 5, col: 3 },
  { row: 6, col: 3 },
  { row: 7, col: 3 },
  { row: 8, col: 3 },
];

export const calculateHouseHoldPoints = (
  squareSize: number,
  squareYSpacing: number,
  squareXSpacing: number,
  squareRows: number,
  squareColums: number
) => {
  const squares = [];

  for (let row = 0; row < squareRows; row++) {
    for (let col = 0; col < squareColums; col++) {
      if (
        removeSquare.find((square) => square.row === row && square.col === col)
      ) {
        continue;
      }

      const x = 25 + col * squareXSpacing;
      const y = 50 + row * squareYSpacing - (col % 2) * (squareYSpacing / 2);

      squares.push({
        x,
        y,
        row,
        col,
        width: squareSize,
        height: squareSize,
        index: row * squareColums + col,
      });
    }
  }

  return squares;
};

// Funktion um alle Line-Labels zu erhalten
export const getAllLineLabels = (): LineLabel[] => {
  return lineLabels;
};

// Funktion um Line-Labels nach Position zu filtern
export const getLineLabelsByPosition = (
  position: "start" | "middle" | "end"
): LineLabel[] => {
  return lineLabels.filter((label) => label.position === position);
};
