import React from "react";
import "./Hexagons.css";
import type { HexagonPopupProps } from "./types";


const HexagonPopup: React.FC<HexagonPopupProps> = ({
  selectedHexagon,
  selectedSquare,
  selectedLine,
  power,
  charge,
  time,
  onPowerChange,
  onChargeChange,
  onTimeChange,
  onUpdate,
  onTurnOff,
  onReset,
  getHexagonLabel,
  getSquareLabel,
  getLineLabel,
  getHexagonType,
  // LED-spezifische Props
  ledForward,
  ledColor,
  ledPulsFrequenz,
  onLedForwardChange,
  onLedColorChange,
  onLedPulsFrequenzChange,
  onClose,
}) => {
  // Zeige Popup nur wenn etwas ausgewählt ist
  if (!selectedHexagon && !selectedSquare && !selectedLine) {
    return null;
  }

  // Bestimme ob das ausgewählte Hexagon vom Typ "charging" (TYPE 5) ist
  const isChargingStation = selectedHexagon && getHexagonType 
    ? getHexagonType(getHexagonLabel(selectedHexagon)) === 5 
    : false;

  // Charge-Bereich basierend auf Hexagon-Typ
  const chargeMin = isChargingStation ? -99 : 0;
  const chargeMax = 100;

  const handleUpdate = () => {
    onUpdate();
    onClose();
  };

  const handleTurnOff = () => {
    onTurnOff();
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      console.log("Hexagon:",selectedHexagon);
    }
  };


  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Element Controls</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="popup-info">
          {selectedHexagon && (
            <p>Ausgewähltes Hexagon: {getHexagonLabel(selectedHexagon)}</p>
          )}
          {selectedSquare && getSquareLabel && (
            <p>Ausgewähltes Square: {getSquareLabel()}</p>
          )}
          {selectedLine && getLineLabel && (
            <p>Ausgewählte LED-Linie: {getLineLabel(selectedLine) || 'Ohne Label'}</p>
          )}
        </div>

        <form className="control-form" onSubmit={(e) => e.preventDefault()}>
          {/* LED-spezifische Controls */}
          {selectedLine && (
            <>
              <div className="form-group">
                <label htmlFor="led-toggle">LED Direction:</label>
                <div className="toggle-container">
                  <input
                    type="checkbox"
                    id="led-toggle"
                    checked={ledForward}
                    onChange={(e) => onLedForwardChange?.(e.target.checked)}
                    className="toggle-input"
                  />
                  <label htmlFor="led-toggle" className="toggle-label">
                    <span className="toggle-switch"></span>
                  </label>
                  <span className="toggle-text">{ledForward ? 'Forward' : 'Backward'}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="led-color">LED-Farbe:</label>
                <input
                  type="color"
                  id="led-color"
                  value={ledColor}
                  onChange={(e) => onLedColorChange?.(e.target.value)}
                  className="color-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="led-brightness">Puls-Frequenz (0-5):</label>
                <input
                  type="range"
                  id="led-brightness"
                  min="0"
                  max="5"
                  value={ledPulsFrequenz}
                  onChange={(e) => onLedPulsFrequenzChange?.(Number(e.target.value))}
                  className="range-input"
                />
                <span className="range-value">{ledPulsFrequenz}</span>
              </div>
            </>
          )}

          {/* Standard Controls für Hexagon/Square */}
          {(selectedHexagon || selectedSquare) && (
            <>
              <div className="form-group">
                <label htmlFor="power">Power:</label>
                <input
                  type="range"
                  id="power"
                  min="-100"
                  max="100"
                  value={power}
                  onChange={(e) => onPowerChange(Number(e.target.value))}
                  className="range-input"
                />
                <span className="range-value">{power}</span>
              </div>

              <div className="form-group">
                <label htmlFor="charge">
                  Charge{isChargingStation ? " (-100 bis 100)" : " (0 bis 100)"}:
                </label>
                <input
                  type="range"
                  id="charge"
                  min={chargeMin}
                  max={chargeMax}
                  value={charge}
                  onChange={(e) => onChargeChange(Number(e.target.value))}
                  className="range-input"
                />
                <span className="range-value">{charge}</span>
              </div>

              <div className="form-group">
                <label htmlFor="time">Time:</label>
                <input
                  type="range"
                  id="time"
                  min="0"
                  max="48"
                  value={time}
                  onChange={(e) => onTimeChange(Number(e.target.value))}
                  className="range-input"
                />
                <span className="range-value">{time}</span>
              </div>
            </>
          )}

          <div className="button-group">
            <button
              type="button"
              onClick={handleUpdate}
              className="submit-button"
            >
              Update
            </button>

            <button
              type="button"
              onClick={handleTurnOff}
              className="turnoff-button"
            >
              Turn Off
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="reset-button"
            >
              Stop All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HexagonPopup;
