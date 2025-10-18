import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Image as ImageIcon, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ImageModel {
  id: string;
  name: string;
  apiEndpoint: string;
  description?: string;
  modelType?: string;
  systemPrompt?: string;
}

const DEFAULT_IMAGE_MODELS: ImageModel[] = [
  {
    id: "flux",
    name: "Flux",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "High quality image generation (Default)",
    modelType: "flux"
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Stable Diffusion XL model",
    modelType: "stable-diffusion-xl"
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "OpenAI's DALL-E 3",
    modelType: "dall-e-3"
  },
  {
    id: "playground-v2.5",
    name: "Playground v2.5",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Playground v2.5",
    modelType: "playground-v2.5"
  },
  {
    id: "dpo",
    name: "DPO",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "DPO model",
    modelType: "dpo"
  }
];

export function ImageGeneration() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [usage, setUsage] = useState({ count: 0, limit: null as number | null });
  const { imageModels = DEFAULT_IMAGE_MODELS } = useApp();

  useEffect(() => {
    checkUsage();
  }, [user]);

  const checkUsage = async () => {
    if (!user) return;
    
    try {
      // Get global limits
      const { data: limitsData } = await supabase
        .from("global_limits")
        .select("daily_image_limit")
        .single();

      // Get user usage
      const { data: usageData } = await supabase
        .from("user_usage_limits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Reset if new day
      if (usageData && usageData.last_reset_date !== new Date().toISOString().split('T')[0]) {
        await supabase
          .from("user_usage_limits")
          .update({
            image_count: 0,
            last_reset_date: new Date().toISOString().split('T')[0]
          })
          .eq("user_id", user.id);
        setUsage({ count: 0, limit: limitsData?.daily_image_limit });
      } else {
        setUsage({ 
          count: usageData?.image_count || 0, 
          limit: limitsData?.daily_image_limit 
        });
      }
    } catch (error) {
      console.error("Error checking usage:", error);
    }
  };

  const handleGenerate = async (useLastPrompt: boolean = false) => {
    const currentPrompt = useLastPrompt ? lastPrompt : prompt;
    
    if (!currentPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Check usage limits
    if (usage.limit !== null && usage.count >= usage.limit) {
      toast.error(`Daily limit reached! You can generate ${usage.limit} images per day.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    
    try {
      const model = imageModels.find(m => m.id === selectedModel) || imageModels[0];
      
      // Apply system prompt if available
      const enhancedPrompt = model.systemPrompt 
        ? `${model.systemPrompt}. ${currentPrompt}` 
        : currentPrompt;
      
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const modelType = model.modelType || selectedModel;
      const seed = Date.now(); // Unique seed for each generation
      const imageUrl = `${model.apiEndpoint}/${encodedPrompt}?model=${modelType}&nologo=true&width=1024&height=1024&seed=${seed}`;
      
      // Test if image loads
      const img = new Image();
      img.onload = async () => {
        setGeneratedImage(imageUrl);
        setLastPrompt(currentPrompt);
        if (!useLastPrompt) setPrompt("");
        toast.success("Image generated successfully!");
        
        // Update usage count
        if (user) {
          try {
            const { data: existingUsage } = await supabase
              .from("user_usage_limits")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();

            if (existingUsage) {
              await supabase
                .from("user_usage_limits")
                .update({ image_count: existingUsage.image_count + 1 })
                .eq("user_id", user.id);
            } else {
              await supabase
                .from("user_usage_limits")
                .insert({
                  user_id: user.id,
                  image_count: 1,
                  text_count: 0,
                  last_reset_date: new Date().toISOString().split('T')[0]
                });
            }
            checkUsage();
          } catch (err) {
            console.error("Error updating usage:", err);
          }
        }
      };
      img.onerror = () => {
        setError("Failed to load image. Please try again.");
        toast.error("Failed to generate image");
        setIsLoading(false);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error("Image generation error:", error);
      setError("Failed to generate image. Please try again.");
      toast.error("Failed to generate image");
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-2 md:px-4">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl md:text-2xl">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
              AI Image Generator
            </div>
            {usage.limit !== null && (
              <span className="text-sm font-normal text-muted-foreground">
                {usage.count} / {usage.limit} today
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {imageModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    {model.description && <span className="text-xs text-muted-foreground">- {model.description}</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && !error && handleGenerate(false)}
              disabled={isLoading}
            />
            <Button onClick={() => handleGenerate(false)} disabled={isLoading || !prompt.trim()} size="lg">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </Button>
          </div>

          {lastPrompt && !isLoading && (
            <Button 
              onClick={() => handleGenerate(true)} 
              variant="outline" 
              className="w-full"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reuse Last Prompt: "{lastPrompt.substring(0, 50)}{lastPrompt.length > 50 ? '...' : ''}"
            </Button>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Generating your image...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={() => handleGenerate(false)} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {generatedImage && !isLoading && !error && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border-2">
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="w-full h-auto"
                />
              </div>
              <Button onClick={handleDownload} className="w-full" variant="outline">
                <Download className="w-5 h-5 mr-2" />
                Download Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
