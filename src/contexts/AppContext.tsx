import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIModel {
  id: string;
  name: string;
  behavior: string;
  emoji: string;
  systemPrompt?: string;
  description?: string;
}

export interface ImageModel {
  id: string;
  name: string;
  emoji?: string;
  apiEndpoint: string;
  description?: string;
  modelType?: string;
  systemPrompt?: string;
  examplePrompts?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  aiModelName: string;
  createdAt: string;
}

interface AppSettings {
  fontFamily: string;
  colorTheme: string;
  darkMode: boolean;
}

export interface RateLimits {
  dailyTextGenerations: number;
  dailyImageGenerations: number;
  isUnlimited: boolean;
}

interface AppContextType {
  aiModels: AIModel[];
  addAIModel: (model: Omit<AIModel, "id">) => Promise<void>;
  removeAIModel: (id: string) => Promise<void>;
  updateTextModel: (id: string, updates: Partial<AIModel>) => Promise<void>;
  imageModels: ImageModel[];
  addImageModel: (model: Omit<ImageModel, "id">) => Promise<void>;
  updateImageModel: (id: string, updates: Partial<ImageModel>) => Promise<void>;
  removeImageModel: (id: string) => Promise<void>;
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt">) => void;
  removeAnnouncement: (id: string) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  rateLimits: RateLimits;
  updateRateLimits: (limits: Partial<RateLimits>) => void;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_MODELS: AIModel[] = [
  {
    id: "1",
    name: "Creative Writer",
    behavior: "A creative and imaginative AI that writes engaging stories and content",
    emoji: "✍️",
    systemPrompt: "You are a creative writing assistant. Help users craft compelling narratives, develop characters, and refine their writing style.",
    description: "Expert in creative writing, storytelling, and content creation",
  },
  {
    id: "2",
    name: "Code Helper",
    behavior: "An AI specialized in programming and technical explanations",
    emoji: "💻",
    systemPrompt: "You are a programming expert. Provide clear code examples, debug issues, and explain technical concepts.",
    description: "Specialized in coding, debugging, and technical problem-solving",
  },
];

const DEFAULT_IMAGE_MODELS: ImageModel[] = [
  {
    id: "flux",
    name: "Flux",
    emoji: "⚡",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "High quality image generation (Default)",
    modelType: "flux",
    systemPrompt: "Generate high-quality, detailed images",
    examplePrompts: ["A beautiful sunset over mountains", "A cute cat wearing sunglasses"]
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    emoji: "🎨",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Stable Diffusion XL model for creative images",
    modelType: "stable-diffusion-xl",
    systemPrompt: "Create artistic and creative images",
    examplePrompts: ["Abstract art with vibrant colors", "Fantasy landscape with dragons"]
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    emoji: "🖼️",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "OpenAI's DALL-E 3 for photorealistic images",
    modelType: "dall-e-3",
    systemPrompt: "Generate photorealistic and detailed images",
    examplePrompts: ["Photorealistic portrait of a person", "Modern architecture building"]
  },
  {
    id: "playground-v2.5",
    name: "Playground v2.5",
    emoji: "🎪",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Playground v2.5 for diverse styles",
    modelType: "playground-v2.5",
    systemPrompt: "Create diverse artistic styles",
    examplePrompts: ["Cartoon character design", "Sci-fi spaceship concept art"]
  },
  {
    id: "dpo",
    name: "DPO",
    emoji: "🚀",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "DPO model for optimized generation",
    modelType: "dpo",
    systemPrompt: "Generate optimized images efficiently",
    examplePrompts: ["Logo design for tech startup", "Minimalist poster design"]
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [aiModels, setAIModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [imageModels, setImageModels] = useState<ImageModel[]>(DEFAULT_IMAGE_MODELS);

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const stored = localStorage.getItem("announcements");
    return stored ? JSON.parse(stored) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem("appSettings");
    return stored
      ? JSON.parse(stored)
      : { fontFamily: "inter", colorTheme: "default", darkMode: false };
  });

  const [rateLimits, setRateLimits] = useState<RateLimits>(() => {
    const stored = localStorage.getItem("rateLimits");
    return stored
      ? JSON.parse(stored)
      : { dailyTextGenerations: 50, dailyImageGenerations: 20, isUnlimited: false };
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  useEffect(() => {
    loadAIModels();
    loadImageModels();
  }, []);

  const loadAIModels = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_models")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const models = data.map((model) => ({
          id: model.id,
          name: model.name,
          behavior: model.behavior,
          emoji: model.emoji,
          systemPrompt: model.system_prompt,
          description: model.description,
        }));
        setAIModels(models);
      }
    } catch (error: any) {
      console.error("Error loading AI models:", error);
    }
  };

  const loadImageModels = async () => {
    try {
      const { data, error } = await supabase
        .from("image_models")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const models = data.map((model) => ({
          id: model.id,
          name: model.name,
          emoji: model.emoji,
          apiEndpoint: model.api_endpoint,
          description: model.description,
          modelType: model.model_type,
          systemPrompt: model.system_prompt,
          examplePrompts: model.example_prompts,
        }));
        setImageModels(models);
      }
    } catch (error: any) {
      console.error("Error loading image models:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("announcements", JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    document.documentElement.classList.toggle("dark", settings.darkMode);
    document.documentElement.style.fontFamily = getFontFamily(settings.fontFamily);
    document.documentElement.setAttribute("data-theme", settings.colorTheme);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("rateLimits", JSON.stringify(rateLimits));
  }, [rateLimits]);

  const addAIModel = async (model: Omit<AIModel, "id">) => {
    const newModel = { ...model, id: Date.now().toString() };
    try {
      const { error } = await supabase.from("ai_models").insert({
        id: newModel.id,
        name: newModel.name,
        behavior: newModel.behavior,
        emoji: newModel.emoji,
        system_prompt: newModel.systemPrompt,
        description: newModel.description,
      });

      if (error) throw error;

      setAIModels((prev) => [...prev, newModel]);
      toast.success("AI model added successfully!");
    } catch (error: any) {
      console.error("Error adding AI model:", error);
      toast.error("Failed to add AI model");
    }
  };

  const removeAIModel = async (id: string) => {
    try {
      const { error } = await supabase.from("ai_models").delete().eq("id", id);

      if (error) throw error;

      setAIModels((prev) => prev.filter((m) => m.id !== id));
      toast.success("AI model removed successfully!");
    } catch (error: any) {
      console.error("Error removing AI model:", error);
      toast.error("Failed to remove AI model");
    }
  };

  const updateTextModel = async (id: string, updates: Partial<AIModel>) => {
    try {
      const { error } = await supabase
        .from("ai_models")
        .update({
          name: updates.name,
          behavior: updates.behavior,
          emoji: updates.emoji,
          system_prompt: updates.systemPrompt,
          description: updates.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setAIModels((prev) =>
        prev.map((model) => (model.id === id ? { ...model, ...updates } : model))
      );
      toast.success("AI model updated successfully!");
    } catch (error: any) {
      console.error("Error updating AI model:", error);
      toast.error("Failed to update AI model");
    }
  };

  const addImageModel = async (model: Omit<ImageModel, "id">) => {
    const newModel = { ...model, id: Date.now().toString() };
    try {
      const { error } = await supabase.from("image_models").insert({
        id: newModel.id,
        name: newModel.name,
        emoji: newModel.emoji,
        api_endpoint: newModel.apiEndpoint,
        description: newModel.description,
        model_type: newModel.modelType,
        system_prompt: newModel.systemPrompt,
        example_prompts: newModel.examplePrompts,
      });

      if (error) throw error;

      setImageModels((prev) => [...prev, newModel]);
      toast.success("Image model added successfully!");
    } catch (error: any) {
      console.error("Error adding image model:", error);
      toast.error("Failed to add image model");
    }
  };

  const updateImageModel = async (id: string, updates: Partial<ImageModel>) => {
    try {
      const { error } = await supabase
        .from("image_models")
        .update({
          name: updates.name,
          emoji: updates.emoji,
          api_endpoint: updates.apiEndpoint,
          description: updates.description,
          model_type: updates.modelType,
          system_prompt: updates.systemPrompt,
          example_prompts: updates.examplePrompts,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setImageModels((prev) =>
        prev.map((model) => (model.id === id ? { ...model, ...updates } : model))
      );
      toast.success("Image model updated successfully!");
    } catch (error: any) {
      console.error("Error updating image model:", error);
      toast.error("Failed to update image model");
    }
  };

  const removeImageModel = async (id: string) => {
    try {
      const { error } = await supabase.from("image_models").delete().eq("id", id);

      if (error) throw error;

      setImageModels((prev) => prev.filter((m) => m.id !== id));
      toast.success("Image model removed successfully!");
    } catch (error: any) {
      console.error("Error removing image model:", error);
      toast.error("Failed to remove image model");
    }
  };

  const addAnnouncement = (announcement: Omit<Announcement, "id" | "createdAt">) => {
    const newAnnouncement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateRateLimits = (newLimits: Partial<RateLimits>) => {
    setRateLimits((prev) => ({ ...prev, ...newLimits }));
  };

  const login = (password: string) => {
    if (password === "zarahacks") {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  return (
    <AppContext.Provider
      value={{
        aiModels,
        addAIModel,
        removeAIModel,
        updateTextModel,
        imageModels,
        addImageModel,
        updateImageModel,
        removeImageModel,
        announcements,
        addAnnouncement,
        removeAnnouncement,
        settings,
        updateSettings,
        rateLimits,
        updateRateLimits,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

function getFontFamily(font: string): string {
  const fonts: Record<string, string> = {
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    poppins: "'Poppins', sans-serif",
    playfair: "'Playfair Display', serif",
    mono: "'JetBrains Mono', monospace",
    lato: "'Lato', sans-serif",
    opensans: "'Open Sans', sans-serif",
    raleway: "'Raleway', sans-serif",
    montserrat: "'Montserrat', sans-serif",
    nunito: "'Nunito', sans-serif",
    merriweather: "'Merriweather', serif",
    ubuntu: "'Ubuntu', sans-serif",
    pacifico: "'Pacifico', cursive",
    dancing: "'Dancing Script', cursive",
    oswald: "'Oswald', sans-serif",
    quicksand: "'Quicksand', sans-serif",
    archivo: "'Archivo', sans-serif",
    spacegrotesk: "'Space Grotesk', sans-serif",
    crimson: "'Crimson Text', serif",
    comicsans: "'Comic Sans MS', 'Comic Sans', cursive",
  };
  return fonts[font] || fonts.inter;
}
