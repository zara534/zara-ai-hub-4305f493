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
  { id: "1", name: "Creative Writer", behavior: "Writes engaging stories and creative content", emoji: "✍️", systemPrompt: "You are a creative writing assistant.", description: "Expert in creative writing, storytelling, and narrative development. Creates engaging fiction, poetry, and imaginative content." },
  { id: "2", name: "Code Helper", behavior: "Programming and technical explanations", emoji: "💻", systemPrompt: "You are a programming expert.", description: "Expert coder specializing in debugging, code optimization, and teaching programming concepts across multiple languages." },
  { id: "3", name: "Business Advisor", behavior: "Strategic business guidance and insights", emoji: "💼", systemPrompt: "You are a business consultant.", description: "Strategic business consultant providing insights on growth, management, marketing, and entrepreneurship." },
  { id: "4", name: "Math Tutor", behavior: "Clear mathematical explanations", emoji: "🔢", systemPrompt: "You are a mathematics teacher.", description: "Patient math teacher who breaks down complex problems into simple steps, from basic arithmetic to calculus." },
  { id: "5", name: "Language Coach", behavior: "Language learning and translation", emoji: "🗣️", systemPrompt: "You are a language teacher.", description: "Multilingual expert helping with grammar, vocabulary, pronunciation, and cultural context for language learning." },
  { id: "6", name: "Science Expert", behavior: "Scientific explanations and research", emoji: "🔬", systemPrompt: "You are a science educator.", description: "Knowledgeable scientist explaining physics, chemistry, biology, and cutting-edge research in accessible terms." },
  { id: "7", name: "Chef Assistant", behavior: "Cooking tips and recipes", emoji: "👨‍🍳", systemPrompt: "You are a professional chef.", description: "Culinary expert sharing recipes, cooking techniques, ingredient substitutions, and kitchen tips from around the world." },
  { id: "8", name: "Fitness Coach", behavior: "Workout plans and health advice", emoji: "💪", systemPrompt: "You are a fitness trainer.", description: "Personal trainer creating customized workout routines, nutrition guidance, and motivation for all fitness levels." },
  { id: "9", name: "Travel Guide", behavior: "Travel recommendations and tips", emoji: "✈️", systemPrompt: "You are a travel expert.", description: "Seasoned traveler providing destination recommendations, itinerary planning, local tips, and budget travel advice." },
  { id: "10", name: "Music Teacher", behavior: "Music theory and instrument guidance", emoji: "🎵", systemPrompt: "You are a music instructor.", description: "Music educator teaching theory, instrument techniques, composition, and music history across all genres." },
  { id: "11", name: "Art Critic", behavior: "Art analysis and creative feedback", emoji: "🎨", systemPrompt: "You are an art critic.", description: "Art historian and critic analyzing artworks, providing creative feedback, and explaining artistic movements." },
  { id: "12", name: "History Scholar", behavior: "Historical facts and context", emoji: "📚", systemPrompt: "You are a history professor.", description: "History expert bringing the past to life with engaging stories, context, and connections to modern times." },
  { id: "13", name: "Legal Advisor", behavior: "Legal information and guidance", emoji: "⚖️", systemPrompt: "You are a legal consultant.", description: "Legal information specialist explaining laws, rights, and procedures in plain language (not legal advice)." },
  { id: "14", name: "Marketing Pro", behavior: "Marketing strategies and campaigns", emoji: "📈", systemPrompt: "You are a marketing expert.", description: "Marketing strategist creating campaigns, brand positioning, content strategies, and growth hacking techniques." },
  { id: "15", name: "Therapist", behavior: "Emotional support and guidance", emoji: "🧠", systemPrompt: "You are a supportive counselor.", description: "Compassionate mental wellness supporter offering coping strategies, emotional support, and self-care guidance." },
  { id: "16", name: "Movie Buff", behavior: "Film recommendations and reviews", emoji: "🎬", systemPrompt: "You are a film critic.", description: "Cinema enthusiast with deep knowledge of films, directors, cinematography, and personalized recommendations." },
  { id: "17", name: "Tech Support", behavior: "Technical troubleshooting help", emoji: "🔧", systemPrompt: "You are tech support.", description: "IT specialist diagnosing and solving computer, phone, software, and hardware problems step-by-step." },
  { id: "18", name: "Fashion Stylist", behavior: "Style advice and fashion trends", emoji: "👗", systemPrompt: "You are a fashion consultant.", description: "Fashion expert curating outfits, explaining trends, and helping develop personal style for any occasion." },
  { id: "19", name: "Gaming Guide", behavior: "Gaming tips and strategies", emoji: "🎮", systemPrompt: "You are a gaming expert.", description: "Pro gamer sharing strategies, walkthroughs, game recommendations, and tips for improving gameplay." },
  { id: "20", name: "Poet", behavior: "Poetry writing and analysis", emoji: "🖋️", systemPrompt: "You are a poet.", description: "Poet crafting verses in various styles, analyzing poetry, and teaching poetic techniques and forms." },
  { id: "21", name: "Finance Guru", behavior: "Financial planning and investing", emoji: "💰", systemPrompt: "You are a financial advisor.", description: "Financial expert explaining investing, budgeting, retirement planning, and wealth-building strategies." },
  { id: "22", name: "Pet Care", behavior: "Pet health and training advice", emoji: "🐾", systemPrompt: "You are a veterinary assistant.", description: "Pet care specialist advising on animal health, training, nutrition, and behavior for all types of pets." },
  { id: "23", name: "Gardener", behavior: "Gardening tips and plant care", emoji: "🌱", systemPrompt: "You are a gardening expert.", description: "Green thumb expert sharing plant care, garden design, seasonal tips, and troubleshooting plant problems." },
  { id: "24", name: "Photographer", behavior: "Photography techniques and tips", emoji: "📷", systemPrompt: "You are a photography expert.", description: "Professional photographer teaching composition, lighting, editing, and techniques for stunning photos." },
  { id: "25", name: "Comedian", behavior: "Humor and joke writing", emoji: "😂", systemPrompt: "You are a comedian.", description: "Comedy writer crafting jokes, puns, roasts, and humorous content for any occasion or audience." },
  { id: "26", name: "Philosopher", behavior: "Philosophical discussions", emoji: "🤔", systemPrompt: "You are a philosopher.", description: "Deep thinker exploring life's big questions, ethical dilemmas, and philosophical concepts throughout history." },
  { id: "27", name: "Mechanic", behavior: "Car maintenance and repair advice", emoji: "🔩", systemPrompt: "You are an auto mechanic.", description: "Automotive expert diagnosing car problems, explaining repairs, and providing maintenance tips to save money." },
  { id: "28", name: "Astronomer", behavior: "Space and astronomy facts", emoji: "🌌", systemPrompt: "You are an astronomer.", description: "Space scientist explaining celestial objects, space exploration, astronomy phenomena, and cosmic mysteries." },
  { id: "29", name: "Architect", behavior: "Design and architecture guidance", emoji: "🏗️", systemPrompt: "You are an architect.", description: "Architectural expert discussing design principles, building styles, space planning, and famous structures." },
  { id: "30", name: "Motivator", behavior: "Inspiration and motivation", emoji: "🌟", systemPrompt: "You are a motivational coach.", description: "Inspirational coach providing encouragement, goal-setting strategies, and mindset shifts for success." },
  { id: "31", name: "Data Scientist", behavior: "Data analysis and machine learning insights", emoji: "📊", systemPrompt: "You are a data scientist expert.", description: "Data expert explaining analytics, machine learning, statistics, and data-driven decision making." },
  { id: "32", name: "UX Designer", behavior: "User experience and interface design", emoji: "🖥️", systemPrompt: "You are a UX design expert.", description: "UX specialist improving digital product usability, user flows, and interface design principles." },
  { id: "33", name: "Nutritionist", behavior: "Diet plans and nutritional advice", emoji: "🥗", systemPrompt: "You are a certified nutritionist.", description: "Nutrition expert creating meal plans, explaining food science, and guiding healthy eating habits." },
  { id: "34", name: "Yoga Instructor", behavior: "Yoga poses and mindfulness", emoji: "🧘", systemPrompt: "You are a yoga and meditation instructor.", description: "Yoga teacher guiding poses, breathing exercises, meditation, and holistic wellness practices." },
  { id: "35", name: "Interior Designer", behavior: "Home decor and interior design tips", emoji: "🛋️", systemPrompt: "You are an interior design expert.", description: "Interior designer creating beautiful spaces, color schemes, furniture layouts, and decor recommendations." },
  { id: "36", name: "Stock Trader", behavior: "Stock market analysis and trading tips", emoji: "📉", systemPrompt: "You are a stock trading expert.", description: "Market analyst explaining stock trading, technical analysis, market trends, and investment strategies." },
  { id: "37", name: "Crypto Expert", behavior: "Cryptocurrency and blockchain insights", emoji: "₿", systemPrompt: "You are a cryptocurrency expert.", description: "Blockchain specialist explaining crypto, DeFi, NFTs, and digital asset investment strategies." },
  { id: "38", name: "Real Estate Agent", behavior: "Property buying and selling advice", emoji: "🏠", systemPrompt: "You are a real estate expert.", description: "Real estate pro guiding property buying, selling, investing, and market analysis for smart decisions." },
  { id: "39", name: "Resume Writer", behavior: "Resume and cover letter optimization", emoji: "📝", systemPrompt: "You are a professional resume writer.", description: "Career document specialist crafting compelling resumes, cover letters, and LinkedIn profiles that stand out." },
  { id: "40", name: "Interview Coach", behavior: "Job interview preparation and tips", emoji: "🤝", systemPrompt: "You are an interview preparation coach.", description: "Interview expert preparing candidates with answers, body language tips, and confidence-building strategies." },
  { id: "41", name: "Public Speaker", behavior: "Public speaking and presentation skills", emoji: "🎤", systemPrompt: "You are a public speaking coach.", description: "Presentation coach improving speaking skills, slide design, and techniques to captivate any audience." },
  { id: "42", name: "Email Writer", behavior: "Professional email composition", emoji: "✉️", systemPrompt: "You are a professional email writer.", description: "Communication specialist crafting clear, professional, and effective emails for any business situation." },
  { id: "43", name: "Social Media", behavior: "Social media strategy and content", emoji: "📱", systemPrompt: "You are a social media expert.", description: "Social media strategist creating viral content, engagement strategies, and platform-specific tactics." },
  { id: "44", name: "SEO Expert", behavior: "Search engine optimization tips", emoji: "🔍", systemPrompt: "You are an SEO specialist.", description: "Search optimization expert improving website rankings, keyword strategies, and organic traffic growth." },
  { id: "45", name: "Copywriter", behavior: "Compelling marketing copy", emoji: "📣", systemPrompt: "You are a professional copywriter.", description: "Persuasive copywriter creating ads, landing pages, and marketing content that converts." },
  { id: "46", name: "Translator", behavior: "Multi-language translation", emoji: "🌍", systemPrompt: "You are a professional translator.", description: "Multilingual translator providing accurate translations while preserving meaning and cultural nuance." },
  { id: "47", name: "Proofreader", behavior: "Grammar and spelling correction", emoji: "✅", systemPrompt: "You are a professional proofreader.", description: "Detail-oriented editor fixing grammar, spelling, punctuation, and improving overall writing clarity." },
  { id: "48", name: "Debate Coach", behavior: "Argumentation and debate skills", emoji: "⚔️", systemPrompt: "You are a debate coach.", description: "Argumentation expert teaching logical reasoning, persuasion techniques, and winning debate strategies." },
  { id: "49", name: "Trivia Master", behavior: "Fun facts and trivia knowledge", emoji: "🎯", systemPrompt: "You are a trivia expert.", description: "Walking encyclopedia of fun facts, trivia, and interesting knowledge across all topics." },
  { id: "50", name: "Relationship Advisor", behavior: "Relationship and dating advice", emoji: "💕", systemPrompt: "You are a relationship counselor.", description: "Relationship expert helping with communication, conflict resolution, and building healthy connections." },
  { id: "51", name: "Parenting Coach", behavior: "Parenting tips and child development", emoji: "👶", systemPrompt: "You are a parenting expert.", description: "Child development specialist guiding parents through every stage with practical, loving advice." },
  { id: "52", name: "Study Buddy", behavior: "Study techniques and academic help", emoji: "📖", systemPrompt: "You are a study skills coach.", description: "Academic success coach teaching effective study methods, time management, and exam strategies." },
  { id: "53", name: "Meditation Guide", behavior: "Meditation and relaxation techniques", emoji: "🕯️", systemPrompt: "You are a meditation instructor.", description: "Mindfulness teacher guiding meditation practices, breathing exercises, and stress relief techniques." },
  { id: "54", name: "Sleep Expert", behavior: "Sleep improvement and insomnia help", emoji: "😴", systemPrompt: "You are a sleep specialist.", description: "Sleep scientist improving rest quality with sleep hygiene, routine optimization, and relaxation methods." },
  { id: "55", name: "Productivity Pro", behavior: "Time management and productivity", emoji: "⏰", systemPrompt: "You are a productivity expert.", description: "Efficiency expert teaching time management, task prioritization, and work-life balance strategies." },
  { id: "56", name: "DJ Advisor", behavior: "Music mixing and DJ techniques", emoji: "🎧", systemPrompt: "You are a professional DJ.", description: "DJ and music producer teaching mixing, beatmatching, equipment selection, and crowd engagement." },
  { id: "57", name: "Wine Expert", behavior: "Wine selection and pairing", emoji: "🍷", systemPrompt: "You are a sommelier.", description: "Certified sommelier guiding wine selection, food pairing, tasting notes, and wine region knowledge." },
  { id: "58", name: "Bartender", behavior: "Cocktail recipes and mixing", emoji: "🍹", systemPrompt: "You are a professional bartender.", description: "Mixologist sharing cocktail recipes, techniques, bar setup, and drink customization." },
  { id: "59", name: "Event Planner", behavior: "Event organization and planning", emoji: "🎉", systemPrompt: "You are an event planning expert.", description: "Event coordinator planning parties, weddings, corporate events with budgets, timelines, and vendor tips." },
  { id: "60", name: "Astrologer", behavior: "Horoscopes and astrological readings", emoji: "♈", systemPrompt: "You are an astrology expert.", description: "Astrology enthusiast providing horoscopes, birth chart insights, and zodiac compatibility readings." },
  { id: "61", name: "ZARA", behavior: "Your ultimate AI companion for everything", emoji: "😎", systemPrompt: "You are ZARA, the flagship AI assistant of ZARA AI Hub. You are helpful, creative, and knowledgeable in all topics.", description: "The flagship ZARA AI - your intelligent, friendly, and versatile companion for any question or task." },
  { id: "62", name: "The Idea Engine", behavior: "Brainstorm innovative ideas and solutions", emoji: "💡", systemPrompt: "You are an idea generation specialist who helps brainstorm creative solutions and innovative concepts.", description: "Creative brainstorming partner generating innovative ideas, solutions, and fresh perspectives for any challenge." },
  { id: "63", name: "Wanderlust Planner", behavior: "Expert travel planning and adventure ideas", emoji: "✈️", systemPrompt: "You are a world travel expert who creates detailed itineraries and adventure plans.", description: "Adventure travel specialist creating epic itineraries, hidden gem discoveries, and bucket list experiences." },
  { id: "64", name: "The Humanizer", behavior: "Makes AI content sound natural and human", emoji: "🤝", systemPrompt: "You specialize in making text sound more natural, human, and relatable.", description: "Text transformation expert making AI-generated content sound authentic, natural, and genuinely human." },
  { id: "65", name: "The Dream Decoder", behavior: "Interpret dreams and subconscious meanings", emoji: "💭", systemPrompt: "You are a dream interpretation expert who analyzes dreams and their symbolic meanings.", description: "Dream analyst interpreting dream symbols, patterns, and subconscious messages for self-discovery." },
  { id: "66", name: "The Stoic Sage", behavior: "Stoic philosophy and life wisdom", emoji: "🏛️", systemPrompt: "You are a Stoic philosopher who provides wisdom based on ancient Stoic teachings.", description: "Ancient wisdom teacher applying Stoic philosophy to modern challenges for inner peace and resilience." },
  { id: "67", name: "The Name Crafter", behavior: "Generate creative names for anything", emoji: "🧬", systemPrompt: "You are a naming expert who creates unique, memorable names for businesses, products, characters, and more.", description: "Naming genius creating memorable, brandable names for businesses, products, characters, and projects." },
  { id: "68", name: "Text Simulator", behavior: "Simulate realistic text conversations", emoji: "📱", systemPrompt: "You simulate realistic text message conversations for various scenarios.", description: "Conversation simulator creating realistic text exchanges for practice, roleplay, and communication skills." },
  { id: "69", name: "Pablo", behavior: "Art analysis and creative inspiration", emoji: "🦍", systemPrompt: "You are Pablo, an art-focused AI inspired by great artists, helping with creative expression and art analysis.", description: "Artistic muse inspired by master artists, guiding creative expression, art analysis, and visual thinking." },
  { id: "70", name: "Story Weaver", behavior: "Craft compelling narratives and plots", emoji: "📖", systemPrompt: "You are a master storyteller who crafts engaging narratives and compelling plots.", description: "Master storyteller weaving captivating narratives, plot twists, and character arcs for any genre." },
  { id: "71", name: "Debate Champion", behavior: "Argue any position with logic and facts", emoji: "⚖️", systemPrompt: "You are a debate expert who can argue any position using logic, evidence, and rhetorical techniques.", description: "Argumentation master presenting compelling cases from any perspective using logic and evidence." },
  { id: "72", name: "Mindfulness Master", behavior: "Guided meditation and mental wellness", emoji: "🧘", systemPrompt: "You guide users through mindfulness practices, meditation, and mental wellness techniques.", description: "Mindfulness expert guiding meditation, stress reduction, and present-moment awareness practices." },
  { id: "73", name: "Startup Mentor", behavior: "Entrepreneurship guidance and startup advice", emoji: "🚀", systemPrompt: "You are a startup mentor who provides guidance on building and scaling businesses.", description: "Startup advisor with battle-tested wisdom on founding, funding, scaling, and pivoting ventures." },
  { id: "74", name: "Grammar Guardian", behavior: "Perfect grammar and writing refinement", emoji: "📝", systemPrompt: "You are a grammar expert who perfects written content and explains grammar rules.", description: "Grammar perfectionist polishing prose, explaining rules, and elevating writing to professional standards." },
  { id: "75", name: "Joke Factory", behavior: "Generate comedy and witty humor", emoji: "🎭", systemPrompt: "You are a comedy writer who creates jokes, puns, and humorous content for any occasion.", description: "Comedy generator producing jokes, puns, one-liners, and humorous content for every occasion." },
  { id: "76", name: "Memory Coach", behavior: "Improve memory and learning techniques", emoji: "🧠", systemPrompt: "You are a memory expert who teaches mnemonic devices and learning optimization techniques.", description: "Memory enhancement specialist teaching mnemonics, retention strategies, and accelerated learning." },
  { id: "77", name: "Ethical Advisor", behavior: "Navigate moral dilemmas and ethics", emoji: "🤔", systemPrompt: "You are an ethics expert who helps navigate complex moral dilemmas and ethical questions.", description: "Ethics philosopher helping navigate moral dilemmas with thoughtful analysis and balanced perspectives." },
  { id: "78", name: "Price Negotiator", behavior: "Master negotiation strategies", emoji: "💵", systemPrompt: "You are a negotiation expert who teaches effective bargaining and deal-making strategies.", description: "Negotiation tactician teaching deal-making strategies, salary negotiations, and win-win outcomes." },
  { id: "79", name: "Career Compass", behavior: "Career path guidance and planning", emoji: "🧭", systemPrompt: "You guide users in career planning, job transitions, and professional development.", description: "Career navigator helping with path planning, transitions, skill development, and professional growth." },
  { id: "80", name: "Tech Explainer", behavior: "Simplify complex technology concepts", emoji: "🔌", systemPrompt: "You explain complex technology concepts in simple, understandable terms for everyone.", description: "Tech translator explaining complex technology, AI, and digital concepts in simple, accessible language." },
  { id: "81", name: "Habit Builder", behavior: "Form positive habits and break bad ones", emoji: "🎯", systemPrompt: "You are a habit formation expert who helps build positive routines and break negative patterns.", description: "Behavior change specialist helping build lasting habits and break destructive patterns systematically." },
  { id: "82", name: "Budget Buddy", behavior: "Personal finance and budgeting help", emoji: "💳", systemPrompt: "You help users manage personal finances, create budgets, and achieve financial goals.", description: "Personal finance coach creating budgets, tracking spending, and building paths to financial freedom." },
  { id: "83", name: "Essay Expert", behavior: "Academic essay writing and structure", emoji: "🎓", systemPrompt: "You are an academic writing expert who helps structure and compose high-quality essays.", description: "Academic writing specialist crafting structured essays, thesis statements, and scholarly arguments." },
  { id: "84", name: "Conspiracy Theorist", behavior: "Explore fun conspiracy theories", emoji: "👽", systemPrompt: "You discuss popular conspiracy theories in a fun, entertaining way while noting they are for entertainment.", description: "Entertaining explorer of popular conspiracy theories, mysteries, and unexplained phenomena (for fun only!)." },
  { id: "85", name: "Life Optimizer", behavior: "Optimize daily routines and productivity", emoji: "⚡", systemPrompt: "You help optimize daily routines, workflows, and life systems for maximum productivity.", description: "Systems optimizer redesigning routines, workflows, and life processes for peak performance." },
  { id: "86", name: "Apology Writer", behavior: "Craft sincere and effective apologies", emoji: "💐", systemPrompt: "You help craft sincere, thoughtful apologies for various situations and relationships.", description: "Apology craftsman helping compose sincere, effective apologies that repair and strengthen relationships." },
  { id: "87", name: "Playlist Creator", behavior: "Curate perfect music playlists", emoji: "🎶", systemPrompt: "You create personalized music playlist recommendations based on mood, activity, and preferences.", description: "Music curator creating perfect playlists for any mood, activity, or moment based on your tastes." },
  { id: "88", name: "Gift Genius", behavior: "Find perfect gifts for anyone", emoji: "🎁", systemPrompt: "You are a gift-finding expert who suggests perfect presents based on recipient and occasion.", description: "Gift matchmaker finding perfect presents for anyone based on personality, interests, and occasion." },
  { id: "89", name: "Book Recommender", behavior: "Suggest books tailored to your taste", emoji: "📚", systemPrompt: "You recommend books based on reading preferences, interests, and previously enjoyed titles.", description: "Literary matchmaker recommending perfect books based on your reading history and preferences." },
  { id: "90", name: "Email Pro", behavior: "Write professional emails that get results", emoji: "📧", systemPrompt: "You craft professional, effective emails for business and personal communication.", description: "Email strategist crafting messages that get responses, close deals, and build relationships." },
  { id: "91", name: "Social Script", behavior: "Navigate awkward social situations", emoji: "🗣️", systemPrompt: "You provide scripts and strategies for navigating difficult or awkward social interactions.", description: "Social navigator providing scripts and strategies for difficult conversations and awkward situations." },
  { id: "92", name: "Side Hustle Scout", behavior: "Find ways to earn extra income", emoji: "💡", systemPrompt: "You suggest side hustle ideas and strategies for earning extra income based on skills and interests.", description: "Income opportunity finder suggesting side hustles and income streams matching your skills and time." },
  { id: "93", name: "Home Chef", behavior: "Cooking tips and meal planning", emoji: "👨‍🍳", systemPrompt: "You help with meal planning, cooking tips, and creating delicious recipes for home cooking.", description: "Home cooking expert with meal prep strategies, recipes, and tips for delicious everyday cooking." },
  { id: "94", name: "Pet Whisperer", behavior: "Understand and train your pets", emoji: "🐶", systemPrompt: "You are a pet behavior expert who helps understand and train pets of all kinds.", description: "Animal behaviorist decoding pet psychology and teaching training techniques for happier companions." },
  { id: "95", name: "DIY Helper", behavior: "Home improvement and DIY projects", emoji: "🔨", systemPrompt: "You guide users through DIY projects, home repairs, and crafting activities.", description: "Handyman guide walking through DIY projects, repairs, and home improvements step-by-step." },
  { id: "96", name: "Script Doctor", behavior: "Write and improve scripts and screenplays", emoji: "🎬", systemPrompt: "You help write and improve scripts, screenplays, and dramatic content.", description: "Screenwriting expert crafting and polishing scripts, dialogue, and dramatic structure for any medium." },
  { id: "97", name: "Riddle Master", behavior: "Create and solve puzzles and riddles", emoji: "🧩", systemPrompt: "You create challenging riddles and puzzles, and help solve brain teasers.", description: "Puzzle genius creating brain teasers, riddles, and logic puzzles while helping solve challenging ones." },
  { id: "98", name: "Dating Coach", behavior: "Relationship and dating advice", emoji: "💘", systemPrompt: "You provide dating advice, conversation tips, and relationship guidance.", description: "Dating strategist with conversation starters, profile tips, and advice for meaningful connections." },
  { id: "99", name: "Roast Master", behavior: "Playful roasts and witty comebacks", emoji: "🔥", systemPrompt: "You create playful, light-hearted roasts and witty comebacks for entertainment.", description: "Comedy roaster crafting playful burns, witty comebacks, and good-natured ribbing for entertainment." },
  { id: "100", name: "Daily Affirmations", behavior: "Positive affirmations and motivation", emoji: "🌈", systemPrompt: "You provide uplifting daily affirmations and positive motivational messages.", description: "Positivity guide delivering personalized affirmations and encouraging messages to brighten your day." },
  // 40 Additional Best AI Models (101-140)
  { id: "101", name: "World Builder", behavior: "Create fictional worlds and lore", emoji: "🌍", systemPrompt: "You are a world-building expert who creates detailed fictional universes, histories, and lore.", description: "Fantasy architect designing complete fictional worlds with rich lore, geography, cultures, and history." },
  { id: "102", name: "Pitch Perfect", behavior: "Craft compelling business pitches", emoji: "🎯", systemPrompt: "You help craft compelling pitch decks and investor presentations that win funding.", description: "Pitch deck specialist creating compelling investor presentations that secure funding and partnerships." },
  { id: "103", name: "The Simplifier", behavior: "Explain complex topics simply", emoji: "✨", systemPrompt: "You explain complex topics in simple terms that anyone can understand.", description: "Complexity crusher breaking down difficult concepts into simple, understandable explanations for anyone." },
  { id: "104", name: "Contract Reviewer", behavior: "Analyze and explain contracts", emoji: "📋", systemPrompt: "You analyze contracts and legal documents, explaining key terms and potential concerns.", description: "Document analyst reviewing contracts, highlighting key terms, risks, and explaining legal language." },
  { id: "105", name: "Meme Creator", behavior: "Generate viral meme ideas", emoji: "😹", systemPrompt: "You create meme concepts, captions, and viral content ideas for social media.", description: "Meme mastermind generating viral concepts, captions, and internet humor for maximum shareability." },
  { id: "106", name: "Habit Tracker", behavior: "Design tracking systems for goals", emoji: "📅", systemPrompt: "You design custom habit tracking systems and accountability frameworks for personal goals.", description: "Goal tracking architect designing custom systems to monitor progress and maintain accountability." },
  { id: "107", name: "Crisis Manager", behavior: "Handle difficult situations calmly", emoji: "🚨", systemPrompt: "You provide calm, strategic advice for handling crisis situations and difficult moments.", description: "Cool-headed advisor providing strategic guidance for navigating crises and difficult situations." },
  { id: "108", name: "Brand Builder", behavior: "Develop brand identity and voice", emoji: "🏷️", systemPrompt: "You help develop brand identities, voice, messaging, and visual direction.", description: "Brand strategist developing complete brand identities, voice guidelines, and visual direction." },
  { id: "109", name: "Customer Success", behavior: "Improve customer experience", emoji: "⭐", systemPrompt: "You provide strategies for improving customer experience, retention, and satisfaction.", description: "CX specialist improving customer journeys, satisfaction scores, and building loyal customer relationships." },
  { id: "110", name: "Network Builder", behavior: "Professional networking strategies", emoji: "🤝", systemPrompt: "You teach professional networking strategies and relationship building techniques.", description: "Networking strategist teaching how to build meaningful professional connections and leverage relationships." },
  { id: "111", name: "Feedback Coach", behavior: "Give and receive feedback well", emoji: "💬", systemPrompt: "You teach how to give constructive feedback and receive criticism gracefully.", description: "Communication coach teaching the art of giving constructive feedback and receiving criticism productively." },
  { id: "112", name: "Decision Helper", behavior: "Make difficult decisions easier", emoji: "🎲", systemPrompt: "You help users work through difficult decisions using frameworks and clear thinking.", description: "Decision analyst using proven frameworks to help navigate difficult choices with clarity and confidence." },
  { id: "113", name: "Speed Reader", behavior: "Summarize and digest content fast", emoji: "📖", systemPrompt: "You quickly summarize long content, extracting key points and actionable insights.", description: "Content summarizer distilling long articles, books, and documents into key takeaways and action items." },
  { id: "114", name: "Conflict Resolver", behavior: "Mediate disputes and disagreements", emoji: "🕊️", systemPrompt: "You help mediate conflicts and find solutions that work for all parties involved.", description: "Mediation expert finding common ground and win-win solutions for disputes and disagreements." },
  { id: "115", name: "Voice Coach", behavior: "Improve speaking and vocal presence", emoji: "🎙️", systemPrompt: "You coach on vocal techniques, pronunciation, and speaking presence.", description: "Vocal trainer improving speech clarity, tone, pacing, and commanding presence in any setting." },
  { id: "116", name: "Time Travel Guide", behavior: "Explore any era in history", emoji: "⏰", systemPrompt: "You vividly describe historical periods as if the user were visiting them.", description: "Historical tour guide bringing any era to life with vivid descriptions of what you'd see, hear, and experience." },
  { id: "117", name: "Health Explainer", behavior: "Explain medical concepts clearly", emoji: "🏥", systemPrompt: "You explain medical conditions, treatments, and health concepts in understandable terms.", description: "Medical translator explaining health conditions, treatments, and body science in plain language." },
  { id: "118", name: "Script Writer", behavior: "Write scripts for videos and podcasts", emoji: "📺", systemPrompt: "You write engaging scripts for YouTube videos, podcasts, and other media.", description: "Media scriptwriter creating engaging YouTube, podcast, and video scripts that captivate audiences." },
  { id: "119", name: "Lesson Planner", behavior: "Create educational lesson plans", emoji: "🎓", systemPrompt: "You create comprehensive lesson plans for teaching any subject.", description: "Education designer creating structured, engaging lesson plans for teaching any topic effectively." },
  { id: "120", name: "Elevator Pitch", behavior: "Perfect your 30-second pitch", emoji: "🛗", systemPrompt: "You help craft compelling 30-second elevator pitches for any purpose.", description: "Pitch perfector crafting memorable 30-second introductions that open doors and spark interest." },
  { id: "121", name: "Ritual Designer", behavior: "Create meaningful daily rituals", emoji: "🌅", systemPrompt: "You design meaningful morning routines, evening rituals, and life ceremonies.", description: "Ritual architect designing meaningful daily practices, routines, and life ceremonies for intention." },
  { id: "122", name: "Debate Partner", behavior: "Practice arguments on any topic", emoji: "🗣️", systemPrompt: "You engage in structured debates on any topic, helping users practice argumentation.", description: "Sparring partner for intellectual debates, helping strengthen arguments and consider opposing views." },
  { id: "123", name: "Scenario Planner", behavior: "Plan for multiple future outcomes", emoji: "🔮", systemPrompt: "You help plan for multiple possible future scenarios and prepare contingencies.", description: "Future strategist mapping out scenarios, contingency plans, and preparing for multiple outcomes." },
  { id: "124", name: "Gratitude Guide", behavior: "Cultivate thankfulness and appreciation", emoji: "🙏", systemPrompt: "You help cultivate gratitude practices and appreciation for life's blessings.", description: "Gratitude cultivator helping develop appreciation practices that transform perspective and happiness." },
  { id: "125", name: "Pain Point Finder", behavior: "Identify problems worth solving", emoji: "🔍", systemPrompt: "You help identify pain points and problems that are worth solving for business ideas.", description: "Problem identifier uncovering pain points, market gaps, and opportunities worth pursuing." },
  { id: "126", name: "Comparison Expert", behavior: "Compare options objectively", emoji: "⚖️", systemPrompt: "You objectively compare options, products, or choices with pros, cons, and recommendations.", description: "Comparison analyst providing objective side-by-side analysis of options with clear recommendations." },
  { id: "127", name: "Hobby Finder", behavior: "Discover new hobbies and interests", emoji: "🎪", systemPrompt: "You suggest new hobbies and activities based on personality and existing interests.", description: "Hobby matchmaker discovering new activities and passions based on your personality and interests." },
  { id: "128", name: "Cultural Guide", behavior: "Navigate different cultures", emoji: "🗺️", systemPrompt: "You explain cultural norms, etiquette, and customs from around the world.", description: "Cross-cultural advisor explaining customs, etiquette, and social norms from cultures worldwide." },
  { id: "129", name: "Calm Coach", behavior: "Manage anxiety and find peace", emoji: "🍃", systemPrompt: "You provide calming techniques, anxiety management, and peace-finding strategies.", description: "Anxiety ally providing calming techniques, grounding exercises, and peace-finding strategies." },
  { id: "130", name: "Boundary Builder", behavior: "Set healthy personal boundaries", emoji: "🚧", systemPrompt: "You help establish and maintain healthy personal and professional boundaries.", description: "Boundary coach teaching how to set, communicate, and maintain healthy limits in relationships." },
  { id: "131", name: "Learning Accelerator", behavior: "Learn any skill faster", emoji: "🚀", systemPrompt: "You design accelerated learning plans for mastering any new skill quickly.", description: "Skill acquisition expert designing accelerated learning paths for mastering new abilities quickly." },
  { id: "132", name: "First Principles", behavior: "Break problems to fundamentals", emoji: "🧱", systemPrompt: "You apply first principles thinking to break down problems to their fundamentals.", description: "Foundational thinker breaking complex problems down to core truths for innovative solutions." },
  { id: "133", name: "Energy Manager", behavior: "Optimize energy and avoid burnout", emoji: "🔋", systemPrompt: "You help manage personal energy levels and prevent burnout with sustainable practices.", description: "Energy optimizer managing vitality, preventing burnout, and sustaining peak performance long-term." },
  { id: "134", name: "Question Asker", behavior: "Ask powerful questions", emoji: "❓", systemPrompt: "You ask powerful, thought-provoking questions that lead to insights and breakthroughs.", description: "Inquiry expert asking powerful questions that unlock insights, clarity, and breakthrough thinking." },
  { id: "135", name: "Storytelling Coach", behavior: "Tell captivating stories", emoji: "📚", systemPrompt: "You teach storytelling techniques for business, personal, and entertainment contexts.", description: "Narrative coach teaching storytelling techniques that captivate, persuade, and inspire any audience." },
  { id: "136", name: "Prompt Engineer", behavior: "Write better AI prompts", emoji: "🤖", systemPrompt: "You help craft effective prompts for AI systems to get better results.", description: "AI prompt specialist crafting optimized prompts that get better, more accurate AI responses." },
  { id: "137", name: "Reverse Engineer", behavior: "Understand how things work", emoji: "🔧", systemPrompt: "You explain how systems, products, and processes work by breaking them down.", description: "Systems analyst explaining how things work by deconstructing them into understandable components." },
  { id: "138", name: "Risk Assessor", behavior: "Evaluate risks and rewards", emoji: "⚠️", systemPrompt: "You help assess risks, rewards, and make calculated decisions.", description: "Risk analyst evaluating potential downsides, upsides, and helping make calculated decisions." },
  { id: "139", name: "Vision Creator", behavior: "Craft inspiring visions", emoji: "👁️", systemPrompt: "You help articulate compelling visions for personal, team, or company futures.", description: "Visionary guide helping articulate inspiring visions that motivate and align teams toward goals." },
  { id: "140", name: "Legacy Planner", behavior: "Plan your lasting impact", emoji: "🏆", systemPrompt: "You help think about legacy, impact, and meaningful contributions to the world.", description: "Impact strategist helping plan meaningful contributions and the lasting legacy you want to leave." },
];

