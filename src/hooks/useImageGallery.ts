import { useState, useEffect } from "react";

export interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  modelName: string;
  createdAt: string;
}

const IMAGE_GALLERY_KEY = "zara_image_gallery";
const MAX_IMAGES = 100;

export function useImageGallery() {
  const [images, setImages] = useState<SavedImage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(IMAGE_GALLERY_KEY);
    if (stored) {
      try {
        setImages(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing image gallery:", e);
        setImages([]);
      }
    }
  }, []);

  const saveImages = (newImages: SavedImage[]) => {
    const trimmed = newImages.slice(0, MAX_IMAGES);
    setImages(trimmed);
    localStorage.setItem(IMAGE_GALLERY_KEY, JSON.stringify(trimmed));
  };

  const addImage = (image: Omit<SavedImage, "id" | "createdAt">) => {
    const newImage: SavedImage = {
      ...image,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    saveImages([newImage, ...images]);
    return newImage;
  };

  const deleteImage = (imageId: string) => {
    saveImages(images.filter(img => img.id !== imageId));
  };

  const clearAllImages = () => {
    saveImages([]);
  };

  return {
    images,
    addImage,
    deleteImage,
    clearAllImages
  };
}
