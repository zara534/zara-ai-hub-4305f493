import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings, Infinity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function UsageLimitsManager() {
  const [textLimit, setTextLimit] = useState<number | null>(null);
  const [imageLimit, setImageLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      const { data, error } = await supabase
        .from("global_limits")
        .select("*")
        .single();

      if (error) throw error;

      setTextLimit(data.daily_text_limit);
      setImageLimit(data.daily_image_limit);
    } catch (error) {
      console.error("Error loading limits:", error);
      toast.error("Failed to load limits");
    }
  };

  const handleSaveLimits = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("global_limits")
        .update({
          daily_text_limit: textLimit,
          daily_image_limit: imageLimit,
          updated_at: new Date().toISOString()
        })
        .eq("id", (await supabase.from("global_limits").select("id").single()).data?.id);

      if (error) throw error;

      toast.success("Usage limits updated successfully!");
    } catch (error) {
      console.error("Error updating limits:", error);
      toast.error("Failed to update limits");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLimits = async () => {
    setTextLimit(null);
    setImageLimit(null);
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("global_limits")
        .update({
          daily_text_limit: null,
          daily_image_limit: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", (await supabase.from("global_limits").select("id").single()).data?.id);

      if (error) throw error;

      toast.success("Usage limits removed - users have unlimited access!");
    } catch (error) {
      console.error("Error removing limits:", error);
      toast.error("Failed to remove limits");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Settings className="w-6 h-6 text-primary" />
          Manage Daily Usage Limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-limit" className="text-sm font-medium">
              Daily Text Generation Limit
            </Label>
            <div className="flex gap-2">
              <Input
                id="text-limit"
                type="number"
                placeholder="Enter limit or leave empty for unlimited"
                value={textLimit ?? ""}
                onChange={(e) => setTextLimit(e.target.value ? parseInt(e.target.value) : null)}
                min="0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTextLimit(null)}
                title="Set to unlimited"
              >
                <Infinity className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {textLimit === null ? "Currently: Unlimited" : `Currently: ${textLimit} per day`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-limit" className="text-sm font-medium">
              Daily Image Generation Limit
            </Label>
            <div className="flex gap-2">
              <Input
                id="image-limit"
                type="number"
                placeholder="Enter limit or leave empty for unlimited"
                value={imageLimit ?? ""}
                onChange={(e) => setImageLimit(e.target.value ? parseInt(e.target.value) : null)}
                min="0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setImageLimit(null)}
                title="Set to unlimited"
              >
                <Infinity className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {imageLimit === null ? "Currently: Unlimited" : `Currently: ${imageLimit} per day`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSaveLimits} 
            disabled={isLoading}
            className="flex-1"
          >
            Save Limits
          </Button>
          <Button 
            onClick={handleRemoveLimits} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Remove All Limits
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">ℹ️ How it works:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Set limits to control how many texts/images users can generate per day</li>
            <li>• Leave empty or click ∞ for unlimited access</li>
            <li>• Limits reset automatically at midnight UTC</li>
            <li>• All users are affected by these global limits</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
