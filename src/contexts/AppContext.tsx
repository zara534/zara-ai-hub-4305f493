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
  provider?: string; // openai, gemini, deepseek, mistral, etc.
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
  { id: "31", name: "Data Scientist", behavior: "Data analysis and machine learning insights", emoji: "📊", systemPrompt: "You are a data scientist expert.", description: "Data and analytics specialist" },
  { id: "32", name: "UX Designer", behavior: "User experience and interface design", emoji: "🖥️", systemPrompt: "You are a UX design expert.", description: "UX/UI design specialist" },
  { id: "33", name: "Nutritionist", behavior: "Diet plans and nutritional advice", emoji: "🥗", systemPrompt: "You are a certified nutritionist.", description: "Nutrition and diet expert" },
  { id: "34", name: "Yoga Instructor", behavior: "Yoga poses and mindfulness", emoji: "🧘", systemPrompt: "You are a yoga and meditation instructor.", description: "Yoga and wellness guide" },
  { id: "35", name: "Interior Designer", behavior: "Home decor and interior design tips", emoji: "🛋️", systemPrompt: "You are an interior design expert.", description: "Interior design specialist" },
  { id: "36", name: "Stock Trader", behavior: "Stock market analysis and trading tips", emoji: "📉", systemPrompt: "You are a stock trading expert.", description: "Stock market specialist" },
  { id: "37", name: "Crypto Expert", behavior: "Cryptocurrency and blockchain insights", emoji: "₿", systemPrompt: "You are a cryptocurrency expert.", description: "Crypto and blockchain specialist" },
  { id: "38", name: "Real Estate Agent", behavior: "Property buying and selling advice", emoji: "🏠", systemPrompt: "You are a real estate expert.", description: "Real estate specialist" },
  { id: "39", name: "Resume Writer", behavior: "Resume and cover letter optimization", emoji: "📝", systemPrompt: "You are a professional resume writer.", description: "Career document specialist" },
  { id: "40", name: "Interview Coach", behavior: "Job interview preparation and tips", emoji: "🤝", systemPrompt: "You are an interview preparation coach.", description: "Interview preparation expert" },
  { id: "41", name: "Public Speaker", behavior: "Public speaking and presentation skills", emoji: "🎤", systemPrompt: "You are a public speaking coach.", description: "Presentation skills expert" },
  { id: "42", name: "Email Writer", behavior: "Professional email composition", emoji: "✉️", systemPrompt: "You are a professional email writer.", description: "Email communication specialist" },
  { id: "43", name: "Social Media", behavior: "Social media strategy and content", emoji: "📱", systemPrompt: "You are a social media expert.", description: "Social media specialist" },
  { id: "44", name: "SEO Expert", behavior: "Search engine optimization tips", emoji: "🔍", systemPrompt: "You are an SEO specialist.", description: "Search optimization expert" },
  { id: "45", name: "Copywriter", behavior: "Compelling marketing copy", emoji: "📣", systemPrompt: "You are a professional copywriter.", description: "Marketing copy specialist" },
  { id: "46", name: "Translator", behavior: "Multi-language translation", emoji: "🌍", systemPrompt: "You are a professional translator.", description: "Translation specialist" },
  { id: "47", name: "Proofreader", behavior: "Grammar and spelling correction", emoji: "✅", systemPrompt: "You are a professional proofreader.", description: "Editing and proofreading expert" },
  { id: "48", name: "Debate Coach", behavior: "Argumentation and debate skills", emoji: "⚔️", systemPrompt: "You are a debate coach.", description: "Debate and argumentation expert" },
  { id: "49", name: "Trivia Master", behavior: "Fun facts and trivia knowledge", emoji: "🎯", systemPrompt: "You are a trivia expert.", description: "Trivia and fun facts specialist" },
  { id: "50", name: "Relationship Advisor", behavior: "Relationship and dating advice", emoji: "💕", systemPrompt: "You are a relationship counselor.", description: "Relationship guidance expert" },
  { id: "51", name: "Parenting Coach", behavior: "Parenting tips and child development", emoji: "👶", systemPrompt: "You are a parenting expert.", description: "Parenting and child care specialist" },
  { id: "52", name: "Study Buddy", behavior: "Study techniques and academic help", emoji: "📖", systemPrompt: "You are a study skills coach.", description: "Academic success specialist" },
  { id: "53", name: "Meditation Guide", behavior: "Meditation and relaxation techniques", emoji: "🕯️", systemPrompt: "You are a meditation instructor.", description: "Meditation and mindfulness expert" },
  { id: "54", name: "Sleep Expert", behavior: "Sleep improvement and insomnia help", emoji: "😴", systemPrompt: "You are a sleep specialist.", description: "Sleep and rest specialist" },
  { id: "55", name: "Productivity Pro", behavior: "Time management and productivity", emoji: "⏰", systemPrompt: "You are a productivity expert.", description: "Productivity and efficiency specialist" },
  { id: "56", name: "DJ Advisor", behavior: "Music mixing and DJ techniques", emoji: "🎧", systemPrompt: "You are a professional DJ.", description: "DJ and music mixing expert" },
  { id: "57", name: "Wine Expert", behavior: "Wine selection and pairing", emoji: "🍷", systemPrompt: "You are a sommelier.", description: "Wine and beverage specialist" },
  { id: "58", name: "Bartender", behavior: "Cocktail recipes and mixing", emoji: "🍹", systemPrompt: "You are a professional bartender.", description: "Cocktail and mixology expert" },
  { id: "59", name: "Event Planner", behavior: "Event organization and planning", emoji: "🎉", systemPrompt: "You are an event planning expert.", description: "Event planning specialist" },
  { id: "60", name: "Astrologer", behavior: "Horoscopes and astrological readings", emoji: "♈", systemPrompt: "You are an astrology expert.", description: "Astrology and horoscope specialist" },
  // New AI Provider Models
  { id: "61", name: "Gemini Flash", behavior: "Fast and intelligent responses using Google Gemini", emoji: "✨", systemPrompt: "You are a helpful AI assistant powered by Google Gemini.", description: "Google Gemini 2.5 Flash - Fast AI", provider: "gemini" },
  { id: "62", name: "Gemini Search", behavior: "AI with Google Search integration for real-time info", emoji: "🔍", systemPrompt: "You are a helpful AI assistant with access to Google Search.", description: "Gemini with Google Search", provider: "gemini-search" },
  { id: "63", name: "DeepSeek V3", behavior: "Advanced reasoning and analysis capabilities", emoji: "🧠", systemPrompt: "You are DeepSeek, an advanced reasoning AI.", description: "DeepSeek V3.1 - Reasoning AI", provider: "deepseek" },
  { id: "64", name: "Mistral AI", behavior: "Powerful open-source AI model", emoji: "🌪️", systemPrompt: "You are Mistral, a helpful AI assistant.", description: "Mistral Small 3.2 24B", provider: "mistral" },
  { id: "65", name: "GPT-5 Nano", behavior: "Fast OpenAI model with vision capabilities", emoji: "⚡", systemPrompt: "You are a helpful AI assistant.", description: "OpenAI GPT-5 Nano - Fast", provider: "openai-fast" },
  { id: "66", name: "Qwen Coder", behavior: "Specialized in coding and programming", emoji: "👨‍💻", systemPrompt: "You are Qwen Coder, an expert programming assistant.", description: "Qwen 2.5 Coder 32B", provider: "qwen-coder" },
  { id: "67", name: "Llama Fast", behavior: "Quick responses using Meta's Llama", emoji: "🦙", systemPrompt: "You are a helpful AI assistant.", description: "Llama 3.1 8B - Fast responses", provider: "roblox-rp" },
  { id: "68", name: "OpenAI Reasoning", behavior: "Advanced reasoning with o4 Mini", emoji: "🎯", systemPrompt: "You are an AI that thinks step by step.", description: "OpenAI o4 Mini - Reasoning", provider: "openai-reasoning" },
];

