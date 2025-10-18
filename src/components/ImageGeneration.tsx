import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

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
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { imageModels = DEFAULT_IMAGE_MODELS } = useApp();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastPrompt(prompt);
    try {
      const model = imageModels.find(m => m.id === selectedModel) || imageModels[0];
      const fullPrompt = model.systemPrompt 
        ? `${model.systemPrompt} ${prompt}` 
        : prompt;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const modelType = model.modelType || selectedModel;
      const seed = Date.now();
      const imageUrl = `${model.apiEndpoint}/${encodedPrompt}?model=${modelType}&nologo=true&width=1024&height=1024&seed=${seed}`;
      
      // Test if image loads successfully
      const img = new Image();
      img.onload = () => {
        setGeneratedImage(imageUrl);
        toast.success("Image generated successfully!");
        setIsLoading(false);
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

  const handleReuse = () => {
    setPrompt(lastPrompt);
    setError(null);
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
    <div className="space-y-4 max-w-5xl mx-auto">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ImageIcon className="w-6 h-6" />
            AI Image Generator
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
                  {model.name} {model.description && `- ${model.description}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleGenerate()}
              className="flex-1"
            />
            <Button onClick={handleGenerate} disabled={isLoading} size="lg">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </Button>
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
              <div className="flex gap-2">
                <Button onClick={handleGenerate} variant="outline">
                  🔄 Try Again
                </Button>
                {lastPrompt && (
                  <Button onClick={handleReuse} variant="secondary">
                    ♻️ Reuse Last Prompt
                  </Button>
                )}
              </div>
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
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1" variant="outline">
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  className="flex-1"
                  variant="secondary"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Regenerate
                </Button>
                {lastPrompt && lastPrompt !== prompt && (
                  <Button onClick={handleReuse} variant="outline">
                    ♻️ Reuse Last
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
