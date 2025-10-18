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
}

const DEFAULT_IMAGE_MODELS: ImageModel[] = [
  {
    id: "flux",
    name: "Flux",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "High quality image generation with Flux"
  },
  {
    id: "turbo",
    name: "Turbo",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Fast image generation"
  }
];

export function ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { imageModels = DEFAULT_IMAGE_MODELS } = useApp();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    try {
      const model = imageModels.find(m => m.id === selectedModel) || imageModels[0];
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `${model.apiEndpoint}/${encodedPrompt}?model=${selectedModel}&nologo=true&width=1024&height=1024`;
      
      setGeneratedImage(imageUrl);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Failed to generate image");
    } finally {
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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Generating image...</span>
            </div>
          )}

          {generatedImage && !isLoading && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border-2">
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="w-full h-auto"
                  onLoad={() => toast.success("Image loaded!")}
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
