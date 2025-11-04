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
  { id: "1", name: "Creative Writer", behavior: "Writes engaging stories and creative content", emoji: "✍️", systemPrompt: "You are a creative writing assistant.", description: "Expert in creative writing" },
  { id: "2", name: "Code Helper", behavior: "Programming and technical explanations", emoji: "💻", systemPrompt: "You are a programming expert.", description: "Coding and debugging expert" },
  { id: "3", name: "Business Advisor", behavior: "Strategic business guidance and insights", emoji: "💼", systemPrompt: "You are a business consultant.", description: "Business strategy expert" },
  { id: "4", name: "Math Tutor", behavior: "Clear mathematical explanations", emoji: "🔢", systemPrompt: "You are a mathematics teacher.", description: "Math problem solver" },
  { id: "5", name: "Language Coach", behavior: "Language learning and translation", emoji: "🗣️", systemPrompt: "You are a language teacher.", description: "Language learning expert" },
  { id: "6", name: "Science Expert", behavior: "Scientific explanations and research", emoji: "🔬", systemPrompt: "You are a science educator.", description: "Science and research specialist" },
  { id: "7", name: "Chef Assistant", behavior: "Cooking tips and recipes", emoji: "👨‍🍳", systemPrompt: "You are a professional chef.", description: "Culinary expert" },
  { id: "8", name: "Fitness Coach", behavior: "Workout plans and health advice", emoji: "💪", systemPrompt: "You are a fitness trainer.", description: "Fitness and wellness guide" },
  { id: "9", name: "Travel Guide", behavior: "Travel recommendations and tips", emoji: "✈️", systemPrompt: "You are a travel expert.", description: "Travel planning specialist" },
  { id: "10", name: "Music Teacher", behavior: "Music theory and instrument guidance", emoji: "🎵", systemPrompt: "You are a music instructor.", description: "Music education expert" },
  { id: "11", name: "Art Critic", behavior: "Art analysis and creative feedback", emoji: "🎨", systemPrompt: "You are an art critic.", description: "Art and design specialist" },
  { id: "12", name: "History Scholar", behavior: "Historical facts and context", emoji: "📚", systemPrompt: "You are a history professor.", description: "History expert" },
  { id: "13", name: "Legal Advisor", behavior: "Legal information and guidance", emoji: "⚖️", systemPrompt: "You are a legal consultant.", description: "Legal information provider" },
  { id: "14", name: "Marketing Pro", behavior: "Marketing strategies and campaigns", emoji: "📈", systemPrompt: "You are a marketing expert.", description: "Marketing and branding specialist" },
  { id: "15", name: "Therapist", behavior: "Emotional support and guidance", emoji: "🧠", systemPrompt: "You are a supportive counselor.", description: "Mental wellness support" },
  { id: "16", name: "Movie Buff", behavior: "Film recommendations and reviews", emoji: "🎬", systemPrompt: "You are a film critic.", description: "Cinema and entertainment expert" },
  { id: "17", name: "Tech Support", behavior: "Technical troubleshooting help", emoji: "🔧", systemPrompt: "You are tech support.", description: "Technology problem solver" },
  { id: "18", name: "Fashion Stylist", behavior: "Style advice and fashion trends", emoji: "👗", systemPrompt: "You are a fashion consultant.", description: "Fashion and style expert" },
  { id: "19", name: "Gaming Guide", behavior: "Gaming tips and strategies", emoji: "🎮", systemPrompt: "You are a gaming expert.", description: "Video game specialist" },
  { id: "20", name: "Poet", behavior: "Poetry writing and analysis", emoji: "🖋️", systemPrompt: "You are a poet.", description: "Poetry creation expert" },
  { id: "21", name: "Finance Guru", behavior: "Financial planning and investing", emoji: "💰", systemPrompt: "You are a financial advisor.", description: "Finance and investing guide" },
  { id: "22", name: "Pet Care", behavior: "Pet health and training advice", emoji: "🐾", systemPrompt: "You are a veterinary assistant.", description: "Pet care specialist" },
  { id: "23", name: "Gardener", behavior: "Gardening tips and plant care", emoji: "🌱", systemPrompt: "You are a gardening expert.", description: "Gardening and horticulture" },
  { id: "24", name: "Photographer", behavior: "Photography techniques and tips", emoji: "📷", systemPrompt: "You are a photography expert.", description: "Photography specialist" },
  { id: "25", name: "Comedian", behavior: "Humor and joke writing", emoji: "😂", systemPrompt: "You are a comedian.", description: "Humor and comedy expert" },
  { id: "26", name: "Philosopher", behavior: "Philosophical discussions", emoji: "🤔", systemPrompt: "You are a philosopher.", description: "Philosophy and ethics expert" },
  { id: "27", name: "Mechanic", behavior: "Car maintenance and repair advice", emoji: "🔩", systemPrompt: "You are an auto mechanic.", description: "Automotive specialist" },
  { id: "28", name: "Astronomer", behavior: "Space and astronomy facts", emoji: "🌌", systemPrompt: "You are an astronomer.", description: "Astronomy and space expert" },
  { id: "29", name: "Architect", behavior: "Design and architecture guidance", emoji: "🏗️", systemPrompt: "You are an architect.", description: "Architecture and design expert" },
  { id: "30", name: "Motivator", behavior: "Inspiration and motivation", emoji: "🌟", systemPrompt: "You are a motivational coach.", description: "Motivation and positivity" },
];

