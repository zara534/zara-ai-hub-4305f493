import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UsageLimitsDisplayProps {
  type: "text" | "image";
  currentUsage: number;
}

export function UsageLimitsDisplay({ type, currentUsage }: UsageLimitsDisplayProps) {
  const [limit, setLimit] = useState<number>(30);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadLimits();
  }, [user]);

  const loadLimits = async () => {
    try {
      const { data, error } = await supabase
        .from("global_limits")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error loading limits:", error);
        return;
      }

      if (data) {
        if (type === "text") {
          setLimit(data.text_limit || 30);
          setIsUnlimited(!data.text_limit_enabled);
        } else {
          setLimit(data.image_limit || 30);
          setIsUnlimited(!data.image_limit_enabled);
        }
      }
    } catch (error) {
      console.error("Error loading limits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (isUnlimited) return null;

  const percentage = Math.min((currentUsage / limit) * 100, 100);
  const remaining = Math.max(limit - currentUsage, 0);
  const isNearLimit = percentage >= 80;

  return (
    <Card className={`border-2 ${isNearLimit ? 'border-orange-500/50' : 'border-primary/20'}`}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isNearLimit ? 'bg-orange-500/10' : 'bg-primary/10'}`}>
            {type === "text" ? (
              <Zap className={`w-5 h-5 ${isNearLimit ? 'text-orange-500' : 'text-primary'}`} />
            ) : (
              <Image className={`w-5 h-5 ${isNearLimit ? 'text-orange-500' : 'text-primary'}`} />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {type === "text" ? "Text Generations" : "Image Generations"}
              </span>
              <span className={`font-bold ${isNearLimit ? 'text-orange-500' : 'text-primary'}`}>
                {remaining} left
              </span>
            </div>
            <div className="space-y-1">
              <Progress 
                value={percentage} 
                className={`h-2 ${isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
              />
              <p className="text-xs text-muted-foreground">
                {currentUsage} / {limit} used today
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
