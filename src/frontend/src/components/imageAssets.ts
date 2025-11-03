// Import der Bilder
import batteryBolt from '../assets/batterybolt-neo-mediumorchid-symbol-classic-solid.png';
import chargingStation from '../assets/chargingstation-neo-mediumorchid-symbol-classic-solid.png';
import industry from '../assets/industry-neo-mediumorchid-symbol-classic-solid.png';
import solarPanel from '../assets/solarpanel-neo-mediumorchid-symbol-classic-solid.png';
import tankWater from '../assets/tankwater-neo-mediumorchid-symbol-classic-solid.png';
import windTurbine from '../assets/windturbine-neo-mediumorchid-symbol-classic-solid.png';

// Interface für ein Asset
export interface ImageAsset {
  id: string;
  image: string;
  text: string;
  description?: string;
}

// Asset-Objekt mit ID, Bild und Text
export const imageAssets: Record<string, ImageAsset> = {
  battery: {
    id: 'battery',
    image: batteryBolt,
    text: 'Batterie',
    description: 'Energiespeicher'
  },
  charging: {
    id: 'charging',
    image: chargingStation,
    text: 'Ladestation',
    description: 'Elektrofahrzeug Ladestation'
  },
  industry: {
    id: 'industry',
    image: industry,
    text: 'Industrie',
    description: 'Industrieller Verbraucher'
  },
  solar: {
    id: 'solar',
    image: solarPanel,
    text: 'Solaranlage',
    description: 'Photovoltaik-Anlage'
  },
  water: {
    id: 'water',
    image: tankWater,
    text: 'Wassertank',
    description: 'Wasserspeicher'
  },
  wind: {
    id: 'wind',
    image: windTurbine,
    text: 'Windrad',
    description: 'Windkraftanlage'
  }
};

// Hilfsfunktionen
export const getImageAsset = (id: string): ImageAsset | undefined => {
  return imageAssets[id];
};

export const getAllImageAssets = (): ImageAsset[] => {
  return Object.values(imageAssets);
};

export const getImageAssetIds = (): string[] => {
  return Object.keys(imageAssets);
};

// Funktion zum Abrufen eines zufälligen Assets
export const getRandomImageAsset = (): ImageAsset => {
  const ids = getImageAssetIds();
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  return imageAssets[randomId];
};