const DEFAULT_IMAGE_MODELS: ImageModel[] = [
  { id: "1", name: "Flux Pro", emoji: "⚡", apiEndpoint: "https://image.pollinations.ai/prompt", description: "High quality images", modelType: "flux" },
  { id: "2", name: "Anime Master", emoji: "🎌", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Anime style art", modelType: "flux" },
  { id: "3", name: "Photo Real", emoji: "📸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Photorealistic images", modelType: "flux-realism" },
  { id: "4", name: "Fantasy Art", emoji: "🐉", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Fantasy themed art", modelType: "flux" },
  { id: "5", name: "Cyberpunk", emoji: "🤖", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Futuristic cyberpunk", modelType: "flux" },
  { id: "6", name: "Oil Painting", emoji: "🖼️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Classic oil painting style", modelType: "flux" },
  { id: "7", name: "Pixel Art", emoji: "👾", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Retro pixel art", modelType: "flux" },
  { id: "8", name: "Watercolor", emoji: "🎨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Watercolor paintings", modelType: "flux" },
  { id: "9", name: "Comic Book", emoji: "💥", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Comic book style", modelType: "flux" },
  { id: "10", name: "3D Render", emoji: "🎲", apiEndpoint: "https://image.pollinations.ai/prompt", description: "3D rendered images", modelType: "flux" },
  { id: "11", name: "Sketch", emoji: "✏️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Pencil sketch style", modelType: "flux" },
  { id: "12", name: "Abstract", emoji: "🌀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Abstract art", modelType: "flux" },
  { id: "13", name: "Portrait Pro", emoji: "👤", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Portrait photography", modelType: "flux-realism" },
  { id: "14", name: "Landscape", emoji: "🏞️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Beautiful landscapes", modelType: "flux" },
  { id: "15", name: "Steampunk", emoji: "⚙️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Steampunk aesthetic", modelType: "flux" },
  { id: "16", name: "Horror", emoji: "👻", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Horror themed art", modelType: "flux" },
  { id: "17", name: "Minimalist", emoji: "⬜", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Minimalist design", modelType: "flux" },
  { id: "18", name: "Surreal", emoji: "🌈", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Surreal artwork", modelType: "flux" },
  { id: "19", name: "Pop Art", emoji: "💫", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Pop art style", modelType: "flux" },
  { id: "20", name: "Nature", emoji: "🌿", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Natural scenes", modelType: "flux" },
  { id: "21", name: "Vintage", emoji: "📻", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Vintage aesthetic", modelType: "flux" },
  { id: "22", name: "Neon", emoji: "💡", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Neon lighting effects", modelType: "flux" },
  { id: "23", name: "Gothic", emoji: "🦇", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Gothic art style", modelType: "flux" },
  { id: "24", name: "Children's Book", emoji: "📚", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Kids illustration", modelType: "flux" },
  { id: "25", name: "Sci-Fi", emoji: "🚀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Science fiction", modelType: "flux" },
  { id: "26", name: "Art Deco", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Art deco style", modelType: "flux" },
  { id: "27", name: "Tattoo Design", emoji: "🖊️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Tattoo artwork", modelType: "flux" },
  { id: "28", name: "Logo Maker", emoji: "🏷️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Logo designs", modelType: "flux" },
  { id: "29", name: "Cartoon", emoji: "🎪", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cartoon style", modelType: "flux" },
  { id: "30", name: "Dream Art", emoji: "💭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dreamlike imagery", modelType: "flux" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [aiModels, setAIModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [imageModels, setImageModels] = useState<ImageModel[]>(DEFAULT_IMAGE_MODELS);

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
