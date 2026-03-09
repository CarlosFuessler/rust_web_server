import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./Hexagons.css";
import ControlPanel from "./ControlPanel";
import CityScene3D from "./CityScene3D";
import SceneControls, { TimeOfDay, Weather } from "./SceneControls";
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
  // state
  const [selectedHexagon, setSelectedHexagon] = useState<HexagonPoint | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<SquarePoint | null>(null);
  const [selectedLine, setSelectedLine] = useState<LineData | null>(null);
  const [power, setPower] = useState(0);
  const [charge, setCharge] = useState(50);
  const [time, setTime] = useState(24);
  const [positionData, setPositionData] = useState<PositionData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [webserverConnected, setWebserverConnected] = useState(true);
  const [lineColors, setLineColors] = useState<Record<string, string>>({});

  // Scene environment state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [weather, setWeather] = useState<Weather>("clear");

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
  const gridDims = useMemo(() => 
    calculateGridDimensions(hexRadius, cols, rows, padding, squareOffset),
    [hexRadius, cols, rows, padding, squareOffset]
  );
  const { offsetX, offsetY, xSpacing, ySpacing } = gridDims;

  const squares = useMemo(() => 
    calculateHouseHoldPoints(squareSize, squareYSpacing, squarexSpacing, squareRows, squareCols),
    [squareSize, squareYSpacing, squarexSpacing, squareRows, squareCols]
  );

  const points = useMemo(() => 
    generateHexagonPoints(cols, rows, offsetX, offsetY, xSpacing, ySpacing),
    [cols, rows, offsetX, offsetY, xSpacing, ySpacing]
  );

  const baseLines = useMemo(() => 
    calculateHexagonLines(points, cols, rows, xSpacing, ySpacing),
    [points, cols, rows, xSpacing, ySpacing]
  );

  const lines = useMemo(
    () =>
      baseLines.map((line) => ({
        ...line,
        color: line.id ? lineColors[line.id] ?? line.color : line.color,
      })),
    [baseLines, lineColors]
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
          setWebserverConnected(Boolean(result.serverReachable));
          if (result.serverReachable) {
            setLastUpdate(new Date());
          }

          if (result.success && result.result?.data) {
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
                return newData;
              }
              return prev;
            });
          } else {
            console.warn("⚠️ Keine Moduldaten vom Webserver erhalten");
          }
        }
      } catch (error) {
        console.error("❌ Fehler beim Abrufen der Positionen:", error);
        if (isMounted) {
          setWebserverConnected(false);
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

  // Enrich hex points with backgroundImage and type for 3D rendering
  const enrichedHexPoints = useMemo((): HexagonPoint[] =>
    points.map(p => {
      const label = getHexagonLabel(p);
      return {
        ...p,
        label,
        backgroundImage: getHexagonBackgroundImage(label),
        type: getHexagonType(label),
        radius: hexRadius * 0.02, // match SCALE constant
      };
    }), [points, getHexagonBackgroundImage, getHexagonType, hexRadius]);

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
    setLedColor(line.color ?? "#ffffff");
  }, []);

  const handleLedColorChange = useCallback(
    (newColor: string) => {
      setLedColor(newColor);
      if (selectedLine?.id) {
        setLineColors((prev) => ({ ...prev, [selectedLine.id!]: newColor }));
      }
    },
    [selectedLine]
  );

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
        if (!result.success) {
          console.error("Line update failed:", result.error);
        } else if (selectedLine.id) {
          setLineColors((prev) => ({ ...prev, [selectedLine.id!]: ledColor }));
        }
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
    <div className="dashboard-layout">
      <header className="status-bar">
        <div className="status-bar-left">
          <div className="brand-block">
            <img className="brand-logo" src="/fraunhofer.png" alt="Fraunhofer logo" />
            <div className="brand-text">
              <span className="brand-name">Fraunhofer IEE</span>
            </div>
          </div>
          <div className={`connection-status ${webserverConnected ? "" : "disconnected"}`}>
            <span className="status-dot" />
            <span>{webserverConnected ? "Webserver online" : "Webserver offline"}</span>
          </div>
        </div>
        {lastUpdate && (
          <div className="status-bar-right">
            <span className="last-update">
              {`Letztes Update ${lastUpdate.toLocaleTimeString("de-DE")}`}
            </span>
          </div>
        )}
      </header>

      {/* Control Panel Modal */}
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
              onLedColorChange={handleLedColorChange}
              onLedPulsFrequenzChange={setLedPulsFrequenz}
              onClose={handleClosePopup}
            />
          </div>
        </div>
      )}

      {/* 3D City Scene fills the whole viewport */}
      <main className="main-content">
        <div className="canvas-wrapper">
          <CityScene3D
            hexPoints={enrichedHexPoints}
            squarePoints={squares}
            lines={lines}
            selectedHex={selectedHexagon}
            selectedSquare={selectedSquare}
            selectedLine={selectedLine}
            onHexClick={handleHexagonClick}
            onSquareClick={handleSquareClick}
            onLineClick={handleLineClick}
            backgroundImage={backgroundImage}
            timeOfDay={timeOfDay}
            weather={weather}
          />
          <SceneControls
            timeOfDay={timeOfDay} weather={weather}
            onTimeChange={setTimeOfDay} onWeatherChange={setWeather}
          />
        </div>
      </main>
    </div>
  );
};

export default Hexagons;
