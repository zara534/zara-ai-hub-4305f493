import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AIModelRatingsProps {
  modelId: string;
  modelType: "text" | "image";
}

export function AIModelRatings({ modelId, modelType }: AIModelRatingsProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const storageKey = `${modelType}_model_${modelId}_likes`;
  const userLikesKey = `${modelType}_model_likes_by_user`;

  useEffect(() => {
    loadLikes();
  }, [modelId, modelType, user]);

  const loadLikes = () => {
    const allLikes = JSON.parse(localStorage.getItem(userLikesKey) || "{}");
    const modelLikes = allLikes[modelId] || { total: 0, users: [] };
    setLikes(modelLikes.total);
    
    if (user) {
      setHasLiked(modelLikes.users.includes(user.id));
    }
  };

  const handleLike = () => {
    if (!user) {
      toast.error("Please log in to like models");
      return;
    }

    const allLikes = JSON.parse(localStorage.getItem(userLikesKey) || "{}");
    const modelLikes = allLikes[modelId] || { total: 0, users: [] };
    
    const newHasLiked = !hasLiked;
    let newTotal = modelLikes.total;
    let newUsers = [...modelLikes.users];

    if (newHasLiked) {
      if (!newUsers.includes(user.id)) {
        newUsers.push(user.id);
        newTotal++;
        toast.success("Thanks for your feedback!");
      }
    } else {
      newUsers = newUsers.filter(id => id !== user.id);
      newTotal = Math.max(0, newTotal - 1);
    }

    allLikes[modelId] = { total: newTotal, users: newUsers };
    localStorage.setItem(userLikesKey, JSON.stringify(allLikes));
    
    setLikes(newTotal);
    setHasLiked(newHasLiked);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className="gap-1 group"
    >
      <Heart 
        className={`w-4 h-4 transition-all ${hasLiked ? 'fill-primary text-primary' : 'group-hover:text-primary'}`} 
      />
      <span className="text-sm">{likes}</span>
    </Button>
  );
}
