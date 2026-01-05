import { useState, useEffect } from "react";

const FAVORITES_KEY = "zara_favorite_models";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing favorites:", e);
        setFavorites([]);
      }
    }
  }, []);

  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const toggleFavorite = (modelId: string) => {
    if (favorites.includes(modelId)) {
      saveFavorites(favorites.filter(id => id !== modelId));
    } else {
      saveFavorites([...favorites, modelId]);
    }
  };

  const isFavorite = (modelId: string) => {
    return favorites.includes(modelId);
  };

  const clearFavorites = () => {
    saveFavorites([]);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
}
