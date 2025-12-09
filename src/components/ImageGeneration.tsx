import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Image as ImageIcon, Copy, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AIModelRatings } from "./AIModelRatings";

interface ImageModel {
  id: string;
  name: string;
  emoji?: string;
  apiEndpoint: string;
  description?: string;
  modelType?: string;
  systemPrompt?: string;
  examplePrompts?: string[];
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

const DEFAULT_IMAGE_MODELS: ImageModel[] = [
  {
    id: "flux",
    name: "Flux",
    emoji: "⚡",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "High quality image generation (Default)",
    modelType: "flux",
    examplePrompts: ["A beautiful sunset over mountains", "A cute cat wearing sunglasses"]
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    emoji: "🎨",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Stable Diffusion XL model",
    modelType: "stable-diffusion-xl",
    examplePrompts: ["Abstract art with vibrant colors", "Fantasy landscape with dragons"]
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    emoji: "🖼️",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "OpenAI's DALL-E 3",
    modelType: "dall-e-3",
    examplePrompts: ["Photorealistic portrait of a person", "Modern architecture building"]
  },
  {
    id: "playground-v2.5",
    name: "Playground v2.5",
    emoji: "🎪",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Playground v2.5",
    modelType: "playground-v2.5",
    examplePrompts: ["Cartoon character design", "Sci-fi spaceship concept art"]
  },
  {
    id: "dpo",
    name: "DPO",
    emoji: "🚀",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "DPO model",
    modelType: "dpo",
    examplePrompts: ["Logo design for tech startup", "Minimalist poster design"]
  }
];

export function ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("flux");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [currentModelName, setCurrentModelName] = useState("Flux");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const { imageModels = DEFAULT_IMAGE_MODELS, rateLimits } = useApp();
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadUsage();
  }, [user]);

  const loadUsage = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("user_usage")
        .select("image_generations")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .single();
      
      if (data) {
        setUsageCount(data.image_generations);
      }
    } catch (error) {
      console.error("Error loading usage:", error);
    }
  };

  const incrementUsage = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .single();

      if (existing) {
        await supabase
          .from("user_usage")
          .update({ 
            image_generations: existing.image_generations + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
        setUsageCount(existing.image_generations + 1);
      } else {
        await supabase
          .from("user_usage")
          .insert({ 
            user_id: user.id,
            usage_date: today,
            text_generations: 0,
            image_generations: 1
          });
        setUsageCount(1);
      }
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }
  };

  const getImageDimensions = (ratio: string) => {
    const dimensions: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1024, height: 576 },
      "9:16": { width: 576, height: 1024 },
      "4:3": { width: 1024, height: 768 },
      "3:4": { width: 768, height: 1024 },
    };
    return dimensions[ratio] || dimensions["1:1"];
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Check rate limits
    if (!rateLimits.isUnlimited && usageCount >= rateLimits.dailyImageGenerations) {
      toast.error(`Daily limit reached! You can generate ${rateLimits.dailyImageGenerations} images per day. Current usage: ${usageCount}/${rateLimits.dailyImageGenerations}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const model = imageModels.find(m => m.id === selectedModel) || imageModels[0];
      
      // Enhanced quality prompt for better human/image generation
      const qualityEnhancers = "ultra high quality, 8K resolution, highly detailed, sharp focus, professional photography, perfect lighting, masterpiece, best quality, extremely detailed face, perfect anatomy, photorealistic";
      
      const basePrompt = model.systemPrompt 
        ? `${model.systemPrompt} ${prompt}` 
        : prompt;
      
      // Add quality enhancers to the prompt
      const fullPrompt = `${basePrompt}, ${qualityEnhancers}`;
      
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const modelType = model.modelType || "flux-realism";
      const seed = Date.now();
      const { width, height } = getImageDimensions(aspectRatio);
      const imageUrl = `${model.apiEndpoint}/${encodedPrompt}?model=${modelType}&nologo=true&width=${width}&height=${height}&seed=${seed}&enhance=true`;
      
      // Test if image loads successfully
      const img = new Image();
      img.onload = () => {
        if (abortControllerRef.current?.signal.aborted) return;
        
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: prompt,
          timestamp: Date.now()
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        incrementUsage();
        toast.success("Image generated successfully!");
        setIsLoading(false);
      };
      img.onerror = () => {
        if (abortControllerRef.current?.signal.aborted) return;
        setError("Failed to load image. Please try again.");
        toast.error("Failed to generate image");
        setIsLoading(false);
      };
      img.src = imageUrl;
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) return;
      console.error("Image generation error:", error);
      setError("Failed to generate image. Please try again.");
      toast.error("Failed to generate image");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    toast.info("Generation cancelled");
  };

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    toast.success("Prompt copied to clipboard!");
  };

  const handleDownload = async (imageUrl: string, promptText: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${promptText.slice(0, 30)}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleDeleteImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
    toast.success("Image removed");
  };

  const handleExamplePromptClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    toast.success("Example prompt loaded!");
  };

  const selectedModelData = imageModels.find(m => m.id === selectedModel);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              ZARA AI HUB
            </span>
            <AIModelRatings modelId={selectedModel} modelType="image" />
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {selectedModelData?.description || "Generate stunning images with AI"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedModel} onValueChange={(value) => {
              const model = imageModels.find(m => m.id === value);
              setSelectedModel(value);
              setCurrentModelName(model?.name || "");
              toast.success(`Switched to ${model?.name || 'Image Generator'}`);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {imageModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      {model.emoji && <span className="text-lg">{model.emoji}</span>}
                      <span>{model.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger>
                <SelectValue placeholder="Select aspect ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">Square (1:1)</SelectItem>
                <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                <SelectItem value="4:3">Classic (4:3)</SelectItem>
                <SelectItem value="3:4">Portrait (3:4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedModelData?.examplePrompts && selectedModelData.examplePrompts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {selectedModelData.examplePrompts.map((example, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExamplePromptClick(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleGenerate()}
              className="flex-1"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button onClick={handleCancel} size="lg" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <X className="w-5 h-5" />
              </Button>
            ) : (
              <Button onClick={handleGenerate} size="lg">
                <span className="text-xl font-bold">Z</span>
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">✨ Creating Your Image</p>
                <p className="text-sm text-muted-foreground">AI is painting your masterpiece...</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-destructive/10 rounded-lg border-2 border-destructive/30">
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-5xl">❌</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-destructive">⚠️ Generation Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button onClick={handleGenerate} variant="outline">
                🔄 Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Generated Images ({generatedImages.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={image.url} 
                    alt={image.prompt} 
                    className="w-full h-auto"
                  />
                  <Button
                    onClick={() => handleDeleteImage(image.id)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="space-y-3 pt-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Prompt:</p>
                    <p className="text-sm text-muted-foreground">{image.prompt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleDownload(image.url, image.prompt)} 
                      className="flex-1" 
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => handleCopyPrompt(image.prompt)} 
                      className="flex-1"
                      variant="secondary"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
