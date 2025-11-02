export const EXTENDED_IMAGE_MODELS = [
  {
    id: "flux",
    name: "Flux",
    emoji: "⚡",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "High quality image generation (Default)",
    modelType: "flux",
    examplePrompts: ["A beautiful sunset over mountains", "A cute cat wearing sunglasses"]
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    emoji: "🎨",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Stable Diffusion XL model",
    modelType: "stable-diffusion-xl",
    examplePrompts: ["Abstract art with vibrant colors", "Fantasy landscape with dragons"]
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    emoji: "🖼️",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "OpenAI's DALL-E 3",
    modelType: "dall-e-3",
    examplePrompts: ["Photorealistic portrait of a person", "Modern architecture building"]
  },
  {
    id: "playground-v2.5",
    name: "Playground v2.5",
    emoji: "🎪",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "Playground v2.5",
    modelType: "playground-v2.5",
    examplePrompts: ["Cartoon character design", "Sci-fi spaceship concept art"]
  },
  {
    id: "dpo",
    name: "DPO",
    emoji: "🚀",
    apiEndpoint: "https://image.pollinations.ai/prompt",
    description: "DPO model",
    modelType: "dpo",
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
  },
];
