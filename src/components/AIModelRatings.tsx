import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AIModelRatingsProps {
  modelId: string;
  modelType: "text" | "image";
}

export function AIModelRatings({ modelId, modelType }: AIModelRatingsProps) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const storageKey = `${modelType}_model_${modelId}_likes`;
  const userLikeKey = `${modelType}_model_${modelId}_user_liked`;

  useEffect(() => {
    const storedLikes = parseInt(localStorage.getItem(storageKey) || "0");
    const userLiked = localStorage.getItem(userLikeKey) === "true";
    setLikes(storedLikes);
    setHasLiked(userLiked);
  }, [storageKey, userLikeKey]);

  const handleLike = () => {
    let newLikes = likes;
    let newHasLiked = !hasLiked;

    if (newHasLiked) {
      newLikes = likes + 1;
      toast.success("Thanks for your feedback!");
    } else {
      newLikes = Math.max(0, likes - 1);
    }

    setLikes(newLikes);
    setHasLiked(newHasLiked);
    localStorage.setItem(storageKey, newLikes.toString());
    localStorage.setItem(userLikeKey, newHasLiked.toString());
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className="gap-1"
    >
      <Heart 
        className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} 
      />
      <span className="text-sm">{likes}</span>
    </Button>
  );
}
