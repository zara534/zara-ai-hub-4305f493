import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Gauge, Crown, Zap, Infinity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface GlobalLimits {
  free_text_limit: number;
  free_image_limit: number;
  pro_text_limit: number;
  pro_image_limit: number;
}

export function UsageLimitsManager() {
  const [limits, setLimits] = useState<GlobalLimits>({
    free_text_limit: 10,
    free_image_limit: 5,
    pro_text_limit: 100,
    pro_image_limit: 50,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      const { data, error } = await supabase
        .from("global_limits")
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLimits({
          free_text_limit: data.free_text_limit ?? 10,
          free_image_limit: data.free_image_limit ?? 5,
          pro_text_limit: data.pro_text_limit ?? 100,
          pro_image_limit: data.pro_image_limit ?? 50,
        });
      }
    } catch (error: any) {
      console.error("Error loading limits:", error);
      // Use defaults if table doesn't have new columns yet
    }
  };

  const handleSaveLimits = async () => {
    setLoading(true);
    try {
      const { data: existingData } = await supabase
        .from("global_limits")
        .select("id")
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("global_limits")
          .update({
            free_text_limit: limits.free_text_limit,
            free_image_limit: limits.free_image_limit,
            pro_text_limit: limits.pro_text_limit,
            pro_image_limit: limits.pro_image_limit,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("global_limits")
          .insert({
            free_text_limit: limits.free_text_limit,
            free_image_limit: limits.free_image_limit,
            pro_text_limit: limits.pro_text_limit,
            pro_image_limit: limits.pro_image_limit,
          });

        if (error) throw error;
      }

      toast.success("Usage limits updated successfully!");
    } catch (error: any) {
      console.error("Error saving limits:", error);
      toast.error(`Failed to save limits: ${error?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Gauge className="w-6 h-6 text-primary" />
          Daily Usage Limits
        </CardTitle>
        <CardDescription>
          Configure daily generation limits for each subscription tier.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Free Tier */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              Free Tier
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="free-text">Text Generations / Day</Label>
              <Input
                id="free-text"
                type="number"
                min="0"
                value={limits.free_text_limit}
                onChange={(e) => setLimits(prev => ({ ...prev, free_text_limit: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="free-image">Image Generations / Day</Label>
              <Input
                id="free-image"
                type="number"
                min="0"
                value={limits.free_image_limit}
                onChange={(e) => setLimits(prev => ({ ...prev, free_image_limit: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="space-y-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <div className="flex items-center gap-2">
            <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown className="w-3 h-3" />
              Pro Tier
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pro-text">Text Generations / Day</Label>
              <Input
                id="pro-text"
                type="number"
                min="0"
                value={limits.pro_text_limit}
                onChange={(e) => setLimits(prev => ({ ...prev, pro_text_limit: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pro-image">Image Generations / Day</Label>
              <Input
                id="pro-image"
                type="number"
                min="0"
                value={limits.pro_image_limit}
                onChange={(e) => setLimits(prev => ({ ...prev, pro_image_limit: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </div>

        {/* Unlimited Tier Info */}
        <div className="flex items-center gap-2 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <Badge className="gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Infinity className="w-3 h-3" />
            Unlimited
          </Badge>
          <span className="text-sm text-muted-foreground">No limits (managed via user subscriptions)</span>
        </div>

        <Button onClick={handleSaveLimits} disabled={loading} className="w-full" size="lg">
          {loading ? "Saving..." : "Save Limits"}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          💡 Admins always have unlimited access. Limits reset daily at midnight UTC.
        </div>
      </CardContent>
    </Card>
  );
}
