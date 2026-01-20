export interface HexagonPoint {
  x: number;
  y: number;
  row: number;
  col: number;
}

export interface SquarePoint {
  x: number;
  y: number;
  row: number;
  col: number;
  width: number;
  height: number;
  index: number;
}

export interface HexagonLabel {
  row: number;
  col: number;
  text: string;
}

export interface LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string; // Optionales Label für die Linie
  id?: string; // Optionale eindeutige ID für die Linie
}

export interface LineLabel {
  id: string; // Eindeutige ID der Linie
  text: string|number; // Anzuzeigender Text
  position?: 'start' | 'middle' | 'end'; // Position des Labels auf der Linie
}

export interface DirectionVector {
  dr: number;
  dc: number;
  vx: number;
  vy: number;
}

export interface Direction {
  dr: number;
  dc: number;
}

export interface HexagonProps {
  point: HexagonPoint;
  radius: number;
  isSelected: boolean;
  onClick: (point: HexagonPoint) => void;
  backgroundImage?: string;
}

export interface ControlPanelProps {
  selectedHexagon: HexagonPoint | null;
  selectedSquare?: SquarePoint | null;
  selectedLine?: LineData | null; // Neu: Support für ausgewählte Linien
  power: number;
  charge: number;
  time: number;
  onPowerChange: (value: number) => void;
  onChargeChange: (value: number) => void;
  onTimeChange: (value: number) => void;
  onUpdate: () => void;
  onTurnOff: () => void;
  onReset: () => void;
  getHexagonLabel: (point: HexagonPoint) => string;
  getSquareLabel?: () => string;
  getLineLabel?: (line: LineData) => string | number | undefined; // Neu: Support für Line-Labels
  getHexagonType?: (hexagonNumber: string) => number | undefined; // Neu: Support für Hexagon-Type bestimmung
  // LED-spezifische Props
  ledForward?: boolean;
  ledColor?: string;
  ledPulsFrequenz?: number;
  onLedForwardChange?: (forward: boolean) => void;
  onLedColorChange?: (color: string) => void;
  onLedPulsFrequenzChange?: (frequency: number) => void;
  onClose: () => void;
}

export interface HexagonAssetMapping {
  [hexagonNumber: number]: string; // Hexagon-Nummer -> Asset-ID
}

// Typen für die Position-API Response
export interface PositionData {
  EEPROM: number;
  I2C: number;
  TYPE: number;
}

export interface PositionsResponse {
  success: boolean;
  result?: {
    data: PositionData[];
  };
  error?: string;
}

// Mapping der TYPE-Konstanten zu Asset-IDs
export const TYPE_TO_ASSET: Record<number, string> = {
  1: 'solar',      // TYPE_SOLAR
  2: 'wind',       // TYPE_WIND
  3: 'battery',    // TYPE_BATTERY
  4: 'water',      // TYPE_HYDROGEN (verwende Wassertank-Icon)
  5: 'charging',   // TYPE_CHARGINGSTATION
  6: 'industry',   // TYPE_FACTORYPLANT
  7: 'household',   // TYPE_HOUSEHOLD
};
