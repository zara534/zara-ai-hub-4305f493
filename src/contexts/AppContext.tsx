import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  apiEndpoint: string;
  description?: string;
  modelType?: string;
  systemPrompt?: string;
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

interface AppContextType {
  aiModels: AIModel[];
  addAIModel: (model: Omit<AIModel, "id">) => void;
  removeAIModel: (id: string) => void;
  imageModels: ImageModel[];
  addImageModel: (model: Omit<ImageModel, "id">) => void;
  removeImageModel: (id: string) => void;
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt">) => void;
  removeAnnouncement: (id: string) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
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
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "High quality image generation (Default)",
    modelType: "flux",
    systemPrompt: "Generate high-quality, detailed images"
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Stable Diffusion XL model for creative images",
    modelType: "stable-diffusion-xl",
    systemPrompt: "Create artistic and creative images"
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "OpenAI's DALL-E 3 for photorealistic images",
    modelType: "dall-e-3",
    systemPrompt: "Generate photorealistic and detailed images"
  },
  {
    id: "playground-v2.5",
    name: "Playground v2.5",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Playground v2.5 for diverse styles",
    modelType: "playground-v2.5",
    systemPrompt: "Create diverse artistic styles"
  },
  {
    id: "dpo",
    name: "DPO",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "DPO model for optimized generation",
    modelType: "dpo",
    systemPrompt: "Generate optimized images efficiently"
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [aiModels, setAIModels] = useState<AIModel[]>(() => {
    const stored = localStorage.getItem("aiModels");
    return stored ? JSON.parse(stored) : DEFAULT_MODELS;
  });

  const [imageModels, setImageModels] = useState<ImageModel[]>(() => {
    const stored = localStorage.getItem("imageModels");
    return stored ? JSON.parse(stored) : DEFAULT_IMAGE_MODELS;
  });

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

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  useEffect(() => {
    localStorage.setItem("aiModels", JSON.stringify(aiModels));
  }, [aiModels]);

  useEffect(() => {
    localStorage.setItem("imageModels", JSON.stringify(imageModels));
  }, [imageModels]);

  useEffect(() => {
    localStorage.setItem("announcements", JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    document.documentElement.classList.toggle("dark", settings.darkMode);
    document.documentElement.style.fontFamily = getFontFamily(settings.fontFamily);
    document.documentElement.setAttribute("data-theme", settings.colorTheme);
  }, [settings]);

  const addAIModel = (model: Omit<AIModel, "id">) => {
    const newModel = { ...model, id: Date.now().toString() };
    setAIModels((prev) => [...prev, newModel]);
  };

  const removeAIModel = (id: string) => {
    setAIModels((prev) => prev.filter((m) => m.id !== id));
  };

  const addImageModel = (model: Omit<ImageModel, "id">) => {
    const newModel = { ...model, id: Date.now().toString() };
    setImageModels((prev) => [...prev, newModel]);
  };

  const removeImageModel = (id: string) => {
    setImageModels((prev) => prev.filter((m) => m.id !== id));
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
        imageModels,
        addImageModel,
        removeImageModel,
        announcements,
        addAnnouncement,
        removeAnnouncement,
        settings,
        updateSettings,
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
