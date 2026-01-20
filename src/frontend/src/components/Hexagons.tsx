import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./Hexagons.css";
import ControlPanel from "./ControlPanel";
import Hexagon from "./Hexagon";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "./ThemeProvider";
import type {
  HexagonPoint,
  PositionData,
  SquarePoint,
  LineData,
} from "./types";
import { TYPE_TO_ASSET } from "./types";
import { hexagonService } from "./hexagonService";
import {
  getHexagonLabel,
  getSquareLabel,
  getLineLabel,
  calculateGridDimensions,
  generateHexagonPoints,
  calculateHexagonLines,
  calculateHouseHoldPoints,
} from "./hexagonUtils";
import { getImageAsset } from "./imageAssets";

const Hexagons: React.FC = () => {
  const { backgroundImage } = useTheme();
  const [selectedHexagon, setSelectedHexagon] = useState<HexagonPoint | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<SquarePoint | null>(null);
  const [selectedLine, setSelectedLine] = useState<LineData | null>(null);
  const [power, setPower] = useState(0);
  const [charge, setCharge] = useState(50);
  const [time, setTime] = useState(24);
  const [positionData, setPositionData] = useState<PositionData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [arduinoConnected, setArduinoConnected] = useState(true);

  // LED-spezifische State-Variablen
  const [ledForward, setLedForward] = useState(true);
  const [ledColor, setLedColor] = useState("#ffffff");
  const [ledPulsFrequenz, setLedPulsFrequenz] = useState(2);

  // Konstanten für das Hexagon-Gitter
  const hexRadius = 50;
  const padding = 60;
  const cols = 5;
  const rows = 3;

  // Konstanten für die linken Quadrate
  const squareSize = 40;
  const squareYSpacing = squareSize * 1.5;
  const squarexSpacing = squareSize * 1.5;
  const squareRows = 9;
  const squareCols = 4;
  const squareOffset = 2 * squareSize;

  // Memoize Grid Calculations
  const { svgWidth, svgHeight, offsetX, offsetY, xSpacing, ySpacing } = useMemo(() => 
    calculateGridDimensions(hexRadius, cols, rows, padding, squareOffset),
    [hexRadius, cols, rows, padding, squareOffset]
  );

  const squares = useMemo(() => 
    calculateHouseHoldPoints(squareSize, squareYSpacing, squarexSpacing, squareRows, squareCols),
    [squareSize, squareYSpacing, squarexSpacing, squareRows, squareCols]
  );

  const points = useMemo(() => 
    generateHexagonPoints(cols, rows, offsetX, offsetY, xSpacing, ySpacing),
    [cols, rows, offsetX, offsetY, xSpacing, ySpacing]
  );

  const lines = useMemo(() => 
    calculateHexagonLines(points, cols, rows, xSpacing, ySpacing),
    [points, cols, rows, xSpacing, ySpacing]
  );

  // Memoize Position Map for O(1) lookups
  const positionMap = useMemo(() => {
    const map = new Map<number, PositionData>();
    positionData.forEach(pos => map.set(pos.EEPROM, pos));
    return map;
  }, [positionData]);

  // Optimized Data Fetching - verhindert Flackern
  useEffect(() => {
    let isMounted = true;
    let fetchCount = 0;

    const fetchPositions = async () => {
      try {
        const result = await hexagonService.getPositions();
        if (isMounted) {
          if (result.success && result.result?.data) {
            setArduinoConnected(true);
            
            // Only update if data actually changed
            setPositionData(prev => {
              const newData = result.result!.data;
              
              // Deep comparison to prevent unnecessary updates
              const hasChanged = prev.length !== newData.length || 
                prev.some((p, i) => 
                  p.EEPROM !== newData[i]?.EEPROM || 
                  p.TYPE !== newData[i]?.TYPE
                );
              
              if (hasChanged) {
                fetchCount++;
                console.log(`📡 Position Update #${fetchCount}: ${newData.length} Module erkannt`);
                setLastUpdate(new Date());
                return newData;
              }
              return prev;
            });
          } else {
            console.warn('⚠️ Keine Daten vom Server erhalten');
            setArduinoConnected(true);
          }
        }
      } catch (error) {
        console.error("❌ Fehler beim Abrufen der Positionen:", error);
        if (isMounted) {
          setArduinoConnected(false);
        }
      }
    };

    // Initial fetch
    console.log('🚀 Starte Positionsdaten-Abfrage...');
    fetchPositions();

    // Interval fetch - reduziert auf 3 Sekunden für weniger Flackern
    const interval = setInterval(fetchPositions, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Empty dependency array - run once on mount

  // Memoized Helper Functions
  const getHexagonBackgroundImage = useCallback((hexagonNumber: string): string | undefined => {
    const eeprom = parseInt(hexagonNumber);
    const position = positionMap.get(eeprom);

    if (position) {
      // Check if TYPE has mapping
      if (TYPE_TO_ASSET[position.TYPE]) {
        const assetId = TYPE_TO_ASSET[position.TYPE];
        const asset = getImageAsset(assetId);
        
        if (asset?.image) {
          console.log(`✅ Bild für Modul ${eeprom}: ${assetId}`);
          // Gib direkt das Bild zurück
          return asset.image;
        }
      }
    }
    return undefined;
  }, [positionMap]);

  const getHexagonType = useCallback((hexagonNumber: string): number | undefined => {
    const eeprom = parseInt(hexagonNumber);
    return positionMap.get(eeprom)?.TYPE;
  }, [positionMap]);

  // Event Handlers
  const handleHexagonClick = useCallback((point: HexagonPoint) => {
    setSelectedHexagon(point);
    setSelectedSquare(null);
    setSelectedLine(null);
  }, []);

  const handleSquareClick = useCallback((square: SquarePoint) => {
    setSelectedSquare(square);
    setSelectedHexagon(null);
    setSelectedLine(null);
  }, []);

  const handleLineClick = useCallback((line: LineData) => {
    setSelectedLine(line);
    setSelectedHexagon(null);
    setSelectedSquare(null);
  }, []);

  const handleSendSubmit = async () => {
    if (selectedHexagon) {
      const hexagonLabel = getHexagonLabel(selectedHexagon);
      const result = await hexagonService.sendUpdate(hexagonLabel, power, charge, time);
      if (!result.success) console.error("Update failed:", result.error);
    } else if (selectedSquare) {
      const squareLabel = getSquareLabel();
      const result = await hexagonService.sendUpdate(squareLabel, power, charge, time);
      if (!result.success) console.error("Update failed:", result.error);
    } else if (selectedLine) {
      const lineLabel = getLineLabel(selectedLine);
      if (lineLabel) {
        const result = await hexagonService.sendLineUpdate(
          String(lineLabel),
          ledForward,
          ledColor,
          ledPulsFrequenz
        );
        if (!result.success) console.error("Line update failed:", result.error);
      }
    }
  };

  const handleTurnOff = async () => {
    let result;
    if (selectedHexagon) {
      result = await hexagonService.sendTurnOff(getHexagonLabel(selectedHexagon));
    } else if (selectedSquare) {
      result = await hexagonService.sendTurnOff(getSquareLabel());
    } else if (selectedLine) {
      const lineLabel = getLineLabel(selectedLine);
      if (lineLabel) {
        result = await hexagonService.sendLineTurnOff(String(lineLabel));
      }
    }

    if (result && !result.success) {
      console.error("Turn off failed:", result.error);
    }
  };

  const handleReset = async () => {
    const result = await hexagonService.sendTurnOff();
    if (!result.success) console.error("Reset failed:", result.error);
  };

  const handleClosePopup = useCallback(() => {
    setSelectedHexagon(null);
    setSelectedSquare(null);
    setSelectedLine(null);
  }, []);

  return (
    <div 
      className="dashboard-layout" 
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Connection Warning Banner */}
      {!arduinoConnected && (
        <div className="connection-banner">
          ⚠ Verbindung unterbrochen
          <button onClick={() => setArduinoConnected(true)}>Reconnect</button>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="status-bar">
        <div className="status-bar-left">
          <div className={`connection-status ${arduinoConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {arduinoConnected ? 'Verbunden' : 'Getrennt'}
          </div>
          {lastUpdate && (
            <div className="last-update">
              {lastUpdate.toLocaleTimeString('de-DE')}
            </div>
          )}
        </div>
        <div className="status-bar-right">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Control Panel Modal - optimiert für Performance */}
      {(selectedHexagon || selectedSquare || selectedLine) && (
        <div className="control-modal-overlay" onClick={handleClosePopup}>
          <div className="control-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClosePopup}>✕</button>
            <ControlPanel
              selectedHexagon={selectedHexagon}
              selectedSquare={selectedSquare}
              selectedLine={selectedLine}
              power={power}
              charge={charge}
              time={time}
              onPowerChange={setPower}
              onChargeChange={setCharge}
              onTimeChange={setTime}
              onUpdate={handleSendSubmit}
              onTurnOff={handleTurnOff}
              onReset={handleReset}
              getHexagonLabel={getHexagonLabel}
              getSquareLabel={getSquareLabel}
              getLineLabel={getLineLabel}
              getHexagonType={getHexagonType}
              ledForward={ledForward}
              ledColor={ledColor}
              ledPulsFrequenz={ledPulsFrequenz}
              onLedForwardChange={setLedForward}
              onLedColorChange={setLedColor}
              onLedPulsFrequenzChange={setLedPulsFrequenz}
              onClose={handleClosePopup}
            />
          </div>
        </div>
      )}

      <main className="main-content">
        <div className="canvas-wrapper">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="hexagon-canvas"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Lines */}
            <g className="lines">
              {lines.map((line, index) => (
                <line
                  key={`line-${index}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  className={`hexline ${selectedLine === line ? "selected-line" : ""}`}
                  onClick={() => handleLineClick(line)}
                />
              ))}
            </g>

            {/* Squares */}
            <g className="squares">
              {squares.map((square) => (
                <rect
                  key={`square-${square.index}`}
                  x={square.x}
                  y={square.y}
                  width={square.width}
                  height={square.height}
                  className={`left-square ${selectedSquare?.index === square.index ? "square-selected" : ""}`}
                  onClick={() => handleSquareClick(square)}
                  rx="4"
                  ry="4"
                />
              ))}
            </g>

            {/* Hexagons */}
            <g className="hexagons">
              {points.map((point) => {
                const label = getHexagonLabel(point);
                return (
                  <Hexagon
                    key={`${point.row}-${point.col}`}
                    point={point}
                    radius={hexRadius}
                    isSelected={
                      selectedHexagon?.row === point.row &&
                      selectedHexagon?.col === point.col
                    }
                    onClick={handleHexagonClick}
                    backgroundImage={getHexagonBackgroundImage(label)}
                  />
                );
              })}
            </g>
          </svg>
        </div>
      </main>
    </div>
  );
};

export default Hexagons;
