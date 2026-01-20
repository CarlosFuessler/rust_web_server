import React from "react";
import "./ControlPanel.css";
import type { ControlPanelProps } from "./types";

const ControlPanel: React.FC<ControlPanelProps> = ({
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
  ledForward,
  ledColor,
  ledPulsFrequenz,
  onLedForwardChange,
  onLedColorChange,
  onLedPulsFrequenzChange,
}) => {
  const hasSelection = selectedHexagon || selectedSquare || selectedLine;

  const isChargingStation = selectedHexagon && getHexagonType 
    ? getHexagonType?.(getHexagonLabel(selectedHexagon)) === 5 
    : false;

  const chargeMin = isChargingStation ? -99 : 0;
  const chargeMax = 100;

  // Get selection info
  const getSelectionType = () => {
    if (selectedHexagon) return "Hexagon";
    if (selectedSquare) return "Haushalt";
    if (selectedLine) return "LED Linie";
    return "";
  };

  const getSelectionId = () => {
    if (selectedHexagon) return getHexagonLabel(selectedHexagon);
    if (selectedSquare) return getSquareLabel?.() ?? "";
    if (selectedLine) return getLineLabel?.(selectedLine) ?? "";
    return "";
  };

  // Empty State
  if (!hasSelection) {
    return (
      <div className="control-panel">
        <div className="empty-state-panel">
          <div className="pulse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(59, 130, 246, 0.2)"/>
            </svg>
          </div>
          <h3>Stromnetz Steuerung</h3>
          <p>Wähle ein Modul, eine Verbindung oder einen Haushalt aus, um das Netzwerk zu steuern.</p>
          <div className="quick-actions">
            <button type="button" onClick={onReset} className="quick-action-btn danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="control-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-info">
          <span className="panel-header-type">{getSelectionType()}</span>
          <h3>#{getSelectionId()}</h3>
        </div>
        <div className="panel-status">Aktiv</div>
      </div>

      <form className="panel-form" onSubmit={(e) => e.preventDefault()}>
        {/* LED Controls */}
        {selectedLine && (
          <div className="control-section led-section">
            <div className="section-header">
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
              <h3>LED Steuerung</h3>
            </div>
            
            {/* Color Picker - Prominent */}
            <div className="led-color-control">
              <label>LED Farbe</label>
              <div className="color-preview-wrapper">
                <input
                  type="color"
                  value={ledColor ?? "#ffffff"}
                  onChange={(e) => onLedColorChange?.(e.target.value)}
                  className="color-picker-input"
                />
                <div className="color-preview" style={{ backgroundColor: ledColor ?? "#ffffff" }}>
                  <div className="color-glow" style={{ boxShadow: `0 0 20px ${ledColor ?? "#ffffff"}` }}></div>
                </div>
                <span className="color-hex">{(ledColor ?? "#ffffff").toUpperCase()}</span>
              </div>
            </div>

            {/* Direction & Frequency Row */}
            <div className="control-row">
              <div className="control-item">
                <label>Richtung</label>
                <div className="direction-toggle">
                  <button
                    type="button"
                    className={`direction-btn ${ledForward ? 'active' : ''}`}
                    onClick={() => onLedForwardChange?.(true)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`direction-btn ${!ledForward ? 'active' : ''}`}
                    onClick={() => onLedForwardChange?.(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="control-item">
                <label>Frequenz <span className="value-badge">{ledPulsFrequenz ?? 0} Hz</span></label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={ledPulsFrequenz ?? 0}
                  onChange={(e) => onLedPulsFrequenzChange?.(Number(e.target.value))}
                  className="frequency-slider"
                  style={{
                    background: `linear-gradient(to right, ${ledColor} 0%, ${ledColor} ${((ledPulsFrequenz ?? 0) / 5) * 100}%, rgba(255,255,255,0.1) ${((ledPulsFrequenz ?? 0) / 5) * 100}%)`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Power Controls for Hexagons */}
        {selectedHexagon && (
          <div className="control-section power-section">
            <div className="section-header">
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <h3>Strom-Einstellungen</h3>
            </div>

            {/* Power */}
            <div className="param-control">
              <div className="param-header">
                <span>Leistung</span>
                <span className={`param-value ${power > 0 ? 'positive' : power < 0 ? 'negative' : ''}`}>
                  {power > 0 ? "+" : ""}{power}%
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={power}
                onChange={(e) => onPowerChange(Number(e.target.value))}
                className="power-slider"
              />
              <div className="param-labels">
                <span>Verbrauch</span>
                <span>0</span>
                <span>Erzeugung</span>
              </div>
            </div>

            {/* Charge */}
            <div className="param-control">
              <div className="param-header">
                <span>Ladung</span>
                <span className="param-value">{charge}%</span>
              </div>
              <input
                type="range"
                min={chargeMin}
                max={chargeMax}
                value={charge}
                onChange={(e) => onChargeChange(Number(e.target.value))}
                className="charge-slider"
              />
              <div className="param-labels">
                <span>{chargeMin}%</span>
                <span>{chargeMax}%</span>
              </div>
            </div>

            {/* Time */}
            <div className="param-control">
              <div className="param-header">
                <span>Zeit</span>
                <span className="param-value">{time}h</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={time}
                onChange={(e) => onTimeChange(Number(e.target.value))}
                className="time-slider"
              />
              <div className="param-labels">
                <span>0h</span>
                <span>12h</span>
                <span>24h</span>
              </div>
            </div>
          </div>
        )}

        {/* Square Controls */}
        {selectedSquare && (
          <div className="control-section power-section">
            <div className="section-header">
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              <h3>Haushalt</h3>
            </div>

            {/* Power */}
            <div className="param-control">
              <div className="param-header">
                <span>Verbrauch</span>
                <span className="param-value negative">{Math.abs(power)}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="0"
                value={power}
                onChange={(e) => onPowerChange(Number(e.target.value))}
                className="power-slider household"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-panel">
          <button type="button" onClick={onUpdate} className="action-btn primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Anwenden
          </button>
          <button type="button" onClick={onTurnOff} className="action-btn secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Ausschalten
          </button>
        </div>
      </form>
    </div>
  );
};

export default ControlPanel;
