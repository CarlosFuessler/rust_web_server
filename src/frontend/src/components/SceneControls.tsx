import React from "react";
import "./SceneControls.css";

export type TimeOfDay = "day" | "sunset" | "night";
export type Weather = "clear" | "cloudy" | "rain" | "fog" | "snow";

interface SceneControlsProps {
  timeOfDay: TimeOfDay;
  weather: Weather;
  onTimeChange: (t: TimeOfDay) => void;
  onWeatherChange: (w: Weather) => void;
}

const TIME_LABELS: Record<TimeOfDay, string> = { day: "Day", sunset: "Dusk", night: "Night" };
const WEATHER_LABELS: Record<Weather, string> = { clear: "Clear", cloudy: "Cloudy", rain: "Rain", fog: "Fog", snow: "Snow" };

const SceneControls: React.FC<SceneControlsProps> = ({ timeOfDay, weather, onTimeChange, onWeatherChange }) => (
  <div className="scene-controls">
    <div className="scene-control-group">
      {(["day","sunset","night"] as TimeOfDay[]).map(t=>(
        <button key={t} className={`scene-btn${timeOfDay===t?" active":""}`} onClick={()=>onTimeChange(t)}>
          {TIME_LABELS[t]}
        </button>
      ))}
    </div>
    <div className="scene-control-group">
      {(["clear","cloudy","rain","fog","snow"] as Weather[]).map(w=>(
        <button key={w} className={`scene-btn${weather===w?" active":""}`} onClick={()=>onWeatherChange(w)}>
          {WEATHER_LABELS[w]}
        </button>
      ))}
    </div>
  </div>
);

export default SceneControls;
