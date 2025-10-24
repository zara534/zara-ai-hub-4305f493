import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Gauge, Infinity, Save } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";
import { toast } from "sonner";

export function RateLimitSettings() {
  const { rateLimits, updateRateLimits } = useApp();
  const [textLimit, setTextLimit] = useState(rateLimits.dailyTextGenerations.toString());
  const [imageLimit, setImageLimit] = useState(rateLimits.dailyImageGenerations.toString());
  const [isUnlimited, setIsUnlimited] = useState(rateLimits.isUnlimited);

  const handleSave = () => {
    const textNum = parseInt(textLimit) || 50;
    const imageNum = parseInt(imageLimit) || 20;
    
    updateRateLimits({
      dailyTextGenerations: textNum,
      dailyImageGenerations: imageNum,
      isUnlimited: isUnlimited,
    });
    
    toast.success("Rate limits updated successfully!");
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Gauge className="w-6 h-6" />
            User Rate Limits
          </CardTitle>
          <CardDescription>
            Control how many times users can generate content per day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unlimited Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-2">
            <div className="flex items-center gap-3">
              <Infinity className="w-6 h-6 text-primary" />
              <div>
                <Label className="text-base font-semibold">Unlimited Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to generate unlimited content per day
                </p>
              </div>
            </div>
            <Switch
              checked={isUnlimited}
              onCheckedChange={setIsUnlimited}
              data-testid="switch-unlimited"
            />
          </div>

          {/* Text Generation Limit */}
          <div className="space-y-2">
            <Label className="text-base">
              Daily Text Generations
            </Label>
            <Input
              type="number"
              min="1"
              max="10000"
              value={textLimit}
              onChange={(e) => setTextLimit(e.target.value)}
              disabled={isUnlimited}
              className="text-lg"
              data-testid="input-text-limit"
            />
            <p className="text-xs text-muted-foreground">
              {isUnlimited 
                ? "Currently set to unlimited" 
                : `Users can send ${textLimit} AI chat messages per day`}
            </p>
          </div>

          {/* Image Generation Limit */}
          <div className="space-y-2">
            <Label className="text-base">
              Daily Image Generations
            </Label>
            <Input
              type="number"
              min="1"
              max="1000"
              value={imageLimit}
              onChange={(e) => setImageLimit(e.target.value)}
              disabled={isUnlimited}
              className="text-lg"
              data-testid="input-image-limit"
            />
            <p className="text-xs text-muted-foreground">
              {isUnlimited 
                ? "Currently set to unlimited" 
                : `Users can generate ${imageLimit} images per day`}
            </p>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            className="w-full" 
            size="lg"
            data-testid="button-save-limits"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Rate Limits
          </Button>

          {/* Current Status */}
          <div className="p-4 bg-primary/5 rounded-lg border">
            <h4 className="font-semibold mb-2">Current Limits:</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <span className="font-medium">Text Generations:</span>{" "}
                {isUnlimited ? "Unlimited" : `${textLimit} per day`}
              </li>
              <li>
                <span className="font-medium">Image Generations:</span>{" "}
                {isUnlimited ? "Unlimited" : `${imageLimit} per day`}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