const DEFAULT_IMAGE_MODELS: ImageModel[] = [
  { id: "1", name: "Flux Pro", emoji: "⚡", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional-grade AI image generation with stunning realism, perfect for photorealistic renders and high-quality visuals.", modelType: "flux-realism", systemPrompt: "ultra realistic, professional photography, 8K resolution", examplePrompts: ["A professional headshot of a confident business executive in a modern office", "Ultra realistic golden retriever puppy playing in autumn leaves"] },
  { id: "2", name: "Anime Master", emoji: "🎌", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Specialized anime art generator creating beautiful Japanese-style illustrations with vibrant colors and expressive characters.", modelType: "flux", systemPrompt: "anime style, detailed anime art, vibrant colors", examplePrompts: ["Anime girl with long pink hair in a cherry blossom garden", "Epic anime battle scene between two samurai warriors at sunset"] },
  { id: "3", name: "Photo Real", emoji: "📸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "DSLR-quality photorealistic images that look like they came straight from a professional camera with perfect lighting.", modelType: "flux-realism", systemPrompt: "photorealistic, DSLR quality, professional lighting", examplePrompts: ["Professional food photography of a gourmet burger with steam", "Portrait of an elderly man with weathered face telling stories by firelight"] },
  { id: "4", name: "Fantasy Art", emoji: "🐉", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Magical fantasy artwork featuring dragons, wizards, enchanted forests, and epic mythical scenes.", modelType: "flux", systemPrompt: "fantasy art, magical, epic fantasy style", examplePrompts: ["Majestic dragon perched on a crystal mountain at twilight", "Elven queen in flowing silver robes in an enchanted moonlit forest"] },
  { id: "5", name: "Cyberpunk", emoji: "🤖", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Futuristic neon-soaked cityscapes, cyborg characters, and high-tech dystopian aesthetics.", modelType: "flux", systemPrompt: "cyberpunk style, neon lights, futuristic", examplePrompts: ["Cyberpunk street market with holographic signs and flying cars", "Female hacker with neon tattoos in a rainy Tokyo alleyway"] },
  { id: "6", name: "Oil Painting", emoji: "🖼️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Classical oil painting style with rich textures, museum-quality brushwork, and timeless artistic appeal.", modelType: "flux", systemPrompt: "oil painting, classical art style, museum quality", examplePrompts: ["Oil painting of a peaceful countryside with golden wheat fields", "Classical portrait of a noble lady in Renaissance style"] },
  { id: "7", name: "Pixel Art", emoji: "👾", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Retro 8-bit and 16-bit pixel art perfect for game assets, nostalgic designs, and indie game aesthetics.", modelType: "flux", systemPrompt: "pixel art style, retro gaming aesthetic", examplePrompts: ["16-bit pixel art RPG hero standing in front of a castle", "Retro pixel art sunset over a cyberpunk city skyline"] },
  { id: "8", name: "Watercolor", emoji: "🎨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Soft, flowing watercolor paintings with beautiful color bleeds, gentle washes, and artistic imperfections.", modelType: "flux", systemPrompt: "watercolor painting, soft colors, artistic", examplePrompts: ["Watercolor painting of a Venetian canal with gondolas", "Soft watercolor portrait of a woman with flowers in her hair"] },
  { id: "9", name: "Comic Book", emoji: "💥", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Bold comic book style with dynamic action lines, vibrant colors, and superhero-worthy compositions.", modelType: "flux", systemPrompt: "comic book style, bold lines, vibrant", examplePrompts: ["Comic book superhero landing pose with explosion background", "Vintage comic panel of detectives solving a mystery"] },
  { id: "10", name: "3D Render", emoji: "🎲", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional 3D rendered images with Octane-quality lighting, materials, and photorealistic CGI effects.", modelType: "flux", systemPrompt: "3D render, octane render, highly detailed", examplePrompts: ["3D rendered cute robot character with metallic textures", "Octane render of a futuristic sports car in a showroom"] },
  { id: "11", name: "Sketch", emoji: "✏️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Hand-drawn pencil sketch style with detailed linework, shading, and artistic character.", modelType: "flux", systemPrompt: "pencil sketch, hand drawn, detailed linework", examplePrompts: ["Detailed pencil sketch of a wolf howling at the moon", "Architectural sketch of a Victorian mansion with gardens"] },
  { id: "12", name: "Abstract", emoji: "🌀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Modern abstract art with bold shapes, creative compositions, and thought-provoking visual elements.", modelType: "flux", systemPrompt: "abstract art, modern art, creative", examplePrompts: ["Abstract representation of human emotions using geometric shapes", "Kandinsky-inspired abstract composition with musical elements"] },
  { id: "13", name: "Portrait Pro", emoji: "👤", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional studio portrait photography with perfect lighting, sharp focus, and magazine-quality results.", modelType: "flux-realism", systemPrompt: "professional portrait, studio lighting, sharp focus on face", examplePrompts: ["Professional LinkedIn headshot with neutral background", "Dramatic portrait with Rembrandt lighting and dark background"] },
  { id: "14", name: "Landscape", emoji: "🏞️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Breathtaking landscape photography capturing nature's beauty with stunning vistas and natural lighting.", modelType: "flux-realism", systemPrompt: "landscape photography, scenic, natural lighting", examplePrompts: ["Majestic mountain range reflected in a crystal clear lake at sunrise", "Dramatic coastal cliffs with crashing waves during golden hour"] },
  { id: "15", name: "Steampunk", emoji: "⚙️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Victorian-era machinery meets fantasy with brass gears, copper pipes, and steam-powered imagination.", modelType: "flux", systemPrompt: "steampunk style, brass and copper, victorian machinery", examplePrompts: ["Steampunk airship captain with brass goggles and mechanical arm", "Victorian steampunk laboratory with bubbling glass tubes and gears"] },
  { id: "16", name: "Horror", emoji: "👻", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dark, eerie horror artwork with unsettling atmospheres, creatures, and spine-chilling scenes.", modelType: "flux", systemPrompt: "dark horror style, eerie atmosphere, unsettling", examplePrompts: ["Abandoned asylum hallway with flickering lights and shadowy figure", "Creepy Victorian doll with cracked porcelain face in candlelight"] },
  { id: "17", name: "Minimalist", emoji: "⬜", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Clean, simple designs with intentional negative space, reduced elements, and elegant simplicity.", modelType: "flux", systemPrompt: "minimalist design, clean, simple", examplePrompts: ["Minimalist illustration of a single tree on a white background", "Clean minimalist logo concept for a tech startup"] },
  { id: "18", name: "Surreal", emoji: "🌈", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dreamlike surrealist artwork inspired by Salvador Dali with impossible scenes and melting realities.", modelType: "flux", systemPrompt: "surrealist art, dreamlike, Salvador Dali inspired", examplePrompts: ["Melting clocks draped over floating elephants in a desert", "Surreal staircase leading to doors in the clouds"] },
  { id: "19", name: "Pop Art", emoji: "💫", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Bold Andy Warhol-inspired pop art with bright colors, repeated patterns, and cultural commentary.", modelType: "flux", systemPrompt: "pop art style, Andy Warhol inspired, bold colors", examplePrompts: ["Pop art portrait with four color variations like Warhol", "Bold pop art illustration of a vintage microphone"] },
  { id: "20", name: "Nature", emoji: "🌿", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Wildlife and nature photography showcasing the beauty of animals, plants, and natural environments.", modelType: "flux-realism", systemPrompt: "nature photography, wildlife, natural beauty", examplePrompts: ["Close-up of a monarch butterfly on a purple flower", "Majestic bald eagle soaring over misty mountain peaks"] },
  { id: "21", name: "Vintage", emoji: "📻", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Nostalgic vintage aesthetics with retro color grading, film grain, and old-world charm.", modelType: "flux", systemPrompt: "vintage style, retro, nostalgic", examplePrompts: ["1950s diner scene with vintage cars parked outside", "Vintage travel poster for Paris in art deco style"] },
  { id: "22", name: "Neon", emoji: "💡", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Glowing neon lights with vibrant electric colors, nighttime cityscapes, and luminous effects.", modelType: "flux", systemPrompt: "neon lights, glowing, vibrant neon colors", examplePrompts: ["Neon sign saying 'Open 24 Hours' on a rainy night", "Glowing neon tiger walking through a dark city street"] },
  { id: "23", name: "Gothic", emoji: "🦇", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dark gothic aesthetics with ornate architecture, mysterious atmospheres, and Victorian darkness.", modelType: "flux", systemPrompt: "gothic style, dark aesthetic, ornate", examplePrompts: ["Gothic cathedral with stained glass windows under stormy sky", "Victorian gothic woman in black lace by candlelight"] },
  { id: "24", name: "Children's Book", emoji: "📚", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Charming illustrations perfect for children's books with cute characters and colorful scenes.", modelType: "flux", systemPrompt: "children's book illustration, cute, colorful", examplePrompts: ["Friendly teddy bear having a tea party with woodland animals", "Whimsical treehouse with slides and rope bridges"] },
  { id: "25", name: "Sci-Fi", emoji: "🚀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Science fiction artwork featuring space exploration, futuristic technology, and alien worlds.", modelType: "flux", systemPrompt: "sci-fi art, futuristic technology, space", examplePrompts: ["Massive space station orbiting a ringed planet", "Astronaut discovering ancient alien ruins on Mars"] },
  { id: "26", name: "Art Deco", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Elegant 1920s Art Deco style with geometric patterns, gold accents, and Gatsby-era glamour.", modelType: "flux", systemPrompt: "art deco style, 1920s aesthetic, geometric", examplePrompts: ["Art deco building facade with geometric gold patterns", "1920s flapper dancer in geometric art deco style"] },
  { id: "27", name: "Tattoo Design", emoji: "🖊️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Tattoo-ready artwork with bold linework, traditional and neo-traditional styles.", modelType: "flux", systemPrompt: "tattoo design, detailed linework, tattoo art", examplePrompts: ["Traditional Japanese koi fish tattoo design with waves", "Neo-traditional rose with geometric mandala background"] },
  { id: "28", name: "Logo Maker", emoji: "🏷️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional logo designs with clean vector aesthetics, brand-ready graphics, and memorable icons.", modelType: "flux", systemPrompt: "logo design, professional, clean vector style", examplePrompts: ["Modern minimalist logo for a coffee brand called 'Brew'", "Playful mascot logo for a gaming company"] },
  { id: "29", name: "Cartoon", emoji: "🎪", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Fun cartoon style with animated characters, expressive faces, and playful compositions.", modelType: "flux", systemPrompt: "cartoon style, fun, animated", examplePrompts: ["Cartoon cat chef cooking spaghetti in a colorful kitchen", "Cartoon superhero dog flying over a city skyline"] },
  { id: "30", name: "Dream Art", emoji: "💭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Ethereal dreamlike imagery with soft edges, fantasy elements, and otherworldly atmospheres.", modelType: "flux", systemPrompt: "dreamlike, ethereal, fantasy", examplePrompts: ["Floating islands with waterfalls in a dreamy sky", "Girl walking through a field of glowing mushrooms at night"] },
  { id: "31", name: "Fashion Photo", emoji: "👠", apiEndpoint: "https://image.pollinations.ai/prompt", description: "High-fashion photography with Vogue-quality styling, dramatic poses, and couture aesthetics.", modelType: "flux-realism", systemPrompt: "fashion photography, vogue style, high fashion", examplePrompts: ["High fashion model in avant-garde outfit on city rooftop", "Editorial fashion shot with dramatic lighting and flowing fabric"] },
  { id: "32", name: "Food Art", emoji: "🍕", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Appetizing food photography that makes every dish look delicious with professional styling.", modelType: "flux-realism", systemPrompt: "food photography, appetizing, professional lighting", examplePrompts: ["Gourmet chocolate lava cake with melting center and berries", "Steaming bowl of authentic ramen with perfect egg and toppings"] },
  { id: "33", name: "Architecture", emoji: "🏛️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Architectural visualization and photography showcasing stunning buildings and interior designs.", modelType: "flux-realism", systemPrompt: "architectural photography, modern architecture", examplePrompts: ["Modern minimalist house with floor-to-ceiling windows at sunset", "Stunning interior of a luxury penthouse with city views"] },
  { id: "34", name: "Product Shot", emoji: "📦", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Commercial product photography with studio lighting, perfect for e-commerce and advertising.", modelType: "flux-realism", systemPrompt: "product photography, commercial, studio lighting", examplePrompts: ["Sleek smartphone floating with dynamic lighting and reflections", "Luxury watch on marble surface with dramatic shadows"] },
  { id: "35", name: "Graffiti", emoji: "🎨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Urban street art and graffiti with bold colors, spray paint textures, and city culture.", modelType: "flux", systemPrompt: "graffiti art, street art, urban", examplePrompts: ["Colorful graffiti mural of a lion on a brick wall", "Street art portrait of a woman with flowers in spray paint style"] },
  { id: "36", name: "Stained Glass", emoji: "🌟", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Beautiful stained glass art with colorful translucent segments and luminous effects.", modelType: "flux", systemPrompt: "stained glass style, colorful, translucent", examplePrompts: ["Stained glass peacock with vibrant feathers in cathedral window", "Art nouveau stained glass design of a sunset landscape"] },
  { id: "37", name: "Origami", emoji: "🦢", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Paper folding art style with geometric folds, clean edges, and elegant paper sculptures.", modelType: "flux", systemPrompt: "origami style, paper art, folded paper", examplePrompts: ["Origami dragon made of red and gold paper", "Delicate origami flower bouquet in pastel colors"] },
  { id: "38", name: "Mosaic", emoji: "🔲", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Ancient mosaic tile art with colorful tessellations and classical Byzantine aesthetics.", modelType: "flux", systemPrompt: "mosaic art, tile pattern, ancient style", examplePrompts: ["Roman mosaic floor depicting dolphins and ocean waves", "Byzantine mosaic portrait with gold tile background"] },
  { id: "39", name: "Chibi", emoji: "👶", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Adorable chibi characters with big heads, tiny bodies, and maximum cuteness.", modelType: "flux", systemPrompt: "chibi style, cute, kawaii", examplePrompts: ["Chibi wizard cat casting a sparkly spell", "Cute chibi couple holding hands in a flower field"] },
  { id: "40", name: "Vaporwave", emoji: "🌴", apiEndpoint: "https://image.pollinations.ai/prompt", description: "80s-90s vaporwave aesthetics with pink/purple gradients, Greek statues, and retro tech.", modelType: "flux", systemPrompt: "vaporwave aesthetic, 80s, retrowave", examplePrompts: ["Vaporwave sunset with palm trees and grid horizon", "Greek bust statue with glitch effects and neon colors"] },
  { id: "41", name: "Isometric", emoji: "🎮", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Isometric 3D design perfect for game assets, infographics, and clean geometric scenes.", modelType: "flux", systemPrompt: "isometric design, 3D isometric, game art", examplePrompts: ["Isometric cozy bedroom with gaming setup and plants", "Isometric cityscape with tiny cars and people"] },
  { id: "42", name: "Low Poly", emoji: "📐", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Geometric low-polygon art with faceted surfaces and modern digital aesthetics.", modelType: "flux", systemPrompt: "low poly art, geometric, polygon style", examplePrompts: ["Low poly fox in a geometric forest landscape", "Low poly mountain scene with reflective lake"] },
  { id: "43", name: "Charcoal", emoji: "⬛", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dramatic charcoal drawings with deep blacks, expressive strokes, and artistic intensity.", modelType: "flux", systemPrompt: "charcoal drawing, black and white, artistic", examplePrompts: ["Dramatic charcoal portrait of a dancer in motion", "Expressive charcoal sketch of a stormy seascape"] },
  { id: "44", name: "Impressionist", emoji: "🖌️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Monet-inspired impressionist paintings with soft brushstrokes and beautiful light capture.", modelType: "flux", systemPrompt: "impressionist style, Monet inspired, soft brushstrokes", examplePrompts: ["Impressionist garden with water lilies and willow trees", "Soft impressionist painting of a Paris cafe in rain"] },
  { id: "45", name: "Baroque", emoji: "👑", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dramatic baroque art with rich details, dynamic compositions, and theatrical lighting.", modelType: "flux", systemPrompt: "baroque style, dramatic, ornate, classical", examplePrompts: ["Baroque still life with fruits, flowers, and golden chalice", "Dramatic baroque scene of angels descending from clouds"] },
  { id: "46", name: "Ukiyo-e", emoji: "🌊", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Traditional Japanese woodblock print style with bold outlines and flat color areas.", modelType: "flux", systemPrompt: "ukiyo-e style, Japanese woodblock print, traditional", examplePrompts: ["Great wave in traditional ukiyo-e Japanese style", "Geisha in cherry blossom garden, Hokusai inspired"] },
  { id: "47", name: "Art Nouveau", emoji: "🌸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Flowing Art Nouveau designs with organic curves, floral motifs, and elegant women.", modelType: "flux", systemPrompt: "art nouveau style, flowing lines, organic", examplePrompts: ["Art nouveau poster of woman with flowing hair and flowers", "Mucha-inspired decorative border with nature elements"] },
  { id: "48", name: "Cubism", emoji: "🔷", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Picasso-inspired cubist art with fragmented perspectives and geometric deconstruction.", modelType: "flux", systemPrompt: "cubist style, Picasso inspired, geometric shapes", examplePrompts: ["Cubist portrait showing multiple angles of a face", "Cubist still life of guitar and fruit bowl"] },
  { id: "49", name: "Glitch Art", emoji: "📺", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Digital glitch effects with corrupted pixels, distortion, and electronic aesthetics.", modelType: "flux", systemPrompt: "glitch art, digital distortion, corrupted", examplePrompts: ["Glitch art portrait with RGB color separation", "Corrupted digital landscape with scan lines and artifacts"] },
  { id: "50", name: "Synthwave", emoji: "🌆", apiEndpoint: "https://image.pollinations.ai/prompt", description: "80s synthwave aesthetics with sunset gradients, chrome text, and retro-futuristic vibes.", modelType: "flux", systemPrompt: "synthwave style, 80s retro, sunset colors", examplePrompts: ["Synthwave DeLorean driving toward neon sunset", "Retro synthwave city with palm trees and chrome buildings"] },
  { id: "51", name: "Ceramic", emoji: "🏺", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Beautiful ceramic art with glazed surfaces, pottery textures, and artisan craftsmanship.", modelType: "flux", systemPrompt: "ceramic art, pottery style, glazed", examplePrompts: ["Blue and white Chinese porcelain vase with dragon design", "Modern ceramic sculpture with organic flowing forms"] },
  { id: "52", name: "Embroidery", emoji: "🧵", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Textile embroidery art with stitched patterns, thread textures, and fabric craftsmanship.", modelType: "flux", systemPrompt: "embroidery style, stitched, textile art", examplePrompts: ["Detailed embroidered hummingbird on cream fabric", "Mexican folk art embroidery with bright floral patterns"] },
  { id: "53", name: "Claymation", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Stop-motion clay animation style with sculpted characters and handmade charm.", modelType: "flux", systemPrompt: "claymation style, stop motion, clay figures", examplePrompts: ["Claymation monster in a tiny kitchen set", "Wallace and Gromit style clay character having tea"] },
  { id: "54", name: "Neon Noir", emoji: "🌃", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dark noir aesthetics combined with neon lights, rainy streets, and moody detective vibes.", modelType: "flux", systemPrompt: "neon noir, dark city, moody lighting", examplePrompts: ["Detective in trench coat on rainy neon-lit street", "Mysterious woman smoking in a dark jazz club"] },
  { id: "55", name: "Marble Sculpture", emoji: "🗿", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Classical marble sculpture art with realistic stone textures and ancient Greek aesthetics.", modelType: "flux", systemPrompt: "marble sculpture, classical statue, detailed", examplePrompts: ["Marble bust of philosopher with realistic stone texture", "Greek goddess statue in flowing marble robes"] },
  { id: "56", name: "Sticker Design", emoji: "🔖", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cute sticker designs with clean edges, die-cut style, and trendy kawaii aesthetics.", modelType: "flux", systemPrompt: "sticker design, cute, die cut style", examplePrompts: ["Kawaii bubble tea sticker with happy face", "Set of cute weather stickers with sun, clouds, and rainbow"] },
  { id: "57", name: "Blueprint", emoji: "📋", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Technical blueprint drawings with white lines on blue, engineering precision, and schematics.", modelType: "flux", systemPrompt: "blueprint style, technical drawing, schematic", examplePrompts: ["Detailed blueprint of a vintage airplane", "Architectural blueprint of a modern house floor plan"] },
  { id: "58", name: "Paper Craft", emoji: "📜", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Layered paper cut art with depth, shadows, and intricate silhouette designs.", modelType: "flux", systemPrompt: "paper craft, layered paper, cut out style", examplePrompts: ["Layered paper art forest scene with deer silhouettes", "Chinese paper cutting of phoenix in red paper"] },
  { id: "59", name: "Holographic", emoji: "🔮", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Iridescent holographic effects with rainbow shimmer and futuristic shiny surfaces.", modelType: "flux", systemPrompt: "holographic style, iridescent, rainbow shimmer", examplePrompts: ["Holographic butterfly with rainbow iridescent wings", "Futuristic holographic product packaging design"] },
  { id: "60", name: "Human Ultra", emoji: "🧑", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Ultra-realistic human portraits with perfect anatomy, skin textures, and lifelike expressions.", modelType: "flux-realism", systemPrompt: "ultra realistic human, perfect anatomy, professional portrait photography, detailed skin texture, natural expression", examplePrompts: ["Ultra realistic portrait of elderly woman with laugh lines and wisdom", "Photorealistic young athlete with sweat and determination"] },
  { id: "61", name: "Midjourney Style", emoji: "✨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Artistic MJ-inspired generation with stunning aesthetics and highly detailed compositions.", modelType: "flux", systemPrompt: "midjourney style, artistic, highly detailed, aesthetic", examplePrompts: ["Ethereal forest spirit in flowing robes, midjourney style", "Epic fantasy castle on floating island, highly detailed"] },
  { id: "62", name: "DALL-E 3 Style", emoji: "🎨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Creative DALL-E inspired generation with imaginative concepts and high-quality execution.", modelType: "flux", systemPrompt: "dalle3 style, creative, imaginative, high quality", examplePrompts: ["A teapot shaped like a house with smoke chimney", "Avocado armchair in a modern living room"] },
  { id: "63", name: "Stable Diffusion XL", emoji: "🖼️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "SDXL-quality generation with exceptional detail, sharp focus, and professional output.", modelType: "flux", systemPrompt: "sdxl quality, highly detailed, sharp focus, professional", examplePrompts: ["Intricate mechanical clockwork heart with gears visible", "Hyper-detailed macro shot of a jewel beetle"] },
  { id: "64", name: "Ultra Realistic", emoji: "📷", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Hyperrealistic photography that's indistinguishable from real photos with 8K resolution quality.", modelType: "flux-realism", systemPrompt: "ultra realistic, hyperrealistic, 8K resolution, photorealistic, RAW photo", examplePrompts: ["Hyperrealistic water droplet on a rose petal", "8K photorealistic tiger portrait with visible fur detail"] },
  { id: "65", name: "Anime Pro", emoji: "🌸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional studio-quality anime with masterful shading and detailed character designs.", modelType: "flux", systemPrompt: "anime masterpiece, best quality, detailed anime art, studio quality", examplePrompts: ["Professional anime portrait of magical girl with glowing effects", "Studio Bones style action scene with dynamic movement"] },
  { id: "66", name: "Digital Art", emoji: "💎", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional digital paintings trending on ArtStation with concept art quality.", modelType: "flux", systemPrompt: "digital art, digital painting, artstation trending, concept art", examplePrompts: ["Digital painting of fantasy warrior woman, artstation quality", "Concept art of alien marketplace on distant planet"] },
  { id: "67", name: "Concept Art", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Professional concept art for games and films with detailed environments and characters.", modelType: "flux", systemPrompt: "concept art, matte painting, detailed environment, cinematic", examplePrompts: ["Concept art of post-apocalyptic city reclaimed by nature", "Character design sheet for cyberpunk bounty hunter"] },
  { id: "68", name: "Renaissance", emoji: "🏰", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Classical Renaissance painting style with masterful composition and museum-quality execution.", modelType: "flux", systemPrompt: "renaissance painting, classical art, oil on canvas, museum quality", examplePrompts: ["Renaissance portrait of noble scholar with books", "Religious renaissance painting with golden halos and angels"] },
  { id: "69", name: "Street Photography", emoji: "🌃", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Candid urban street photography with authentic moments and documentary style.", modelType: "flux-realism", systemPrompt: "street photography, urban, candid, documentary style, authentic", examplePrompts: ["Candid street photo of musician playing saxophone in subway", "Documentary style photo of busy Tokyo crossing at night"] },
  { id: "70", name: "Wildlife", emoji: "🦁", apiEndpoint: "https://image.pollinations.ai/prompt", description: "National Geographic-quality wildlife photography with detailed fur, feathers, and natural habitats.", modelType: "flux-realism", systemPrompt: "wildlife photography, national geographic, nature documentary, detailed fur", examplePrompts: ["Majestic lion portrait at golden hour in savanna", "Snow leopard in Himalayan mountains with snowfall"] },
  { id: "71", name: "Macro Shot", emoji: "🔬", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Extreme close-up macro photography revealing tiny details invisible to the naked eye.", modelType: "flux-realism", systemPrompt: "macro photography, extreme close-up, detailed, shallow depth of field", examplePrompts: ["Macro shot of dewdrop on spider web at sunrise", "Extreme close-up of eye with visible iris patterns"] },
  { id: "72", name: "Cinematic", emoji: "🎥", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Movie still quality with anamorphic lens effects, film grain, and Hollywood-worthy composition.", modelType: "flux-realism", systemPrompt: "cinematic, movie still, anamorphic lens, film grain, dramatic lighting", examplePrompts: ["Cinematic shot of lone figure in desert sandstorm", "Movie still of noir detective in rain with car headlights"] },
  { id: "73", name: "Neon Dreams", emoji: "🌆", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cyberpunk neon cityscapes with rain reflections and Blade Runner-inspired aesthetics.", modelType: "flux", systemPrompt: "neon lights, cyberpunk city, rain reflections, blade runner inspired", examplePrompts: ["Neon-soaked Tokyo street with rain and umbrella crowd", "Blade Runner style cityscape with flying cars and holograms"] },
  { id: "74", name: "Ethereal", emoji: "🌙", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dreamy ethereal imagery with soft glows, magical atmospheres, and fairy-tale quality.", modelType: "flux", systemPrompt: "ethereal, dreamy, soft glow, magical atmosphere, fantasy", examplePrompts: ["Ethereal forest fairy with glowing wings in moonlight", "Dreamy castle in the clouds with aurora borealis"] },
  { id: "75", name: "Dark Fantasy", emoji: "⚔️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Gothic dark fantasy with medieval settings, ominous atmospheres, and epic drama.", modelType: "flux", systemPrompt: "dark fantasy, gothic, medieval, dramatic, ominous atmosphere", examplePrompts: ["Dark fantasy knight facing dragon in ruined cathedral", "Gothic witch queen on throne of bones and shadows"] },
  { id: "76", name: "Kawaii", emoji: "🍬", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Adorable Japanese kawaii style with pastel colors, cute characters, and maximum cuteness.", modelType: "flux", systemPrompt: "kawaii, cute, pastel colors, adorable, Japanese cute style", examplePrompts: ["Kawaii pastel bunny cafe with cute food and decorations", "Adorable kawaii unicorn with rainbow mane and sparkles"] },
  { id: "77", name: "Retro 80s", emoji: "📼", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Nostalgic 80s aesthetics with VHS effects, vintage tech, and retro pop culture vibes.", modelType: "flux", systemPrompt: "80s aesthetic, retro, vintage, VHS style, nostalgic", examplePrompts: ["80s arcade scene with neon lights and vintage games", "Retro 80s bedroom with boombox and movie posters"] },
  { id: "78", name: "Comic Marvel", emoji: "🦸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Marvel-style comic book art with dynamic superhero poses and action-packed scenes.", modelType: "flux", systemPrompt: "marvel comics style, superhero, dynamic pose, comic book coloring", examplePrompts: ["Superhero landing pose with cape billowing dramatically", "Marvel style action page with hero fighting villain"] },
  { id: "79", name: "Studio Ghibli", emoji: "🌾", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Miyazaki-inspired Ghibli animation style with whimsical scenes and detailed backgrounds.", modelType: "flux", systemPrompt: "studio ghibli style, miyazaki inspired, whimsical, detailed backgrounds", examplePrompts: ["Ghibli style countryside with wind through grass fields", "Whimsical spirit creature in enchanted forest, Totoro inspired"] },
  { id: "80", name: "Noir", emoji: "🕵️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Classic film noir with high contrast black and white, dramatic shadows, and detective atmosphere.", modelType: "flux", systemPrompt: "film noir, black and white, high contrast, shadows, detective aesthetic", examplePrompts: ["Film noir femme fatale in shadows with cigarette smoke", "Detective silhouette against venetian blind shadows"] },
  { id: "81", name: "Dreamscape", emoji: "☁️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Surreal dreamscapes with floating islands, impossible architecture, and fantasy worlds.", modelType: "flux", systemPrompt: "dreamscape, surreal, floating islands, impossible architecture, dream world", examplePrompts: ["Surreal landscape with upside-down waterfalls and floating rocks", "Dream world library with infinite stairs and floating books"] },
  { id: "82", name: "Anime Portrait", emoji: "👧", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Beautiful anime character portraits with expressive eyes and detailed character design.", modelType: "flux", systemPrompt: "anime portrait, character design, detailed face, expressive eyes", examplePrompts: ["Detailed anime portrait of warrior with scars and determination", "Beautiful anime girl with heterochromia eyes and tears"] },
  { id: "83", name: "Game Art", emoji: "🎮", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Video game concept art for characters, environments, and items with professional quality.", modelType: "flux", systemPrompt: "video game art, game concept, character design, environment art", examplePrompts: ["RPG game character design with armor and weapon details", "Fantasy game environment concept of underground crystal cave"] },
  { id: "84", name: "Psychedelic", emoji: "🍄", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Trippy psychedelic art with vibrant colors, patterns, and mind-bending visuals.", modelType: "flux", systemPrompt: "psychedelic art, trippy, vibrant colors, patterns, kaleidoscope", examplePrompts: ["Psychedelic mushroom forest with swirling colors", "Trippy kaleidoscope pattern with fractal geometry"] },
  { id: "85", name: "Realistic Portrait", emoji: "👤", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Photorealistic human portraits with studio lighting and detailed skin textures.", modelType: "flux-realism", systemPrompt: "realistic portrait, professional headshot, studio lighting, detailed skin", examplePrompts: ["Professional studio portrait of CEO with confident expression", "Realistic portrait of artist with paint-stained hands"] },
  { id: "86", name: "Vector Art", emoji: "📐", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Clean vector graphics with flat design, perfect for logos and modern illustrations.", modelType: "flux", systemPrompt: "vector art, flat design, clean lines, minimalist, graphic design", examplePrompts: ["Flat vector illustration of city skyline at sunset", "Clean vector character design for mobile app mascot"] },
  { id: "87", name: "Storybook", emoji: "📕", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Enchanting storybook illustrations with whimsical charm and fairy-tale aesthetics.", modelType: "flux", systemPrompt: "storybook illustration, children's book, whimsical, colorful, charming", examplePrompts: ["Storybook illustration of little fox's big adventure", "Whimsical fairy tale cottage in enchanted mushroom forest"] },
  { id: "88", name: "Album Cover", emoji: "💿", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Music album artwork with creative concepts, artistic expression, and bold designs.", modelType: "flux", systemPrompt: "album cover art, music artwork, creative, artistic, bold design", examplePrompts: ["Psychedelic rock album cover with cosmic imagery", "Minimalist jazz album cover with abstract saxophone"] },
  { id: "89", name: "Jewelry", emoji: "💍", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Luxury jewelry photography with sparkle, macro detail, and elegant presentation.", modelType: "flux-realism", systemPrompt: "jewelry photography, product shot, macro, sparkle, luxury", examplePrompts: ["Diamond engagement ring with bokeh light reflections", "Luxury gold necklace on black velvet with dramatic lighting"] },
  { id: "90", name: "Sports Action", emoji: "⚽", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dynamic sports photography capturing peak action moments with athletic intensity.", modelType: "flux-realism", systemPrompt: "sports photography, action shot, dynamic, high speed, athletic", examplePrompts: ["Basketball player mid-dunk with stadium lights", "Soccer player bicycle kick with ball trajectory visible"] },
  { id: "91", name: "Underwater", emoji: "🐠", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Underwater photography and art with ocean life, coral reefs, and aquatic beauty.", modelType: "flux-realism", systemPrompt: "underwater photography, ocean, marine life, blue tones, diving", examplePrompts: ["Diver swimming with manta ray in crystal clear water", "Vibrant coral reef ecosystem with tropical fish"] },
  { id: "92", name: "Celestial", emoji: "🌌", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cosmic space art with galaxies, nebulae, stars, and interstellar wonder.", modelType: "flux", systemPrompt: "space art, galaxy, nebula, stars, cosmic, celestial", examplePrompts: ["Colorful nebula with newborn stars forming", "Astronaut floating before massive spiral galaxy"] },
  { id: "93", name: "Art Deco Luxe", emoji: "💫", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Luxurious Art Deco with gold accents, geometric opulence, and Gatsby-era glamour.", modelType: "flux", systemPrompt: "art deco, luxury, gold accents, geometric, gatsby era, opulent", examplePrompts: ["Grand art deco ballroom with chandeliers and gold details", "Luxury art deco invitation design with gold geometric patterns"] },
  { id: "94", name: "Botanical", emoji: "🌺", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Scientific botanical illustrations with detailed flora, accurate anatomy, and naturalist style.", modelType: "flux", systemPrompt: "botanical illustration, scientific drawing, detailed flora, naturalist", examplePrompts: ["Detailed botanical illustration of orchid species", "Scientific botanical plate of medicinal herbs with labels"] },
  { id: "95", name: "Dystopian", emoji: "🏚️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Post-apocalyptic dystopian scenes with ruins, decay, and ominous futures.", modelType: "flux", systemPrompt: "dystopian, post-apocalyptic, ruins, desolate, futuristic decay", examplePrompts: ["Overgrown city ruins with nature reclaiming skyscrapers", "Lone survivor walking through abandoned metropolis"] },
  { id: "96", name: "Fashion Editorial", emoji: "👠", apiEndpoint: "https://image.pollinations.ai/prompt", description: "High-end fashion editorial photography with Vogue-quality styling and couture aesthetics.", modelType: "flux-realism", systemPrompt: "fashion editorial, vogue style, high fashion, dramatic poses, couture", examplePrompts: ["Dramatic fashion editorial with avant-garde makeup", "High fashion model in couture gown on Paris rooftop"] },
  { id: "97", name: "Fairy Tale", emoji: "🧚", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Magical fairy tale scenes with enchanted forests, whimsical creatures, and storybook magic.", modelType: "flux", systemPrompt: "fairy tale, magical, enchanted forest, whimsical, storybook", examplePrompts: ["Fairy tale castle covered in roses and thorns", "Woodland fairy granting wishes in moonlit clearing"] },
  { id: "98", name: "Grunge", emoji: "🎸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Raw grunge aesthetics with urban decay, rough textures, and punk rock attitude.", modelType: "flux", systemPrompt: "grunge aesthetic, dirty, urban decay, rough textures, punk", examplePrompts: ["Grunge concert poster with distressed typography", "Urban grunge portrait with torn clothing and attitude"] },
  { id: "99", name: "Pastel Dream", emoji: "🌸", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Soft pastel aesthetics with dreamy colors, gentle tones, and peaceful atmosphere.", modelType: "flux", systemPrompt: "pastel colors, soft aesthetic, dreamy, gentle, muted tones", examplePrompts: ["Pastel dreamscape with cotton candy clouds and soft hills", "Gentle pastel portrait with soft lighting and flowers"] },
  { id: "100", name: "Epic Battle", emoji: "⚔️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Epic battle scenes with dramatic action, warriors clashing, and cinematic intensity.", modelType: "flux", systemPrompt: "epic battle, war scene, dramatic action, warriors, cinematic", examplePrompts: ["Epic fantasy battle between armies of light and darkness", "Samurai duel at sunset with cherry blossoms falling"] },
  // 40 Additional Best Image Models (101-140)
  { id: "101", name: "Bioluminescent", emoji: "🌟", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Glowing bioluminescent scenes with natural light emission and magical underwater worlds.", modelType: "flux", systemPrompt: "bioluminescent, glowing, natural light emission, underwater glow, magical lighting", examplePrompts: ["Bioluminescent jellyfish swarm in deep ocean darkness", "Glowing bioluminescent forest with mushrooms and fireflies"] },
  { id: "102", name: "Double Exposure", emoji: "🔄", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Artistic double exposure photography blending multiple images into one composition.", modelType: "flux", systemPrompt: "double exposure, blend, overlay, artistic photography, merged images", examplePrompts: ["Double exposure of woman's face with forest landscape", "Wolf silhouette with starry night sky double exposure"] },
  { id: "103", name: "Infrared", emoji: "🔴", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Infrared photography with surreal color shifts and otherworldly landscapes.", modelType: "flux", systemPrompt: "infrared photography, surreal colors, color shift, otherworldly", examplePrompts: ["Infrared landscape with white trees and red sky", "Surreal infrared cityscape with unusual color palette"] },
  { id: "104", name: "Tilt Shift", emoji: "🏙️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Miniature tilt-shift photography making real scenes look like tiny toy models.", modelType: "flux-realism", systemPrompt: "tilt shift, miniature effect, toy model look, selective focus, diorama", examplePrompts: ["Tilt shift city view making buildings look like toys", "Miniature effect highway with tiny car traffic"] },
  { id: "105", name: "Afrofuturism", emoji: "🌍", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Afrofuturist art blending African culture with futuristic technology and space themes.", modelType: "flux", systemPrompt: "afrofuturism, african culture, futuristic, space, cultural technology", examplePrompts: ["Afrofuturist warrior queen with traditional patterns and tech", "African city of the future with cultural architecture and flying vehicles"] },
  { id: "106", name: "Solarpunk", emoji: "☀️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Optimistic solarpunk futures with green technology, sustainable cities, and nature harmony.", modelType: "flux", systemPrompt: "solarpunk, green technology, sustainable, nature harmony, optimistic future", examplePrompts: ["Solarpunk city with vertical gardens and solar panels", "Community garden on rooftop with wind turbines and happy people"] },
  { id: "107", name: "Cyberpunk Anime", emoji: "🤖", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Anime meets cyberpunk with neon-lit characters and futuristic Japanese aesthetics.", modelType: "flux", systemPrompt: "cyberpunk anime, neon, futuristic anime, japanese cyberpunk, tech anime", examplePrompts: ["Cyberpunk anime hacker girl with holographic screens", "Anime mech pilot in neon-lit cockpit"] },
  { id: "108", name: "Dieselpunk", emoji: "🛩️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Diesel-powered retro-futurism with 1940s-50s aesthetics and industrial machinery.", modelType: "flux", systemPrompt: "dieselpunk, retro futurism, 1940s, industrial, propeller punk", examplePrompts: ["Dieselpunk flying fortress with propellers and rivets", "1940s style robot with analog gauges and brass"] },
  { id: "109", name: "Atompunk", emoji: "☢️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Atomic age aesthetics with 1950s futurism, chrome, and space-age optimism.", modelType: "flux", systemPrompt: "atompunk, atomic age, 1950s futurism, chrome, space age", examplePrompts: ["Atompunk rocket car in 1950s suburban setting", "Retro-futuristic kitchen with atomic age appliances"] },
  { id: "110", name: "Cottagcore", emoji: "🏡", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Cozy cottagecore aesthetics with rural life, nature, and simple living charm.", modelType: "flux", systemPrompt: "cottagecore, cozy, rural, natural, simple living, pastoral", examplePrompts: ["Cozy cottage interior with fresh bread and wildflowers", "Person in linen dress picking berries in meadow"] },
  { id: "111", name: "Dark Academia", emoji: "📖", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dark academia aesthetics with Gothic libraries, old books, and scholarly mystery.", modelType: "flux", systemPrompt: "dark academia, gothic, library, old books, scholarly, mysterious", examplePrompts: ["Dark academia study with candles and ancient tomes", "Scholar in tweed reading by Gothic window"] },
  { id: "112", name: "Maximalism", emoji: "🎪", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Bold maximalist design with patterns, colors, and decorative excess.", modelType: "flux", systemPrompt: "maximalist, bold patterns, colorful, decorative, ornate, eclectic", examplePrompts: ["Maximalist living room with clashing patterns and bold colors", "Ornate maximalist portrait with flowers and patterns everywhere"] },
  { id: "113", name: "Brutalism", emoji: "🏗️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Brutalist architecture photography with raw concrete and imposing structures.", modelType: "flux-realism", systemPrompt: "brutalist architecture, concrete, imposing, raw, monumental", examplePrompts: ["Massive brutalist building with geometric concrete forms", "Brutalist interior with dramatic light through concrete"] },
  { id: "114", name: "Rococo", emoji: "🎀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Ornate Rococo style with pastel colors, gold gilt, and elaborate French decorations.", modelType: "flux", systemPrompt: "rococo style, ornate, pastel, gold gilt, french decoration, elaborate", examplePrompts: ["Rococo palace interior with cherubs and gold details", "Rococo portrait of aristocrat with powdered wig"] },
  { id: "115", name: "Expressionism", emoji: "😱", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Bold expressionist art with emotional intensity and distorted forms.", modelType: "flux", systemPrompt: "expressionist art, emotional, distorted, bold, intense colors", examplePrompts: ["Expressionist cityscape with swirling anxious energy", "Emotional expressionist portrait with bold brushstrokes"] },
  { id: "116", name: "Constructivism", emoji: "🔺", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Soviet constructivist design with bold geometry and revolutionary aesthetics.", modelType: "flux", systemPrompt: "constructivism, soviet design, geometric, revolutionary, bold typography", examplePrompts: ["Constructivist propaganda poster with geometric shapes", "Russian constructivist building design with angular forms"] },
  { id: "117", name: "Memphis Design", emoji: "🔶", apiEndpoint: "https://image.pollinations.ai/prompt", description: "80s Memphis design with bold patterns, bright colors, and playful geometry.", modelType: "flux", systemPrompt: "memphis design, 80s, bold patterns, bright colors, playful geometry", examplePrompts: ["Memphis style furniture with squiggles and bold colors", "80s Memphis pattern with geometric shapes and terrazzo"] },
  { id: "118", name: "Wes Anderson", emoji: "🎬", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Wes Anderson film aesthetics with symmetry, pastel colors, and quirky staging.", modelType: "flux", systemPrompt: "wes anderson style, symmetrical, pastel, quirky, whimsical, centered composition", examplePrompts: ["Wes Anderson style hotel lobby with symmetrical pink interior", "Quirky characters in perfectly symmetrical pastel room"] },
  { id: "119", name: "Tim Burton", emoji: "🎃", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Tim Burton style with Gothic whimsy, striped patterns, and darkly magical worlds.", modelType: "flux", systemPrompt: "tim burton style, gothic whimsy, striped, dark, magical, quirky horror", examplePrompts: ["Tim Burton style haunted house with swirly shapes", "Quirky gothic character with big eyes and striped clothing"] },
  { id: "120", name: "Moebius", emoji: "🌀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Jean Giraud Moebius style with intricate linework and surreal science fiction.", modelType: "flux", systemPrompt: "moebius style, intricate linework, surreal, science fiction, detailed", examplePrompts: ["Moebius style alien landscape with intricate details", "Surreal sci-fi character in Moebius comic style"] },
  { id: "121", name: "Frank Miller", emoji: "🖤", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Frank Miller Sin City style with high contrast black and white and noir drama.", modelType: "flux", systemPrompt: "frank miller style, sin city, high contrast, noir, black and white, dramatic", examplePrompts: ["Sin City style detective in heavy shadows", "Frank Miller noir scene with red accent color"] },
  { id: "122", name: "Manga", emoji: "📚", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Japanese manga style with clean linework, screentones, and expressive characters.", modelType: "flux", systemPrompt: "manga style, japanese comic, screentone, black and white, expressive", examplePrompts: ["Shonen manga hero in dramatic action pose", "Shoujo manga romantic scene with sparkles and flowers"] },
  { id: "123", name: "Webtoon", emoji: "📱", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Modern webtoon style with vibrant colors and digital illustration aesthetics.", modelType: "flux", systemPrompt: "webtoon style, korean comic, vibrant, digital art, clean", examplePrompts: ["Webtoon romance scene with soft colors and effects", "Action webtoon panel with dynamic movement lines"] },
  { id: "124", name: "Hyperrealism", emoji: "🔍", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Hyperrealistic art that looks more real than photos with incredible detail.", modelType: "flux-realism", systemPrompt: "hyperrealistic, extreme detail, beyond photography, perfect, flawless", examplePrompts: ["Hyperrealistic painting of water droplets on glass", "Hyperreal portrait with visible skin pores and reflections"] },
  { id: "125", name: "Photobash", emoji: "📷", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Photo manipulation and compositing creating impossible scenes from real elements.", modelType: "flux-realism", systemPrompt: "photobash, photo manipulation, composite, realistic impossible, digital matte", examplePrompts: ["Photobash of castle floating above clouds", "Photo manipulation of giant whale in city streets"] },
  { id: "126", name: "Chiaroscuro", emoji: "🌓", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Dramatic chiaroscuro lighting with deep shadows and strong light contrast.", modelType: "flux", systemPrompt: "chiaroscuro, dramatic lighting, deep shadows, light contrast, caravaggio", examplePrompts: ["Chiaroscuro portrait with single light source", "Dramatic chiaroscuro still life with fruits and candle"] },
  { id: "127", name: "Pointillism", emoji: "🔵", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Pointillist art made of tiny dots that form images when viewed from distance.", modelType: "flux", systemPrompt: "pointillism, dots, seurat style, small points, color theory", examplePrompts: ["Pointillist landscape with park scene and people", "Seurat style portrait made of colorful dots"] },
  { id: "128", name: "Fauvism", emoji: "🦁", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Bold fauvist colors with expressionistic brushwork and wild color choices.", modelType: "flux", systemPrompt: "fauvism, bold colors, expressionistic, matisse inspired, wild brushwork", examplePrompts: ["Fauvist landscape with unrealistic vibrant colors", "Matisse style portrait with bold color blocks"] },
  { id: "129", name: "Art Brut", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Raw outsider art with primitive style, naive aesthetics, and unbridled creativity.", modelType: "flux", systemPrompt: "art brut, outsider art, primitive, naive, raw creativity", examplePrompts: ["Outsider art portrait with primitive style", "Art brut scene with childlike imagination"] },
  { id: "130", name: "Retrofuturism", emoji: "🚀", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Retrofuturist visions of the future as imagined in the past with vintage optimism.", modelType: "flux", systemPrompt: "retrofuturism, vintage future, past vision of tomorrow, retro sci-fi", examplePrompts: ["1960s vision of year 2000 with flying cars", "Retrofuturist space colony from vintage magazine"] },
  { id: "131", name: "Datamosh", emoji: "📟", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Digital datamosh effects with video compression artifacts and glitchy aesthetics.", modelType: "flux", systemPrompt: "datamosh, compression artifacts, pixel sorting, digital decay, glitch video", examplePrompts: ["Datamosh portrait with melting pixel effects", "Glitched landscape with compression artifact patterns"] },
  { id: "132", name: "Risograph", emoji: "🖨️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Risograph print style with limited colors, halftones, and slight misregistration.", modelType: "flux", systemPrompt: "risograph print, limited colors, halftone, offset, indie print", examplePrompts: ["Risograph style poster with two-color print effect", "Indie risograph zine cover with halftone patterns"] },
  { id: "133", name: "Collage", emoji: "✂️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Mixed media collage with cut paper, vintage elements, and layered compositions.", modelType: "flux", systemPrompt: "collage art, cut paper, vintage elements, mixed media, layered", examplePrompts: ["Surrealist collage with vintage magazine cutouts", "Mixed media collage combining photos and illustrations"] },
  { id: "134", name: "Zentangle", emoji: "🔲", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Intricate zentangle patterns with meditative repeated designs and detailed linework.", modelType: "flux", systemPrompt: "zentangle, intricate patterns, meditative, repetitive, detailed linework", examplePrompts: ["Zentangle animal filled with intricate patterns", "Meditative zentangle mandala with detailed sections"] },
  { id: "135", name: "Linocut", emoji: "🪵", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Bold linocut print style with carved linework and block printing aesthetics.", modelType: "flux", systemPrompt: "linocut print, woodcut, carved, bold lines, block print", examplePrompts: ["Linocut print of mountain landscape with bold lines", "Traditional linocut portrait with high contrast"] },
  { id: "136", name: "Diorama", emoji: "🎭", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Miniature diorama scenes with handcrafted look and tiny detailed worlds.", modelType: "flux-realism", systemPrompt: "diorama, miniature scene, handcrafted, tiny world, model", examplePrompts: ["Miniature diorama of cozy winter cabin", "Detailed diorama of fantasy village in glass jar"] },
  { id: "137", name: "Neon Sign", emoji: "📝", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Glowing neon sign designs with tube lighting and vintage signage aesthetics.", modelType: "flux", systemPrompt: "neon sign, tube lighting, glowing text, vintage signage, bar sign", examplePrompts: ["Vintage neon 'Open' sign with pink glow", "Custom neon sign with cursive text and hearts"] },
  { id: "138", name: "Gold Leaf", emoji: "✨", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Luxurious gold leaf art with metallic textures and gilded decorative elements.", modelType: "flux", systemPrompt: "gold leaf, gilded, metallic texture, luxury art, ornate gold", examplePrompts: ["Portrait with gold leaf halo and accents", "Gold leaf decorated manuscript page"] },
  { id: "139", name: "Frost Glass", emoji: "❄️", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Frosted glass effect with translucent surfaces and icy crystal patterns.", modelType: "flux", systemPrompt: "frosted glass, translucent, ice crystal, frozen, cold texture", examplePrompts: ["Window with frost patterns revealing winter scene", "Frosted glass vase with flowers visible through ice"] },
  { id: "140", name: "Aurora Sky", emoji: "🌌", apiEndpoint: "https://image.pollinations.ai/prompt", description: "Northern lights photography and art with stunning aurora borealis displays.", modelType: "flux-realism", systemPrompt: "aurora borealis, northern lights, night sky, colorful sky, arctic", examplePrompts: ["Spectacular aurora borealis over snowy mountains", "Northern lights reflected in calm arctic lake"] },
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
