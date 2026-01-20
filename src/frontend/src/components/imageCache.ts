// Image Caching System - Verhindert Flackern durch stabiles Caching

// In-Memory Cache für Bilder
const imageCache = new Map<string, string>();

// Preload Cache mit statischen Imports
export const initializeImageCache = (assets: Record<string, { image: string }>) => {
  Object.entries(assets).forEach(([key, asset]) => {
    if (asset.image) {
      imageCache.set(key, asset.image);
      console.log(`✅ Cache initialized: ${key}`);
    }
  });
};

// Get cached image
export const getCachedImage = (key: string): string | undefined => {
  const cached = imageCache.get(key);
  if (cached) {
    console.log(`♻️ Cache hit: ${key}`);
    return cached;
  }
  console.warn(`⚠️ Cache miss: ${key}`);
  return undefined;
};

// Set image in cache
export const setCacheImage = (key: string, imageUrl: string) => {
  if (!imageCache.has(key)) {
    imageCache.set(key, imageUrl);
    console.log(`📝 Cached image: ${key}`);
  }
};

// Get cache size
export const getCacheSize = (): number => imageCache.size;

// Get cache stats
export const getCacheStats = () => {
  const stats = {
    size: imageCache.size,
    keys: Array.from(imageCache.keys())
  };
  console.log('📊 Cache Stats:', stats);
  return stats;
};

// Clear cache (if needed)
export const clearImageCache = () => {
  imageCache.clear();
  console.log('🗑️ Image cache cleared');
};

// Preload images for faster rendering
export const preloadImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    img.onload = () => console.log(`✅ Preloaded: ${url}`);
    img.onerror = () => console.warn(`⚠️ Failed to preload: ${url}`);
  });
};
