import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

export function ImageModelManager() {
  const { imageModels, addImageModel, removeImageModel } = useApp();
  const [name, setName] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [description, setDescription] = useState("");

  const handleAddModel = () => {
    if (!name.trim() || !apiEndpoint.trim()) {
      toast.error("Please fill in name and API endpoint");
      return;
    }
    
    addImageModel({ 
      name: name.trim(), 
      apiEndpoint: apiEndpoint.trim(),
      description: description.trim()
    });
    
    toast.success("Image model added successfully!");
    setName("");
    setApiEndpoint("");
    setDescription("");
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
            Add Custom Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Model Name (e.g., DALL-E) *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="API Endpoint URL *"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-20"
          />
          <Button onClick={handleAddModel} className="w-full" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Image Model
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Manage Image Models</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {imageModels.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No custom image models yet. Add your first one above!
            </p>
          ) : (
            imageModels.map((model) => (
              <div
                key={model.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{model.name}</h3>
                    <p className="text-sm text-muted-foreground">{model.apiEndpoint}</p>
                    {model.description && (
                      <p className="text-xs text-muted-foreground/80 italic mt-1">
                        {model.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      removeImageModel(model.id);
                      toast.success("Image model removed");
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
