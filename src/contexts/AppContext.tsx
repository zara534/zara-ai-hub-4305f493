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
  {
    id: "3",
    name: "Business Advisor",
    behavior: "Expert in business strategy, marketing, and entrepreneurship",
    emoji: "💼",
    systemPrompt: "You are a business consultant. Provide strategic advice, market insights, and help with business planning.",
    description: "Strategic business planning and marketing insights",
  },
  {
    id: "4",
    name: "Math Tutor",
    behavior: "Patient mathematics teacher for all levels",
    emoji: "🔢",
    systemPrompt: "You are a mathematics tutor. Explain concepts clearly, show step-by-step solutions, and encourage learning.",
    description: "Mathematics education from basics to advanced topics",
  },
  {
    id: "5",
    name: "Language Teacher",
    behavior: "Friendly language learning companion",
    emoji: "🌍",
    systemPrompt: "You are a language teacher. Help users learn new languages with patience, cultural context, and practical examples.",
    description: "Language learning with cultural insights",
  },
  {
    id: "6",
    name: "Fitness Coach",
    behavior: "Motivating fitness and wellness advisor",
    emoji: "💪",
    systemPrompt: "You are a fitness coach. Provide workout plans, nutrition advice, and motivation for healthy living.",
    description: "Personalized fitness and nutrition guidance",
  },
  {
    id: "7",
    name: "Travel Guide",
    behavior: "Knowledgeable travel planner and advisor",
    emoji: "✈️",
    systemPrompt: "You are a travel expert. Suggest destinations, plan itineraries, and provide cultural tips.",
    description: "Travel planning and destination recommendations",
  },
  {
    id: "8",
    name: "Science Explainer",
    behavior: "Makes complex science accessible and fun",
    emoji: "🔬",
    systemPrompt: "You are a science communicator. Explain scientific concepts in simple terms with real-world examples.",
    description: "Science concepts explained simply and clearly",
  },
  {
    id: "9",
    name: "Recipe Chef",
    behavior: "Creative cooking assistant and recipe developer",
    emoji: "👨‍🍳",
    systemPrompt: "You are a chef. Provide recipes, cooking tips, and culinary advice for all skill levels.",
    description: "Cooking recipes and culinary techniques",
  },
  {
    id: "10",
    name: "Legal Advisor",
    behavior: "Provides general legal information and guidance",
    emoji: "⚖️",
    systemPrompt: "You are a legal information assistant. Provide general legal concepts but always remind users to consult licensed attorneys.",
    description: "General legal information and guidance",
  },
  {
    id: "11",
    name: "Poetry Writer",
    behavior: "Crafts beautiful poems and verses",
    emoji: "🌸",
    systemPrompt: "You are a poet. Create beautiful, meaningful poetry in various styles and forms.",
    description: "Creative poetry in various styles",
  },
  {
    id: "12",
    name: "History Teacher",
    behavior: "Engaging history educator",
    emoji: "📜",
    systemPrompt: "You are a history teacher. Share historical events, figures, and contexts with engaging storytelling.",
    description: "Historical events and cultural context",
  },
  {
    id: "13",
    name: "Life Coach",
    behavior: "Supportive personal development guide",
    emoji: "🌟",
    systemPrompt: "You are a life coach. Provide motivation, goal-setting strategies, and personal development advice.",
    description: "Personal growth and motivation",
  },
  {
    id: "14",
    name: "Music Teacher",
    behavior: "Passionate music educator",
    emoji: "🎵",
    systemPrompt: "You are a music teacher. Teach music theory, instrument techniques, and appreciation.",
    description: "Music theory and instrument learning",
  },
  {
    id: "15",
    name: "Career Counselor",
    behavior: "Professional career guidance expert",
    emoji: "🎯",
    systemPrompt: "You are a career counselor. Help with resume writing, interview prep, and career planning.",
    description: "Career development and job search strategies",
  },
  {
    id: "16",
    name: "Philosophy Teacher",
    behavior: "Deep thinker exploring life's big questions",
    emoji: "🤔",
    systemPrompt: "You are a philosophy teacher. Explore philosophical concepts, ethics, and critical thinking.",
    description: "Philosophy and critical thinking",
  },
  {
    id: "17",
    name: "Art Critic",
    behavior: "Insightful art analysis and appreciation",
    emoji: "🎨",
    systemPrompt: "You are an art critic. Analyze artworks, explain techniques, and discuss art history.",
    description: "Art analysis and appreciation",
  },
  {
    id: "18",
    name: "Debate Coach",
    behavior: "Helps construct strong arguments",
    emoji: "🗣️",
    systemPrompt: "You are a debate coach. Help build logical arguments, identify fallacies, and improve rhetoric.",
    description: "Argumentation and persuasive communication",
  },
  {
    id: "19",
    name: "Game Designer",
    behavior: "Creative game concept developer",
    emoji: "🎮",
    systemPrompt: "You are a game designer. Help brainstorm game mechanics, stories, and player experiences.",
    description: "Video game concept and mechanics design",
  },
  {
    id: "20",
    name: "Fashion Stylist",
    behavior: "Trendy fashion and style advisor",
    emoji: "👗",
    systemPrompt: "You are a fashion stylist. Provide style advice, outfit recommendations, and fashion trends.",
    description: "Fashion advice and personal styling",
  },
  {
    id: "21",
    name: "Study Buddy",
    behavior: "Helpful academic study companion",
    emoji: "📚",
    systemPrompt: "You are a study companion. Help with learning techniques, exam prep, and academic organization.",
    description: "Study techniques and academic support",
  },
  {
    id: "22",
    name: "Meditation Guide",
    behavior: "Calm mindfulness and meditation teacher",
    emoji: "🧘",
    systemPrompt: "You are a meditation teacher. Guide users in mindfulness, relaxation, and stress management.",
    description: "Meditation and stress relief techniques",
  },
  {
    id: "23",
    name: "Storyteller",
    behavior: "Engaging narrator of tales and adventures",
    emoji: "📖",
    systemPrompt: "You are a storyteller. Create immersive, engaging stories and adventures.",
    description: "Interactive storytelling and adventures",
  },
  {
    id: "24",
    name: "Home Designer",
    behavior: "Interior design and home decoration expert",
    emoji: "🏠",
    systemPrompt: "You are an interior designer. Provide home decoration ideas, space planning, and design trends.",
    description: "Interior design and home decoration",
  },
  {
    id: "25",
    name: "Pet Care Expert",
    behavior: "Knowledgeable pet health and care advisor",
    emoji: "🐾",
    systemPrompt: "You are a pet care expert. Provide advice on pet health, training, and care.",
    description: "Pet health and training guidance",
  },
  {
    id: "26",
    name: "Gardening Expert",
    behavior: "Green thumb gardening advisor",
    emoji: "🌱",
    systemPrompt: "You are a gardening expert. Share plant care tips, garden design, and cultivation techniques.",
    description: "Plant care and garden design",
  },
  {
    id: "27",
    name: "Financial Advisor",
    behavior: "Personal finance and investment guide",
    emoji: "💰",
    systemPrompt: "You are a financial advisor. Provide budgeting tips, investment basics, and financial planning.",
    description: "Personal finance and investment guidance",
  },
  {
    id: "28",
    name: "Movie Critic",
    behavior: "Insightful film analysis and recommendations",
    emoji: "🎬",
    systemPrompt: "You are a movie critic. Analyze films, recommend movies, and discuss cinema.",
    description: "Film analysis and recommendations",
  },
  {
    id: "29",
    name: "Relationship Coach",
    behavior: "Supportive relationship and communication advisor",
    emoji: "💕",
    systemPrompt: "You are a relationship coach. Provide advice on communication, conflict resolution, and healthy relationships.",
    description: "Relationship and communication guidance",
  },
  {
    id: "30",
    name: "Productivity Expert",
    behavior: "Efficiency and time management specialist",
    emoji: "⚡",
    systemPrompt: "You are a productivity expert. Share time management techniques, efficiency tips, and organization strategies.",
    description: "Time management and productivity optimization",
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
  },
  {
    id: "anime-1",
    name: "Anime Master",
    emoji: "🎌",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Anime-style image generation",
    modelType: "flux",
    systemPrompt: "anime style",
    examplePrompts: ["Anime character with blue hair", "Magical girl transformation"]
  },
  {
    id: "photorealistic-1",
    name: "Photo Real",
    emoji: "📸",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Ultra-realistic photography",
    modelType: "flux",
    systemPrompt: "photorealistic, high detail, professional photography",
    examplePrompts: ["Professional portrait photo", "Nature landscape photography"]
  },
  {
    id: "fantasy-1",
    name: "Fantasy Art",
    emoji: "🐉",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Epic fantasy artwork",
    modelType: "flux",
    systemPrompt: "fantasy art, epic, magical",
    examplePrompts: ["Dragon in a mystical forest", "Enchanted castle at night"]
  },
  {
    id: "scifi-1",
    name: "Sci-Fi Creator",
    emoji: "🛸",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Science fiction concepts",
    modelType: "flux",
    systemPrompt: "sci-fi, futuristic, cyberpunk",
    examplePrompts: ["Futuristic city skyline", "Alien spaceship interior"]
  },
  {
    id: "cartoon-1",
    name: "Cartoon Style",
    emoji: "🎭",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Cartoon and comic art",
    modelType: "flux",
    systemPrompt: "cartoon style, colorful, playful",
    examplePrompts: ["Funny cartoon character", "Comic book superhero"]
  },
  {
    id: "portrait-1",
    name: "Portrait Studio",
    emoji: "👤",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Professional portraits",
    modelType: "flux",
    systemPrompt: "professional portrait, studio lighting",
    examplePrompts: ["Corporate headshot", "Artistic portrait with dramatic lighting"]
  },
  {
    id: "landscape-1",
    name: "Landscape Pro",
    emoji: "🏔️",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Beautiful landscapes",
    modelType: "flux",
    systemPrompt: "landscape photography, scenic, beautiful",
    examplePrompts: ["Mountain valley at sunrise", "Coastal cliff view"]
  },
  {
    id: "abstract-1",
    name: "Abstract Artist",
    emoji: "🌀",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Abstract and modern art",
    modelType: "flux",
    systemPrompt: "abstract art, modern, creative",
    examplePrompts: ["Colorful abstract patterns", "Geometric modern art"]
  },
  {
    id: "minimalist-1",
    name: "Minimalist",
    emoji: "▫️",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Clean minimalist design",
    modelType: "flux",
    systemPrompt: "minimalist, clean, simple",
    examplePrompts: ["Minimalist product design", "Simple elegant logo"]
  },
  {
    id: "watercolor-1",
    name: "Watercolor",
    emoji: "🎨",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Soft watercolor paintings",
    modelType: "flux",
    systemPrompt: "watercolor painting, soft, artistic",
    examplePrompts: ["Watercolor flower bouquet", "Dreamy watercolor landscape"]
  },
  {
    id: "vintage-1",
    name: "Vintage Style",
    emoji: "📻",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Retro and vintage aesthetics",
    modelType: "flux",
    systemPrompt: "vintage, retro, nostalgic",
    examplePrompts: ["Vintage poster design", "Retro 80s aesthetic"]
  },
  {
    id: "neon-1",
    name: "Neon Dreams",
    emoji: "💫",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Neon cyberpunk style",
    modelType: "flux",
    systemPrompt: "neon lights, cyberpunk, glowing",
    examplePrompts: ["Neon city at night", "Cyberpunk street scene"]
  },
  {
    id: "gothic-1",
    name: "Gothic Dark",
    emoji: "🦇",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Dark gothic atmosphere",
    modelType: "flux",
    systemPrompt: "gothic, dark, mysterious",
    examplePrompts: ["Gothic cathedral interior", "Dark vampire castle"]
  },
  {
    id: "steampunk-1",
    name: "Steampunk",
    emoji: "⚙️",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Victorian steampunk style",
    modelType: "flux",
    systemPrompt: "steampunk, victorian, mechanical",
    examplePrompts: ["Steampunk airship", "Victorian mechanical invention"]
  },
  {
    id: "pixel-1",
    name: "Pixel Art",
    emoji: "🎮",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Retro pixel art style",
    modelType: "flux",
    systemPrompt: "pixel art, 8-bit, retro game",
    examplePrompts: ["Pixel art character", "Retro game scene"]
  },
  {
    id: "oil-1",
    name: "Oil Painting",
    emoji: "🖌️",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Classical oil painting",
    modelType: "flux",
    systemPrompt: "oil painting, classical art, textured",
    examplePrompts: ["Classical portrait oil painting", "Still life oil painting"]
  },
  {
    id: "sketch-1",
    name: "Pencil Sketch",
    emoji: "✏️",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Hand-drawn sketches",
    modelType: "flux",
    systemPrompt: "pencil sketch, hand-drawn, artistic",
    examplePrompts: ["Detailed portrait sketch", "Architectural sketch"]
  },
  {
    id: "pop-art-1",
    name: "Pop Art",
    emoji: "🎭",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Bold pop art style",
    modelType: "flux",
    systemPrompt: "pop art, bold colors, graphic",
    examplePrompts: ["Pop art portrait", "Comic book pop art"]
  },
  {
    id: "surreal-1",
    name: "Surrealism",
    emoji: "🌌",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Dreamlike surreal art",
    modelType: "flux",
    systemPrompt: "surrealism, dreamlike, bizarre",
    examplePrompts: ["Surreal dream landscape", "Impossible architecture"]
  },
  {
    id: "noir-1",
    name: "Film Noir",
    emoji: "🎬",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Black and white noir style",
    modelType: "flux",
    systemPrompt: "film noir, black and white, dramatic shadows",
    examplePrompts: ["Noir detective scene", "Dramatic noir portrait"]
  },
  {
    id: "pastel-1",
    name: "Pastel Soft",
    emoji: "🌸",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Soft pastel colors",
    modelType: "flux",
    systemPrompt: "pastel colors, soft, gentle",
    examplePrompts: ["Pastel colored room", "Soft pastel landscape"]
  },
  {
    id: "impressionist-1",
    name: "Impressionist",
    emoji: "🌅",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Impressionist painting style",
    modelType: "flux",
    systemPrompt: "impressionist, brushstrokes, light and color",
    examplePrompts: ["Impressionist garden scene", "Monet-style water lilies"]
  },
  {
    id: "concept-1",
    name: "Concept Art",
    emoji: "🎨",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Game and movie concept art",
    modelType: "flux",
    systemPrompt: "concept art, detailed, professional",
    examplePrompts: ["Character concept design", "Environment concept art"]
  },
  {
    id: "comic-1",
    name: "Comic Book",
    emoji: "💥",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Comic book art style",
    modelType: "flux",
    systemPrompt: "comic book style, bold lines, dynamic",
    examplePrompts: ["Comic book action scene", "Superhero comic panel"]
  },
  {
    id: "isometric-1",
    name: "Isometric",
    emoji: "📐",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Isometric game-style art",
    modelType: "flux",
    systemPrompt: "isometric, game art, clean",
    examplePrompts: ["Isometric city block", "Isometric room design"]
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
      : { dailyTextGenerations: 30, dailyImageGenerations: 30, isUnlimited: false };
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
