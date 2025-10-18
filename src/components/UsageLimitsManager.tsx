import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Gauge, Infinity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function UsageLimitsManager() {
  const [textLimit, setTextLimit] = useState<number | null>(null);
  const [imageLimit, setImageLimit] = useState<number | null>(null);
  const [textLimitEnabled, setTextLimitEnabled] = useState(false);
  const [imageLimitEnabled, setImageLimitEnabled] = useState(false);
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
        setTextLimit(data.text_generation_limit);
        setImageLimit(data.image_generation_limit);
        setTextLimitEnabled(data.text_generation_limit !== null);
        setImageLimitEnabled(data.image_generation_limit !== null);
      }
    } catch (error: any) {
      console.error("Error loading limits:", error);
      const msg = String(error?.message || "");
      if (msg.includes("global_limits") || msg.includes("relation") || error?.code === "42P01") {
        const local = localStorage.getItem("global_limits_local");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setTextLimit(parsed.text_generation_limit ?? null);
            setImageLimit(parsed.image_generation_limit ?? null);
            setTextLimitEnabled(parsed.text_generation_limit !== null);
            setImageLimitEnabled(parsed.image_generation_limit !== null);
            toast.info("Using local limits (database not set up)");
          } catch {}
        } else {
          toast.error("Database setup required: create global_limits (see DATABASE_SETUP.md)");
        }
      } else {
        toast.error("Failed to load limits");
      }
    }
  };

  const handleSaveLimits = async () => {
    setLoading(true);
    try {
      // Check if a record exists
      const { data: existingData } = await supabase
        .from("global_limits")
        .select("id")
        .maybeSingle();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("global_limits")
          .update({
            text_generation_limit: textLimitEnabled ? textLimit : null,
            image_generation_limit: imageLimitEnabled ? imageLimit : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("global_limits")
          .insert({
            text_generation_limit: textLimitEnabled ? textLimit : null,
            image_generation_limit: imageLimitEnabled ? imageLimit : null,
          });

        if (error) throw error;
      }

      toast.success("Usage limits updated successfully!");
      await loadLimits(); // Reload to get the latest data
    } catch (error: any) {
      console.error("Error saving limits:", error);
      const msg = String(error?.message || "");
      if (msg.includes("global_limits") || msg.includes("relation") || error?.code === "42P01") {
        const fallback = {
          text_generation_limit: textLimitEnabled ? textLimit : null,
          image_generation_limit: imageLimitEnabled ? imageLimit : null,
        };
        localStorage.setItem("global_limits_local", JSON.stringify(fallback));
        setTextLimit(fallback.text_generation_limit);
        setImageLimit(fallback.image_generation_limit);
        setTextLimitEnabled(fallback.text_generation_limit !== null);
        setImageLimitEnabled(fallback.image_generation_limit !== null);
        toast.success("Saved locally (DB not set up). Run DATABASE_SETUP.md to enable shared limits.");
      } else {
        toast.error(`Failed to save limits: ${error?.message || "Unknown error"}`);
      }
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
          Set daily generation limits for all users. Leave disabled for unlimited usage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="text-limit-toggle" className="text-base font-medium">
                Text Generation Limit
              </Label>
              <p className="text-sm text-muted-foreground">
                {textLimitEnabled ? `${textLimit || 0} generations per day` : "Unlimited"}
              </p>
            </div>
            <Switch
              id="text-limit-toggle"
              checked={textLimitEnabled}
              onCheckedChange={setTextLimitEnabled}
            />
          </div>

          {textLimitEnabled && (
            <div className="space-y-2 pl-4">
              <Label htmlFor="text-limit">Generations per day</Label>
              <Input
                id="text-limit"
                type="number"
                min="0"
                value={textLimit || ""}
                onChange={(e) => setTextLimit(parseInt(e.target.value) || 0)}
                placeholder="e.g., 50"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="image-limit-toggle" className="text-base font-medium">
                Image Generation Limit
              </Label>
              <p className="text-sm text-muted-foreground">
                {imageLimitEnabled ? `${imageLimit || 0} generations per day` : "Unlimited"}
              </p>
            </div>
            <Switch
              id="image-limit-toggle"
              checked={imageLimitEnabled}
              onCheckedChange={setImageLimitEnabled}
            />
          </div>

          {imageLimitEnabled && (
            <div className="space-y-2 pl-4">
              <Label htmlFor="image-limit">Generations per day</Label>
              <Input
                id="image-limit"
                type="number"
                min="0"
                value={imageLimit || ""}
                onChange={(e) => setImageLimit(parseInt(e.target.value) || 0)}
                placeholder="e.g., 20"
              />
            </div>
          )}
        </div>

        <Button onClick={handleSaveLimits} disabled={loading} className="w-full" size="lg">
          {loading ? "Saving..." : "Save Limits"}
        </Button>

        <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <Infinity className="w-5 h-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Limits reset daily at midnight UTC. Users will see their remaining generations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
