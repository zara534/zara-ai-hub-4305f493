import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Image, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

const POLLINATIONS_MODELS = [
  { id: "flux", name: "Flux", description: "High quality, balanced speed" },
  { id: "flux-realism", name: "Flux Realism", description: "Photorealistic outputs" },
  { id: "flux-cablyai", name: "Flux CablyAI", description: "Artistic style" },
  { id: "flux-anime", name: "Flux Anime", description: "Anime & manga style" },
  { id: "flux-3d", name: "Flux 3D", description: "3D rendered look" },
  { id: "turbo", name: "Turbo", description: "Fastest generation" },
];

export function ImageModelManager() {
  const { imageModels, addImageModel, removeImageModel } = useApp();
  const [name, setName] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("https://image.pollinations.ai/prompt");
  const [description, setDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState("flux");

  const handleAddModel = () => {
    if (!name.trim()) {
      toast.error("Please enter a model name");
      return;
    }
    
    addImageModel({ 
      name: name.trim(), 
      apiEndpoint: apiEndpoint.trim(),
      description: description.trim(),
      modelType: selectedModel
    });
    
    toast.success("Image model added successfully!");
    setName("");
    setApiEndpoint("https://image.pollinations.ai/prompt");
    setDescription("");
    setSelectedModel("flux");
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Add Custom Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model Name *</label>
            <Input
              placeholder="e.g., My Custom Generator"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pollinations Model *</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {POLLINATIONS_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">API Endpoint</label>
            <Input
              placeholder="https://image.pollinations.ai/prompt"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe what this generator is good for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 border-2"
            />
          </div>

          <Button onClick={handleAddModel} className="w-full" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Image Generator
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {imageModels.length === 0 ? (
          <Card className="col-span-full shadow-lg border-2">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <Image className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No custom image generators yet. Add your first one above!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          imageModels.map((model) => (
            <Card key={model.id} className="shadow-lg border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      removeImageModel(model.id);
                      toast.success("Image generator removed");
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {model.modelType && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {POLLINATIONS_MODELS.find(m => m.id === model.modelType)?.name || model.modelType}
                    </span>
                  </div>
                )}
                {model.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {model.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/60 truncate">
                  {model.apiEndpoint}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
