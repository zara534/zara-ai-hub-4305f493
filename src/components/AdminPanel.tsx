import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BroadcastMessage } from "./BroadcastMessage";
import { ImageModelManager } from "./ImageModelManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminPanel() {
  const { aiModels, addAIModel, removeAIModel } = useApp();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [behavior, setBehavior] = useState("");
  const [emoji, setEmoji] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    behavior: "",
    emoji: "",
    systemPrompt: "",
    description: ""
  });

  const handleAddAIModel = () => {
    if (!name.trim() || !behavior.trim() || !emoji.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    
    addAIModel({ 
      name, 
      behavior, 
      emoji,
      systemPrompt: systemPrompt.trim() || behavior,
      description: description.trim() || behavior
    });
    
    toast.success("AI Agent added successfully!");
    setName("");
    setBehavior("");
    setEmoji("");
    setSystemPrompt("");
    setDescription("");
  };

  const handleStartEdit = (model: any) => {
    setEditingId(model.id);
    setEditForm({
      name: model.name,
      behavior: model.behavior,
      emoji: model.emoji,
      systemPrompt: model.systemPrompt || "",
      description: model.description || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      behavior: "",
      emoji: "",
      systemPrompt: "",
      description: ""
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim() || !editForm.behavior.trim() || !editForm.emoji.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    // Update the model in context
    const updatedModels = aiModels.map(m => 
      m.id === editingId 
        ? { 
            ...m, 
            name: editForm.name,
            behavior: editForm.behavior,
            emoji: editForm.emoji,
            systemPrompt: editForm.systemPrompt || editForm.behavior,
            description: editForm.description || editForm.behavior
          }
        : m
    );

    localStorage.setItem("ai-models", JSON.stringify(updatedModels));
    window.location.reload();
    
    toast.success("AI Agent updated successfully!");
    handleCancelEdit();
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto px-2 md:px-4 pb-6">
      <Tabs defaultValue="text-models" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text-models">Text AI Models</TabsTrigger>
          <TabsTrigger value="image-models">Image Models</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="text-models" className="space-y-6 mt-6">
      {/* Add AI Agent Card */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
            Add New AI Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="AI Agent Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Emoji Icon (e.g., 🤖) *"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
            />
          </div>
          
          <Textarea
            placeholder="Quick Behavior Description *"
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            className="min-h-20"
          />
          
          <Textarea
            placeholder="Detailed Description (shown to users)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24"
          />
          
          <Textarea
            placeholder="System Prompt (how the AI should behave internally)"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="min-h-32"
          />
          
          <Button onClick={handleAddAIModel} className="w-full" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add AI Agent
          </Button>
        </CardContent>
      </Card>

      {/* Manage AI Agents Card */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Manage AI Agents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiModels.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No AI agents yet. Add your first one above!
            </p>
          ) : (
            aiModels.map((model) => (
              <div
                key={model.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {editingId === model.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="AI Agent Name *"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                      <Input
                        placeholder="Emoji Icon *"
                        value={editForm.emoji}
                        onChange={(e) => setEditForm({...editForm, emoji: e.target.value})}
                        maxLength={4}
                      />
                    </div>
                    <Textarea
                      placeholder="Quick Behavior Description *"
                      value={editForm.behavior}
                      onChange={(e) => setEditForm({...editForm, behavior: e.target.value})}
                      className="min-h-20"
                    />
                    <Textarea
                      placeholder="Detailed Description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="min-h-24"
                    />
                    <Textarea
                      placeholder="System Prompt"
                      value={editForm.systemPrompt}
                      onChange={(e) => setEditForm({...editForm, systemPrompt: e.target.value})}
                      className="min-h-32"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-4xl">{model.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{model.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{model.behavior}</p>
                        {model.description && (
                          <p className="text-xs text-muted-foreground/80 italic">
                            Description: {model.description}
                          </p>
                        )}
                        {model.systemPrompt && (
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            System Prompt: {model.systemPrompt.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStartEdit(model)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          removeAIModel(model.id);
                          toast.success("AI Agent removed");
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="image-models" className="space-y-6 mt-6">
          <ImageModelManager />
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-6 mt-6">
          <BroadcastMessage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
