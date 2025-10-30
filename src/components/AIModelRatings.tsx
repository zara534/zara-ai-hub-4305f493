import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AIModelRatingsProps {
  modelId: string;
  modelType: "text" | "image";
}

export function AIModelRatings({ modelId, modelType }: AIModelRatingsProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    loadLikes();
  }, [modelId, modelType, user]);

  const loadLikes = async () => {
    try {
      // Get total likes count
      const { count } = await supabase
        .from("model_likes")
        .select("*", { count: "exact", head: true })
        .eq("model_id", modelId)
        .eq("model_type", modelType);
      
      setLikes(count || 0);

      // Check if current user has liked
      if (user) {
        const { data } = await supabase
          .from("model_likes")
          .select("id")
          .eq("model_id", modelId)
          .eq("model_type", modelType)
          .eq("user_id", user.id)
          .single();
        
        setHasLiked(!!data);
      }
    } catch (error: any) {
      console.error("Error loading likes:", error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like models");
      return;
    }

    try {
      if (hasLiked) {
        // Unlike
        await supabase
          .from("model_likes")
          .delete()
          .eq("model_id", modelId)
          .eq("model_type", modelType)
          .eq("user_id", user.id);
        
        setLikes(prev => Math.max(0, prev - 1));
        setHasLiked(false);
      } else {
        // Like
        await supabase
          .from("model_likes")
          .insert({
            user_id: user.id,
            model_id: modelId,
            model_type: modelType
          });
        
        setLikes(prev => prev + 1);
        setHasLiked(true);
        toast.success("Thanks for your feedback!");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
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
