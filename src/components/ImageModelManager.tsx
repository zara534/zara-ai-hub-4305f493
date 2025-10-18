import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

const POLLINATIONS_MODELS = [
  { value: "flux", label: "FLUX (Default)", description: "High quality image generation" },
  { value: "stable-diffusion-xl", label: "Stable Diffusion XL", description: "Creative and artistic images" },
  { value: "dall-e-3", label: "DALL-E 3", description: "Photorealistic images" },
  { value: "playground-v2.5", label: "Playground v2.5", description: "Diverse artistic styles" },
  { value: "dpo", label: "DPO", description: "Optimized generation" }
];

export function ImageModelManager() {
  const { imageModels, addImageModel, removeImageModel, updateImageModel } = useApp();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎨");
  const [apiEndpoint, setApiEndpoint] = useState("https://image.pollinations.ai/prompt");
  const [description, setDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState("flux");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddModel = () => {
    if (!name.trim()) {
      toast.error("Please enter a name for the model");
      return;
    }
    
    if (editingId) {
      // Update existing model
      updateImageModel(editingId, {
        name: name.trim(), 
        emoji: emoji.trim(),
        description: description.trim(),
        modelType: selectedModel,
        systemPrompt: systemPrompt.trim()
      });
      toast.success("Image generator updated!");
      setEditingId(null);
    } else {
      // Add new model
      addImageModel({ 
        name: name.trim(),
        emoji: emoji.trim(),
        apiEndpoint: apiEndpoint.trim(),
        description: description.trim(),
        modelType: selectedModel,
        systemPrompt: systemPrompt.trim()
      });
      toast.success("Image generator added successfully!");
    }
    
    setName("");
    setEmoji("🎨");
    setApiEndpoint("https://image.pollinations.ai/prompt");
    setDescription("");
    setSelectedModel("flux");
    setSystemPrompt("");
  };

  const handleEdit = (model: any) => {
    setEditingId(model.id);
    setName(model.name);
    setEmoji(model.emoji || "🎨");
    setDescription(model.description || "");
    setSelectedModel(model.modelType || "flux");
    setSystemPrompt(model.systemPrompt || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setEmoji("🎨");
    setDescription("");
    setSelectedModel("flux");
    setSystemPrompt("");
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            {editingId ? "Edit Image Generator" : "Add Custom Image Generator"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model-name" className="text-sm font-medium">Model Name *</Label>
              <Input
                id="model-name"
                placeholder="e.g., My Custom Generator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-emoji" className="text-sm font-medium">Icon/Emoji</Label>
              <Input
                id="model-emoji"
                placeholder="🎨"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="border-2"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model-type" className="text-sm font-medium">Pollinations Model *</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model-type" className="border-2">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {POLLINATIONS_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.label}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Input
              id="description"
              placeholder="What does this generator do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-prompt" className="text-sm font-medium">System Prompt (Instructions for AI)</Label>
            <Textarea
              id="system-prompt"
              placeholder="e.g., Create photorealistic images with vibrant colors, sharp details, and professional lighting. Focus on composition and depth..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-32 border-2"
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be prepended to all user prompts, guiding the AI on how to generate images.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-endpoint" className="text-sm font-medium">API Endpoint</Label>
            <Input
              id="api-endpoint"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="border-2 bg-muted/50"
              readOnly
            />
          </div>

          <div className="flex gap-2">
            {editingId && (
              <Button onClick={handleCancelEdit} variant="outline" className="flex-1" size="lg">
                Cancel
              </Button>
            )}
            <Button onClick={handleAddModel} className="flex-1" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              {editingId ? "Update Generator" : "Add Generator"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ImageIcon className="w-6 h-6 text-primary" />
            Manage Image Generators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {imageModels.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg">
                No custom image generators yet. Add your first one above!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {imageModels.map((model) => (
                <Card
                  key={model.id}
                  className="group hover:shadow-lg transition-all border-2 hover:border-primary/50"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                          {model.emoji || <ImageIcon className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-base">{model.name}</h3>
                          {model.modelType && (
                            <p className="text-xs text-primary font-medium">
                              {POLLINATIONS_MODELS.find(m => m.value === model.modelType)?.label || model.modelType}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!model.id.startsWith('default') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEdit(model)}
                          >
                            <Sparkles className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                        {!model.id.startsWith('default') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              removeImageModel(model.id);
                              toast.success("Image generator removed");
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {model.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {model.description}
                      </p>
                    )}
                    
                    {model.systemPrompt && (
                      <p className="text-xs text-muted-foreground/70 italic line-clamp-2">
                        "{model.systemPrompt}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
