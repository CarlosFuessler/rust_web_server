import React, { useState, useEffect } from "react";
import "./Hexagons.css";
import HexagonPopup from "./HexagonPopup";
import Hexagon from "./Hexagon";
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
  /*calculateLineLabelPosition,*/
  calculateGridDimensions,
  generateHexagonPoints,
  calculateHexagonLines,
  calculateHouseHoldPoints,
} from "./hexagonUtils";
import { getImageAsset } from "./imageAssets";

const Hexagons: React.FC = () => {
  const [selectedHexagon, setSelectedHexagon] = useState<HexagonPoint | null>(
    null
  );
  const [selectedSquare, setSelectedSquare] = useState<SquarePoint | null>(
    null
  );
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

  // 5-Sekunden-Timer für Position-Updates
  useEffect(() => {
    const fetchPositions = async () => {
      // Erste Scan-Abfrage
      const result = await hexagonService.getPositions();
      
      if (result.success && result.result?.data) {
        setArduinoConnected(true);
        setPositionData(result.result.data);
        setLastUpdate(new Date());
      } else {
          setArduinoConnected(true);
      }
    };


    // Dann alle 5 Sekunden - läuft kontinuierlich unabhängig vom Connection-Status
    const interval = setInterval(fetchPositions, 5000);

    // Cleanup beim Unmount
    return () => clearInterval(interval);
  }, );

  // Funktion um das Hintergrundbild für ein Hexagon basierend auf Position-Daten zu bestimmen
  const getHexagonBackgroundImage = (
    hexagonNumber: string
  ): string | undefined => {
    const eeprom = parseInt(hexagonNumber);
    const position = positionData.find((pos) => pos.EEPROM === eeprom);

    if (position && TYPE_TO_ASSET[position.TYPE]) {
      const assetId = TYPE_TO_ASSET[position.TYPE];
      const asset = getImageAsset(assetId);
      return asset?.image;
    }

    return undefined;
  };

  // Funktion um den TYPE eines Hexagons zu bestimmen
  const getHexagonType = (hexagonNumber: string): number | undefined => {
    const eeprom = parseInt(hexagonNumber);
    const position = positionData.find((pos) => pos.EEPROM === eeprom);
    return position?.TYPE;
  };

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

  // Berechne Gitter-Dimensionen mit zusätzlichem Platz für Quadrate
  const { svgWidth, svgHeight, offsetX, offsetY, xSpacing, ySpacing } =
    calculateGridDimensions(hexRadius, cols, rows, padding, squareOffset);

  // Berechne Quadrat-Positionen
  const squares = calculateHouseHoldPoints(
    squareSize,
    squareYSpacing,
    squarexSpacing,
    squareRows,
    squareCols
  );

  // Generiere Hexagon-Positionen
  const points = generateHexagonPoints(
    cols,
    rows,
    offsetX,
    offsetY,
    xSpacing,
    ySpacing
  );

  // Berechne Verbindungslinien
  const lines = calculateHexagonLines(points, cols, rows, xSpacing, ySpacing);

  // Map für schnellen Zugriff
  const pointMap = new Map<string, HexagonPoint>();
  points.forEach((p) => pointMap.set(`${p.row},${p.col}`, p));

  const handleHexagonClick = (point: HexagonPoint) => {
    setSelectedHexagon(point);
    setSelectedSquare(null); // Deselect squares when selecting hexagon
    setSelectedLine(null);
  };

  const handleSquareClick = (square: SquarePoint) => {
    setSelectedSquare(square);
    setSelectedHexagon(null); // Deselect hexagons when selecting square
    setSelectedLine(null);
  };

  const handleLineClick = (line: LineData) => {
    setSelectedLine(line);
    setSelectedHexagon(null);
    setSelectedSquare(null);
  };

  const handleSendSubmit = async () => {
    if (selectedHexagon) {
      const hexagonLabel = getHexagonLabel(selectedHexagon);
      const result = await hexagonService.sendUpdate(
        hexagonLabel,
        power,
        charge,
        time
      );
      if (!result.success) {
        // Hier könnte man Error-Handling hinzufügen
        console.error("Update failed:", result.error);
      }
    } else if (selectedSquare) {
      const squareLabel = getSquareLabel();
      const result = await hexagonService.sendUpdate(
        squareLabel,
        power,
        charge,
        time
      );
      if (!result.success) {
        console.error("Update failed:", result.error);
      }
    } else if (selectedLine) {
      const lineLabel = getLineLabel(selectedLine);
      if (lineLabel) {
        const lineLabelString = String(lineLabel); // Konvertiere zu String falls es eine Nummer ist
        const result = await hexagonService.sendLineUpdate(
          lineLabelString,
          ledForward,
          ledColor,
          ledPulsFrequenz
        );
        if (!result.success) {
          console.error("Line update failed:", result.error);
        }
      } else {
        console.log("Selected line has no label");
      }
    } else {
      console.log("No hexagon, square, or line selected");
    }
  };

  const handleTurnOff = async () => {
    if (selectedHexagon) {
      const hexagonLabel = getHexagonLabel(selectedHexagon);
      const result = await hexagonService.sendTurnOff(hexagonLabel);
      if (!result.success) {
        console.error("Turn off failed:", result.error);
      }
    } else if (selectedSquare) {
      const squareLabel = getSquareLabel();
      const result = await hexagonService.sendTurnOff(squareLabel);
      if (!result.success) {
        console.error("Turn off failed:", result.error);
      }
    } else if (selectedLine) {
      const lineLabel = getLineLabel(selectedLine);
      if (lineLabel) {
        const lineLabelString = String(lineLabel);
        const result = await hexagonService.sendLineTurnOff(lineLabelString);
        if (!result.success) {
          console.error("Line turn off failed:", result.error);
        }
      } else {
        console.log("Selected line has no label");
      }
    } else {
      console.log("No hexagon, square, or line selected");
    }
  };

  const handleReset = async () => {
    const result = await hexagonService.sendTurnOff();
    if (!result.success) {
      console.error("Reset failed:", result.error);
    }
  };

  const handleClosePopup = () => {
    setSelectedHexagon(null);
    setSelectedSquare(null);
    setSelectedLine(null);
  };

  return (
    <>
      {!arduinoConnected && (
        <div className="arduino-info">
          <div className="info">
            <h3>Arduino nicht verbunden</h3>
            <p>
              Der Server hat keine Verbindung zum Arduino. Bitte überprüfen Sie
              die Verbindung und versuchen Sie es erneut.
            </p>
            <button
              className="retry-button"
              onClick={() => setArduinoConnected(true)}
            >
              Verbindung wiederherstellen
            </button>
          </div>
        </div>
      )}
      <div className="hexagons-container">
        <div className="controls">
          <span className="info">
            Hexagon-Gitter: {rows} Reihen × {cols} Spalten
          </span>
          {lastUpdate && (
            <span className="info">
              Letztes Update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <span className="info">Aktive Positionen: {positionData.length}</span>
          {selectedHexagon && (
            <span className="selected-info">
              Ausgewählt: {getHexagonLabel(selectedHexagon)}
            </span>
          )}
          {selectedSquare && (
            <span className="selected-info">
              Ausgewählt: {getSquareLabel()}
            </span>
          )}
          {selectedLine && (
            <span className="selected-info">
              Ausgewählt: Linie {getLineLabel(selectedLine)}
            </span>
          )}
        </div>

        <div className="main-content">
          <div className="canvas-container full-width">
            <svg width={svgWidth} height={svgHeight} className="hexagon-canvas">
              {/* Gitter-Hintergrund */}
              <defs>
                <pattern
                  id="grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Verbindungslinien */}
              <g className="lines">
                {lines.map((line, index) => (
                  <g key={index}>
                    <line
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      className={`hexline ${
                        selectedLine === line ? "selected-line" : ""
                      }`}
                      onClick={() => handleLineClick(line)}
                      style={{ cursor: "pointer" }}
                    />
                    {/* Lienen label für debugging 
                     {getLineLabel(line) && (
                      <text
                        x={calculateLineLabelPosition(line, "middle").x}
                        y={calculateLineLabelPosition(line, "middle").y}
                        className="line-label"
                        textAnchor="middle"
                        dominantBaseline="central"
                        onClick={() => handleLineClick(line)}
                        style={{ cursor: "pointer" }}
                      >
                        {getLineLabel(line)}
                      </text>
                    )} */}
                  </g>
                ))}
              </g>

              {/* Linke Quadrate */}
              <g className="squares">
                {squares.map((square) => (
                  <rect
                    key={`square-${square.index}`}
                    x={square.x}
                    y={square.y}
                    width={square.width}
                    height={square.height}
                    className={`left-square ${
                      selectedSquare ? "square-selected" : ""
                    }`}
                    onClick={() => handleSquareClick(square)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </g>

              {/* Hexagone */}
              <g className="hexagons">
                {points.map((point) => {
                  const hexagonLabel = getHexagonLabel(point);
                  const backgroundImage =
                    getHexagonBackgroundImage(hexagonLabel);

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
                      backgroundImage={backgroundImage}
                    />
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        <div className="instructions">
          <p>
            Klicke auf ein Hexagon, Square, oder eine Linie um sie auszuwählen
            und die Steuerelemente zu verwenden!
          </p>

          {/* Debug-Anzeige der aktuellen Positionen */}
          {positionData.length > 0 && (
            <details style={{ marginTop: "10px" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                Debug: Aktuelle Positionen ({positionData.length})
              </summary>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "5px",
                  marginTop: "5px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#333",
                }}
              >
                {positionData.map((pos, index) => {
                  const assetId = TYPE_TO_ASSET[pos.TYPE];
                  return (
                    <div key={index} style={{ marginBottom: "5px" }}>
                      EEPROM: {pos.EEPROM}, TYPE: {pos.TYPE} ({assetId}), I2C:{" "}
                      {pos.I2C}
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>

        <HexagonPopup
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
          // LED-spezifische Props
          ledForward={ledForward}
          ledColor={ledColor}
          ledPulsFrequenz={ledPulsFrequenz}
          onLedForwardChange={setLedForward}
          onLedColorChange={setLedColor}
          onLedPulsFrequenzChange={setLedPulsFrequenz}
          onClose={handleClosePopup}
        />
      </div>
    </>
  );
};

export default Hexagons;
