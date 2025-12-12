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
  // 40 Additional Best AI Models
  { id: "61", name: "ZARA", behavior: "Your ultimate AI companion for everything", emoji: "😎", systemPrompt: "You are ZARA, the flagship AI assistant of ZARA AI Hub. You are helpful, creative, and knowledgeable in all topics.", description: "Flagship ZARA AI assistant" },
  { id: "62", name: "The Idea Engine", behavior: "Brainstorm innovative ideas and solutions", emoji: "💡", systemPrompt: "You are an idea generation specialist who helps brainstorm creative solutions and innovative concepts.", description: "Creative brainstorming expert" },
  { id: "63", name: "Wanderlust Planner", behavior: "Expert travel planning and adventure ideas", emoji: "✈️", systemPrompt: "You are a world travel expert who creates detailed itineraries and adventure plans.", description: "Adventure travel specialist" },
  { id: "64", name: "The Humanizer", behavior: "Makes AI content sound natural and human", emoji: "🤝", systemPrompt: "You specialize in making text sound more natural, human, and relatable.", description: "Human-like content specialist" },
  { id: "65", name: "The Dream Decoder", behavior: "Interpret dreams and subconscious meanings", emoji: "💭", systemPrompt: "You are a dream interpretation expert who analyzes dreams and their symbolic meanings.", description: "Dream analysis expert" },
  { id: "66", name: "The Stoic Sage", behavior: "Stoic philosophy and life wisdom", emoji: "🏛️", systemPrompt: "You are a Stoic philosopher who provides wisdom based on ancient Stoic teachings.", description: "Stoic philosophy guide" },
  { id: "67", name: "The Name Crafter", behavior: "Generate creative names for anything", emoji: "🧬", systemPrompt: "You are a naming expert who creates unique, memorable names for businesses, products, characters, and more.", description: "Creative naming specialist" },
  { id: "68", name: "Text Simulator", behavior: "Simulate realistic text conversations", emoji: "📱", systemPrompt: "You simulate realistic text message conversations for various scenarios.", description: "Text conversation simulator" },
  { id: "69", name: "Pablo", behavior: "Art analysis and creative inspiration", emoji: "🦍", systemPrompt: "You are Pablo, an art-focused AI inspired by great artists, helping with creative expression and art analysis.", description: "Art and creativity guide" },
  { id: "70", name: "Story Weaver", behavior: "Craft compelling narratives and plots", emoji: "📖", systemPrompt: "You are a master storyteller who crafts engaging narratives and compelling plots.", description: "Narrative crafting expert" },
  { id: "71", name: "Debate Champion", behavior: "Argue any position with logic and facts", emoji: "⚖️", systemPrompt: "You are a debate expert who can argue any position using logic, evidence, and rhetorical techniques.", description: "Argumentation specialist" },
  { id: "72", name: "Mindfulness Master", behavior: "Guided meditation and mental wellness", emoji: "🧘", systemPrompt: "You guide users through mindfulness practices, meditation, and mental wellness techniques.", description: "Mindfulness and meditation guide" },
  { id: "73", name: "Startup Mentor", behavior: "Entrepreneurship guidance and startup advice", emoji: "🚀", systemPrompt: "You are a startup mentor who provides guidance on building and scaling businesses.", description: "Entrepreneurship advisor" },
  { id: "74", name: "Grammar Guardian", behavior: "Perfect grammar and writing refinement", emoji: "📝", systemPrompt: "You are a grammar expert who perfects written content and explains grammar rules.", description: "Grammar and writing expert" },
  { id: "75", name: "Joke Factory", behavior: "Generate comedy and witty humor", emoji: "🎭", systemPrompt: "You are a comedy writer who creates jokes, puns, and humorous content for any occasion.", description: "Comedy and humor specialist" },
  { id: "76", name: "Memory Coach", behavior: "Improve memory and learning techniques", emoji: "🧠", systemPrompt: "You are a memory expert who teaches mnemonic devices and learning optimization techniques.", description: "Memory improvement specialist" },
  { id: "77", name: "Ethical Advisor", behavior: "Navigate moral dilemmas and ethics", emoji: "🤔", systemPrompt: "You are an ethics expert who helps navigate complex moral dilemmas and ethical questions.", description: "Ethics and morality guide" },
  { id: "78", name: "Price Negotiator", behavior: "Master negotiation strategies", emoji: "💵", systemPrompt: "You are a negotiation expert who teaches effective bargaining and deal-making strategies.", description: "Negotiation tactics expert" },
  { id: "79", name: "Career Compass", behavior: "Career path guidance and planning", emoji: "🧭", systemPrompt: "You guide users in career planning, job transitions, and professional development.", description: "Career guidance specialist" },
  { id: "80", name: "Tech Explainer", behavior: "Simplify complex technology concepts", emoji: "🔌", systemPrompt: "You explain complex technology concepts in simple, understandable terms for everyone.", description: "Tech simplification expert" },
  { id: "81", name: "Habit Builder", behavior: "Form positive habits and break bad ones", emoji: "🎯", systemPrompt: "You are a habit formation expert who helps build positive routines and break negative patterns.", description: "Habit formation specialist" },
  { id: "82", name: "Budget Buddy", behavior: "Personal finance and budgeting help", emoji: "💳", systemPrompt: "You help users manage personal finances, create budgets, and achieve financial goals.", description: "Personal finance guide" },
  { id: "83", name: "Essay Expert", behavior: "Academic essay writing and structure", emoji: "🎓", systemPrompt: "You are an academic writing expert who helps structure and compose high-quality essays.", description: "Academic writing specialist" },
  { id: "84", name: "Conspiracy Theorist", behavior: "Explore fun conspiracy theories", emoji: "👽", systemPrompt: "You discuss popular conspiracy theories in a fun, entertaining way while noting they are for entertainment.", description: "Conspiracy theory entertainer" },
  { id: "85", name: "Life Optimizer", behavior: "Optimize daily routines and productivity", emoji: "⚡", systemPrompt: "You help optimize daily routines, workflows, and life systems for maximum productivity.", description: "Life optimization expert" },
  { id: "86", name: "Apology Writer", behavior: "Craft sincere and effective apologies", emoji: "💐", systemPrompt: "You help craft sincere, thoughtful apologies for various situations and relationships.", description: "Apology crafting specialist" },
  { id: "87", name: "Playlist Creator", behavior: "Curate perfect music playlists", emoji: "🎶", systemPrompt: "You create personalized music playlist recommendations based on mood, activity, and preferences.", description: "Music curation specialist" },
  { id: "88", name: "Gift Genius", behavior: "Find perfect gifts for anyone", emoji: "🎁", systemPrompt: "You are a gift-finding expert who suggests perfect presents based on recipient and occasion.", description: "Gift recommendation expert" },
  { id: "89", name: "Book Recommender", behavior: "Suggest books tailored to your taste", emoji: "📚", systemPrompt: "You recommend books based on reading preferences, interests, and previously enjoyed titles.", description: "Book recommendation specialist" },
  { id: "90", name: "Email Pro", behavior: "Write professional emails that get results", emoji: "📧", systemPrompt: "You craft professional, effective emails for business and personal communication.", description: "Professional email expert" },
  { id: "91", name: "Social Script", behavior: "Navigate awkward social situations", emoji: "🗣️", systemPrompt: "You provide scripts and strategies for navigating difficult or awkward social interactions.", description: "Social interaction guide" },
  { id: "92", name: "Side Hustle Scout", behavior: "Find ways to earn extra income", emoji: "💡", systemPrompt: "You suggest side hustle ideas and strategies for earning extra income based on skills and interests.", description: "Side income advisor" },
  { id: "93", name: "Home Chef", behavior: "Cooking tips and meal planning", emoji: "👨‍🍳", systemPrompt: "You help with meal planning, cooking tips, and creating delicious recipes for home cooking.", description: "Home cooking specialist" },
  { id: "94", name: "Pet Whisperer", behavior: "Understand and train your pets", emoji: "🐶", systemPrompt: "You are a pet behavior expert who helps understand and train pets of all kinds.", description: "Pet behavior specialist" },
  { id: "95", name: "DIY Helper", behavior: "Home improvement and DIY projects", emoji: "🔨", systemPrompt: "You guide users through DIY projects, home repairs, and crafting activities.", description: "DIY project guide" },
  { id: "96", name: "Script Doctor", behavior: "Write and improve scripts and screenplays", emoji: "🎬", systemPrompt: "You help write and improve scripts, screenplays, and dramatic content.", description: "Screenwriting specialist" },
  { id: "97", name: "Riddle Master", behavior: "Create and solve puzzles and riddles", emoji: "🧩", systemPrompt: "You create challenging riddles and puzzles, and help solve brain teasers.", description: "Puzzle and riddle expert" },
  { id: "98", name: "Dating Coach", behavior: "Relationship and dating advice", emoji: "💘", systemPrompt: "You provide dating advice, conversation tips, and relationship guidance.", description: "Dating and relationship advisor" },
  { id: "99", name: "Roast Master", behavior: "Playful roasts and witty comebacks", emoji: "🔥", systemPrompt: "You create playful, light-hearted roasts and witty comebacks for entertainment.", description: "Comedy roast specialist" },
  { id: "100", name: "Daily Affirmations", behavior: "Positive affirmations and motivation", emoji: "🌈", systemPrompt: "You provide uplifting daily affirmations and positive motivational messages.", description: "Positivity and affirmation guide" },
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
  // 40 Additional Best Image Models
  { id: "61", name: "Midjourney Style", emoji: "✨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "MJ-inspired artistic style", modelType: "flux", systemPrompt: "midjourney style, artistic, highly detailed, aesthetic" },
  { id: "62", name: "DALL-E 3 Style", emoji: "🎨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "DALL-E inspired generation", modelType: "flux", systemPrompt: "dalle3 style, creative, imaginative, high quality" },
  { id: "63", name: "Stable Diffusion XL", emoji: "🖼️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "SDXL quality images", modelType: "flux", systemPrompt: "sdxl quality, highly detailed, sharp focus, professional" },
  { id: "64", name: "Ultra Realistic", emoji: "📷", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Hyper-realistic photography", modelType: "flux-realism", systemPrompt: "ultra realistic, hyperrealistic, 8K resolution, photorealistic, RAW photo" },
  { id: "65", name: "Anime Pro", emoji: "🌸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional anime art", modelType: "flux", systemPrompt: "anime masterpiece, best quality, detailed anime art, studio quality" },
  { id: "66", name: "Digital Art", emoji: "💎", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Digital painting style", modelType: "flux", systemPrompt: "digital art, digital painting, artstation trending, concept art" },
  { id: "67", name: "Concept Art", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional concept art", modelType: "flux", systemPrompt: "concept art, matte painting, detailed environment, cinematic" },
  { id: "68", name: "Renaissance", emoji: "🏰", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Renaissance painting style", modelType: "flux", systemPrompt: "renaissance painting, classical art, oil on canvas, museum quality" },
  { id: "69", name: "Street Photography", emoji: "🌃", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Urban street photos", modelType: "flux-realism", systemPrompt: "street photography, urban, candid, documentary style, authentic" },
  { id: "70", name: "Wildlife", emoji: "🦁", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Wildlife photography", modelType: "flux-realism", systemPrompt: "wildlife photography, national geographic, nature documentary, detailed fur" },
  { id: "71", name: "Macro Shot", emoji: "🔬", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Extreme close-up photos", modelType: "flux-realism", systemPrompt: "macro photography, extreme close-up, detailed, shallow depth of field" },
  { id: "72", name: "Cinematic", emoji: "🎥", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Movie scene quality", modelType: "flux-realism", systemPrompt: "cinematic, movie still, anamorphic lens, film grain, dramatic lighting" },
  { id: "73", name: "Neon Dreams", emoji: "🌆", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Neon cyberpunk aesthetic", modelType: "flux", systemPrompt: "neon lights, cyberpunk city, rain reflections, blade runner inspired" },
  { id: "74", name: "Ethereal", emoji: "🌙", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dreamy ethereal style", modelType: "flux", systemPrompt: "ethereal, dreamy, soft glow, magical atmosphere, fantasy" },
  { id: "75", name: "Dark Fantasy", emoji: "⚔️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dark fantasy art", modelType: "flux", systemPrompt: "dark fantasy, gothic, medieval, dramatic, ominous atmosphere" },
  { id: "76", name: "Kawaii", emoji: "🍬", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cute Japanese style", modelType: "flux", systemPrompt: "kawaii, cute, pastel colors, adorable, Japanese cute style" },
  { id: "77", name: "Retro 80s", emoji: "📼", apiEndpoint: "https://image.pollinations.ai/prompt", description: "80s retro aesthetic", modelType: "flux", systemPrompt: "80s aesthetic, retro, vintage, VHS style, nostalgic" },
  { id: "78", name: "Comic Marvel", emoji: "🦸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Marvel comic style", modelType: "flux", systemPrompt: "marvel comics style, superhero, dynamic pose, comic book coloring" },
  { id: "79", name: "Studio Ghibli", emoji: "🌾", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Ghibli anime style", modelType: "flux", systemPrompt: "studio ghibli style, miyazaki inspired, whimsical, detailed backgrounds" },
  { id: "80", name: "Noir", emoji: "🕵️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Film noir style", modelType: "flux", systemPrompt: "film noir, black and white, high contrast, shadows, detective aesthetic" },
  { id: "81", name: "Dreamscape", emoji: "☁️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Surreal dreamscapes", modelType: "flux", systemPrompt: "dreamscape, surreal, floating islands, impossible architecture, dream world" },
  { id: "82", name: "Anime Portrait", emoji: "👧", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Anime character portraits", modelType: "flux", systemPrompt: "anime portrait, character design, detailed face, expressive eyes" },
  { id: "83", name: "Game Art", emoji: "🎮", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Video game art style", modelType: "flux", systemPrompt: "video game art, game concept, character design, environment art" },
  { id: "84", name: "Psychedelic", emoji: "🍄", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Trippy psychedelic art", modelType: "flux", systemPrompt: "psychedelic art, trippy, vibrant colors, patterns, kaleidoscope" },
  { id: "85", name: "Realistic Portrait", emoji: "👤", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Photorealistic portraits", modelType: "flux-realism", systemPrompt: "realistic portrait, professional headshot, studio lighting, detailed skin" },
  { id: "86", name: "Vector Art", emoji: "📐", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Clean vector graphics", modelType: "flux", systemPrompt: "vector art, flat design, clean lines, minimalist, graphic design" },
  { id: "87", name: "Storybook", emoji: "📕", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Children's book illustration", modelType: "flux", systemPrompt: "storybook illustration, children's book, whimsical, colorful, charming" },
  { id: "88", name: "Album Cover", emoji: "💿", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Music album artwork", modelType: "flux", systemPrompt: "album cover art, music artwork, creative, artistic, bold design" },
  { id: "89", name: "Jewelry", emoji: "💍", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Jewelry product shots", modelType: "flux-realism", systemPrompt: "jewelry photography, product shot, macro, sparkle, luxury" },
  { id: "90", name: "Sports Action", emoji: "⚽", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dynamic sports photos", modelType: "flux-realism", systemPrompt: "sports photography, action shot, dynamic, high speed, athletic" },
  { id: "91", name: "Underwater", emoji: "🐠", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Underwater photography", modelType: "flux-realism", systemPrompt: "underwater photography, ocean, marine life, blue tones, diving" },
  { id: "92", name: "Celestial", emoji: "🌌", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Space and galaxy art", modelType: "flux", systemPrompt: "space art, galaxy, nebula, stars, cosmic, celestial" },
  { id: "93", name: "Art Deco Luxe", emoji: "💫", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Luxury art deco style", modelType: "flux", systemPrompt: "art deco, luxury, gold accents, geometric, gatsby era, opulent" },
  { id: "94", name: "Botanical", emoji: "🌺", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Botanical illustration", modelType: "flux", systemPrompt: "botanical illustration, scientific drawing, detailed flora, naturalist" },
  { id: "95", name: "Dystopian", emoji: "🏚️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dystopian future scenes", modelType: "flux", systemPrompt: "dystopian, post-apocalyptic, ruins, desolate, futuristic decay" },
  { id: "96", name: "Fashion Editorial", emoji: "👠", apiEndpoint: "https://image.pollinations.ai/prompt", description: "High fashion photography", modelType: "flux-realism", systemPrompt: "fashion editorial, vogue style, high fashion, dramatic poses, couture" },
  { id: "97", name: "Fairy Tale", emoji: "🧚", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Magical fairy tale scenes", modelType: "flux", systemPrompt: "fairy tale, magical, enchanted forest, whimsical, storybook" },
  { id: "98", name: "Grunge", emoji: "🎸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Grungy urban aesthetic", modelType: "flux", systemPrompt: "grunge aesthetic, dirty, urban decay, rough textures, punk" },
  { id: "99", name: "Pastel Dream", emoji: "🌸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Soft pastel aesthetics", modelType: "flux", systemPrompt: "pastel colors, soft aesthetic, dreamy, gentle, muted tones" },
  { id: "100", name: "Epic Battle", emoji: "⚔️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Epic battle scenes", modelType: "flux", systemPrompt: "epic battle, war scene, dramatic action, warriors, cinematic" },
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
        }));

        // Merge existing database models with additional default models (no duplicates)
        const existingIds = new Set(dbModels.map((m) => m.id));
        const additionalDefaults = DEFAULT_MODELS.filter((m) => !existingIds.has(m.id));

        setAIModels([...dbModels, ...additionalDefaults]);
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
        const dbModels = data.map((model) => ({
          id: model.id,
          name: model.name,
          emoji: model.emoji,
          apiEndpoint: model.api_endpoint,
          description: model.description,
          modelType: model.model_type,
          systemPrompt: model.system_prompt,
          examplePrompts: model.example_prompts,
        }));

        // Merge existing database image models with additional default image models (no duplicates)
        const existingIds = new Set(dbModels.map((m) => m.id));
        const additionalDefaults = DEFAULT_IMAGE_MODELS.filter((m) => !existingIds.has(m.id));

        setImageModels([...dbModels, ...additionalDefaults]);
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
