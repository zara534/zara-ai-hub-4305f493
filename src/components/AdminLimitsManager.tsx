import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function AdminLimitsManager() {
  const [textLimit, setTextLimit] = useState(30);
  const [imageLimit, setImageLimit] = useState(30);
  const [textLimitEnabled, setTextLimitEnabled] = useState(true);
  const [imageLimitEnabled, setImageLimitEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLimits();
  }, []);

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
        setTextLimit(data.text_limit || 30);
        setImageLimit(data.image_limit || 30);
        setTextLimitEnabled(data.text_limit_enabled ?? true);
        setImageLimitEnabled(data.image_limit_enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading limits:", error);
    }
  };

  const handleSaveLimits = async () => {
    setLoading(true);
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("global_limits")
        .select("*")
        .single();

      const limitsData = {
        text_limit: textLimitEnabled ? textLimit : null,
        image_limit: imageLimitEnabled ? imageLimit : null,
        text_limit_enabled: textLimitEnabled,
        image_limit_enabled: imageLimitEnabled,
        updated_at: new Date().toISOString()
      };

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        const { error } = await supabase
          .from("global_limits")
          .update(limitsData)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("global_limits")
          .insert([{ ...limitsData, id: 1 }]);

        if (error) throw error;
      }

      toast.success("Usage limits updated successfully!");
      loadLimits();
    } catch (error: any) {
      console.error("Error saving limits:", error);
      toast.error("Failed to save limits: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          User Usage Limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="text-limit-enabled" className="text-base font-semibold">
                Text Generation Limits
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable daily limits for text generations
              </p>
            </div>
            <Switch
              id="text-limit-enabled"
              checked={textLimitEnabled}
              onCheckedChange={setTextLimitEnabled}
            />
          </div>

          {textLimitEnabled && (
            <div className="ml-4 space-y-2">
              <Label htmlFor="text-limit">Daily Text Generation Limit</Label>
              <Input
                id="text-limit"
                type="number"
                min="1"
                value={textLimit}
                onChange={(e) => setTextLimit(parseInt(e.target.value) || 30)}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Users can generate up to {textLimit} texts per day
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="image-limit-enabled" className="text-base font-semibold">
                Image Generation Limits
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable daily limits for image generations
              </p>
            </div>
            <Switch
              id="image-limit-enabled"
              checked={imageLimitEnabled}
              onCheckedChange={setImageLimitEnabled}
            />
          </div>

          {imageLimitEnabled && (
            <div className="ml-4 space-y-2">
              <Label htmlFor="image-limit">Daily Image Generation Limit</Label>
              <Input
                id="image-limit"
                type="number"
                min="1"
                value={imageLimit}
                onChange={(e) => setImageLimit(parseInt(e.target.value) || 30)}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Users can generate up to {imageLimit} images per day
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <h4 className="font-semibold">Current Settings:</h4>
          <ul className="text-sm space-y-1">
            <li>
              • Text Generations: {textLimitEnabled ? `${textLimit} per day` : "Unlimited"}
            </li>
            <li>
              • Image Generations: {imageLimitEnabled ? `${imageLimit} per day` : "Unlimited"}
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Limits reset daily at midnight. Users see their remaining generations in real-time.
          </p>
        </div>

        <Button 
          onClick={handleSaveLimits} 
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Usage Limits"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