const DEFAULT_IMAGE_MODELS: ImageModel[] = [
  { id: "1", name: "Flux Pro", emoji: "⚡", apiEndpoint: "https://image.pollinations.ai/prompt", description: "High quality images", modelType: "flux-realism", systemPrompt: "ultra realistic, professional photography, 8K resolution" },
  { id: "2", name: "Anime Master", emoji: "🎌", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Anime style art", modelType: "flux", systemPrompt: "anime style, detailed anime art, vibrant colors" },
  { id: "3", name: "Photo Real", emoji: "📸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Photorealistic images", modelType: "flux-realism", systemPrompt: "photorealistic, DSLR quality, professional lighting" },
  { id: "4", name: "Fantasy Art", emoji: "🐉", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Fantasy themed art", modelType: "flux", systemPrompt: "fantasy art, magical, epic fantasy style" },
  { id: "5", name: "Cyberpunk", emoji: "🤖", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Futuristic cyberpunk", modelType: "flux", systemPrompt: "cyberpunk style, neon lights, futuristic" },
  { id: "6", name: "Oil Painting", emoji: "🖼️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Classic oil painting style", modelType: "flux", systemPrompt: "oil painting, classical art style, museum quality" },
  { id: "7", name: "Pixel Art", emoji: "👾", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Retro pixel art", modelType: "flux", systemPrompt: "pixel art style, retro gaming aesthetic" },
  { id: "8", name: "Watercolor", emoji: "🎨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Watercolor paintings", modelType: "flux", systemPrompt: "watercolor painting, soft colors, artistic" },
  { id: "9", name: "Comic Book", emoji: "💥", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Comic book style", modelType: "flux", systemPrompt: "comic book style, bold lines, vibrant" },
  { id: "10", name: "3D Render", emoji: "🎲", apiEndpoint: "https://image.pollinations.ai/prompt", description: "3D rendered images", modelType: "flux", systemPrompt: "3D render, octane render, highly detailed" },
  { id: "11", name: "Sketch", emoji: "✏️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Pencil sketch style", modelType: "flux", systemPrompt: "pencil sketch, hand drawn, detailed linework" },
  { id: "12", name: "Abstract", emoji: "🌀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Abstract art", modelType: "flux", systemPrompt: "abstract art, modern art, creative" },
  { id: "13", name: "Portrait Pro", emoji: "👤", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Portrait photography", modelType: "flux-realism", systemPrompt: "professional portrait, studio lighting, sharp focus on face" },
  { id: "14", name: "Landscape", emoji: "🏞️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Beautiful landscapes", modelType: "flux-realism", systemPrompt: "landscape photography, scenic, natural lighting" },
  { id: "15", name: "Steampunk", emoji: "⚙️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Steampunk aesthetic", modelType: "flux", systemPrompt: "steampunk style, brass and copper, victorian machinery" },
  { id: "16", name: "Horror", emoji: "👻", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Horror themed art", modelType: "flux", systemPrompt: "dark horror style, eerie atmosphere, unsettling" },
  { id: "17", name: "Minimalist", emoji: "⬜", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Minimalist design", modelType: "flux", systemPrompt: "minimalist design, clean, simple" },
  { id: "18", name: "Surreal", emoji: "🌈", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Surreal artwork", modelType: "flux", systemPrompt: "surrealist art, dreamlike, Salvador Dali inspired" },
  { id: "19", name: "Pop Art", emoji: "💫", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Pop art style", modelType: "flux", systemPrompt: "pop art style, Andy Warhol inspired, bold colors" },
  { id: "20", name: "Nature", emoji: "🌿", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Natural scenes", modelType: "flux-realism", systemPrompt: "nature photography, wildlife, natural beauty" },
  { id: "21", name: "Vintage", emoji: "📻", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Vintage aesthetic", modelType: "flux", systemPrompt: "vintage style, retro, nostalgic" },
  { id: "22", name: "Neon", emoji: "💡", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Neon lighting effects", modelType: "flux", systemPrompt: "neon lights, glowing, vibrant neon colors" },
  { id: "23", name: "Gothic", emoji: "🦇", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Gothic art style", modelType: "flux", systemPrompt: "gothic style, dark aesthetic, ornate" },
  { id: "24", name: "Children's Book", emoji: "📚", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Kids illustration", modelType: "flux", systemPrompt: "children's book illustration, cute, colorful" },
  { id: "25", name: "Sci-Fi", emoji: "🚀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Science fiction", modelType: "flux", systemPrompt: "sci-fi art, futuristic technology, space" },
  { id: "26", name: "Art Deco", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Art deco style", modelType: "flux", systemPrompt: "art deco style, 1920s aesthetic, geometric" },
  { id: "27", name: "Tattoo Design", emoji: "🖊️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Tattoo artwork", modelType: "flux", systemPrompt: "tattoo design, detailed linework, tattoo art" },
  { id: "28", name: "Logo Maker", emoji: "🏷️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Logo designs", modelType: "flux", systemPrompt: "logo design, professional, clean vector style" },
  { id: "29", name: "Cartoon", emoji: "🎪", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cartoon style", modelType: "flux", systemPrompt: "cartoon style, fun, animated" },
  { id: "30", name: "Dream Art", emoji: "💭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dreamlike imagery", modelType: "flux", systemPrompt: "dreamlike, ethereal, fantasy" },
  { id: "31", name: "Fashion Photo", emoji: "👠", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Fashion photography", modelType: "flux-realism", systemPrompt: "fashion photography, vogue style, high fashion" },
  { id: "32", name: "Food Art", emoji: "🍕", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Food photography", modelType: "flux-realism", systemPrompt: "food photography, appetizing, professional lighting" },
  { id: "33", name: "Architecture", emoji: "🏛️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Architectural visualization", modelType: "flux-realism", systemPrompt: "architectural photography, modern architecture" },
  { id: "34", name: "Product Shot", emoji: "📦", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Product photography", modelType: "flux-realism", systemPrompt: "product photography, commercial, studio lighting" },
  { id: "35", name: "Graffiti", emoji: "🎨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Street graffiti art", modelType: "flux", systemPrompt: "graffiti art, street art, urban" },
  { id: "36", name: "Stained Glass", emoji: "🌟", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Stained glass art", modelType: "flux", systemPrompt: "stained glass style, colorful, translucent" },
  { id: "37", name: "Origami", emoji: "🦢", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Paper folding art", modelType: "flux", systemPrompt: "origami style, paper art, folded paper" },
  { id: "38", name: "Mosaic", emoji: "🔲", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Mosaic tile art", modelType: "flux", systemPrompt: "mosaic art, tile pattern, ancient style" },
  { id: "39", name: "Chibi", emoji: "👶", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cute chibi style", modelType: "flux", systemPrompt: "chibi style, cute, kawaii" },
  { id: "40", name: "Vaporwave", emoji: "🌴", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Vaporwave aesthetic", modelType: "flux", systemPrompt: "vaporwave aesthetic, 80s, retrowave" },
  { id: "41", name: "Isometric", emoji: "🎮", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Isometric design", modelType: "flux", systemPrompt: "isometric design, 3D isometric, game art" },
  { id: "42", name: "Low Poly", emoji: "📐", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Low polygon art", modelType: "flux", systemPrompt: "low poly art, geometric, polygon style" },
  { id: "43", name: "Charcoal", emoji: "⬛", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Charcoal drawing", modelType: "flux", systemPrompt: "charcoal drawing, black and white, artistic" },
  { id: "44", name: "Impressionist", emoji: "🖌️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Impressionist painting", modelType: "flux", systemPrompt: "impressionist style, Monet inspired, soft brushstrokes" },
  { id: "45", name: "Baroque", emoji: "👑", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Baroque art style", modelType: "flux", systemPrompt: "baroque style, dramatic, ornate, classical" },
  { id: "46", name: "Ukiyo-e", emoji: "🌊", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Japanese woodblock", modelType: "flux", systemPrompt: "ukiyo-e style, Japanese woodblock print, traditional" },
  { id: "47", name: "Art Nouveau", emoji: "🌸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Art Nouveau style", modelType: "flux", systemPrompt: "art nouveau style, flowing lines, organic" },
  { id: "48", name: "Cubism", emoji: "🔷", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cubist art", modelType: "flux", systemPrompt: "cubist style, Picasso inspired, geometric shapes" },
  { id: "49", name: "Glitch Art", emoji: "📺", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Digital glitch effects", modelType: "flux", systemPrompt: "glitch art, digital distortion, corrupted" },
  { id: "50", name: "Synthwave", emoji: "🌆", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Synthwave aesthetic", modelType: "flux", systemPrompt: "synthwave style, 80s retro, sunset colors" },
  { id: "51", name: "Ceramic", emoji: "🏺", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Ceramic art style", modelType: "flux", systemPrompt: "ceramic art, pottery style, glazed" },
  { id: "52", name: "Embroidery", emoji: "🧵", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Embroidery art", modelType: "flux", systemPrompt: "embroidery style, stitched, textile art" },
  { id: "53", name: "Claymation", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Clay animation style", modelType: "flux", systemPrompt: "claymation style, stop motion, clay figures" },
  { id: "54", name: "Neon Noir", emoji: "🌃", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Neon noir style", modelType: "flux", systemPrompt: "neon noir, dark city, moody lighting" },
  { id: "55", name: "Marble Sculpture", emoji: "🗿", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Marble statue art", modelType: "flux", systemPrompt: "marble sculpture, classical statue, detailed" },
  { id: "56", name: "Sticker Design", emoji: "🔖", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cute sticker art", modelType: "flux", systemPrompt: "sticker design, cute, die cut style" },
  { id: "57", name: "Blueprint", emoji: "📋", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Technical blueprint", modelType: "flux", systemPrompt: "blueprint style, technical drawing, schematic" },
  { id: "58", name: "Paper Craft", emoji: "📜", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Paper cut art", modelType: "flux", systemPrompt: "paper craft, layered paper, cut out style" },
  { id: "59", name: "Holographic", emoji: "🔮", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Holographic effect", modelType: "flux", systemPrompt: "holographic style, iridescent, rainbow shimmer" },
  { id: "60", name: "Human Ultra", emoji: "🧑", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Ultra realistic humans", modelType: "flux-realism", systemPrompt: "ultra realistic human, perfect anatomy, professional portrait photography, detailed skin texture, natural expression" },
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
        const dbModels = data.map((model) => ({
          id: model.id,
          name: model.name,
          behavior: model.behavior,
          emoji: model.emoji,
          systemPrompt: model.system_prompt,
          description: model.description,
          provider: model.provider || "openai",
        }));
        
        // Get the new provider-based models from defaults (IDs 61-68)
        const providerModels = DEFAULT_MODELS.filter(m => parseInt(m.id) >= 61);
        
        // Check which provider models are not already in the database
        const existingNames = dbModels.map(m => m.name.toLowerCase());
        const newProviderModels = providerModels.filter(
          m => !existingNames.includes(m.name.toLowerCase())
        );
        
        // Merge database models with new provider models
        setAIModels([...dbModels, ...newProviderModels]);
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
