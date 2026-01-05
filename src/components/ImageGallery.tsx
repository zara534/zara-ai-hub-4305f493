import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Trash2, Image as ImageIcon, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useImageGallery, SavedImage } from "@/hooks/useImageGallery";
import { toast } from "sonner";

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGallery({ isOpen, onClose }: ImageGalleryProps) {
  const { images, deleteImage, clearAllImages } = useImageGallery();
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);

  const handleDownload = async (image: SavedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zara-ai-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleShare = async (image: SavedImage) => {
    if (navigator.share) {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const file = new File([blob], `zara-ai-${image.id}.png`, { type: "image/png" });
        
        await navigator.share({
          title: "AI Generated Image",
          text: image.prompt,
          files: [file]
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          // Fallback to copying URL
          await navigator.clipboard.writeText(image.url);
          toast.success("Image URL copied to clipboard!");
        }
      }
    } else {
      // Fallback for browsers without share API
      await navigator.clipboard.writeText(image.url);
      toast.success("Image URL copied to clipboard!");
    }
  };

  const handleDelete = (imageId: string) => {
    deleteImage(imageId);
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
    toast.success("Image deleted");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-full max-w-md bg-background border-r border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Image Gallery</h2>
                <span className="text-xs text-muted-foreground">({images.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {images.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete all saved images?")) {
                        clearAllImages();
                        toast.success("Gallery cleared");
                      }
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <p>No saved images yet</p>
                  <p className="text-sm">Generate images to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-4">
                  {images.map((image) => (
                    <motion.div
                      key={image.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group rounded-lg overflow-hidden border border-border bg-card"
                    >
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full aspect-square object-cover cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-white text-xs line-clamp-2 mb-1">{image.prompt}</p>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-white hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image);
                              }}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-white hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(image);
                              }}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-white hover:bg-red-500/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(image.id);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Image Preview Modal */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 flex flex-col z-50"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedImage.createdAt)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.prompt}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                  
                  <div className="p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-white/90 text-sm">{selectedImage.prompt}</p>
                    </div>
                    <p className="text-white/50 text-xs">{selectedImage.modelName}</p>
                    
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleDownload(selectedImage)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleShare(selectedImage)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
