import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Zap, Sparkles, Brain, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  textModels: TextProviderModel[];
  imageModels: ImageProviderModel[];
}

export interface TextProviderModel {
  id: string;
  name: string;
  modelId: string;
  emoji: string;
  description: string;
}

export interface ImageProviderModel {
  id: string;
  name: string;
  modelId: string;
  emoji: string;
  description: string;
}

// Pollinations Extended Models - 30 Text Models
const POLLINATIONS_TEXT_MODELS: TextProviderModel[] = [
  { id: "p-text-1", name: "GPT-5 Nano", modelId: "openai-large", emoji: "⚡", description: "Fast OpenAI responses" },
  { id: "p-text-2", name: "Gemini Flash", modelId: "gemini", emoji: "✨", description: "Google Gemini 2.5 Flash" },
  { id: "p-text-3", name: "DeepSeek V3", modelId: "deepseek", emoji: "🧠", description: "Advanced reasoning AI" },
  { id: "p-text-4", name: "Mistral Small", modelId: "mistral", emoji: "🌪️", description: "Mistral 3.2 24B" },
  { id: "p-text-5", name: "Qwen Coder", modelId: "qwen-coder", emoji: "👨‍💻", description: "Coding specialist" },
  { id: "p-text-6", name: "Llama Fast", modelId: "llama", emoji: "🦙", description: "Meta Llama 3.1" },
  { id: "p-text-7", name: "Claude Sonnet", modelId: "claude-hybridspace", emoji: "🎭", description: "Anthropic Claude" },
  { id: "p-text-8", name: "Gemini Search", modelId: "searchgpt", emoji: "🔍", description: "AI with web search" },
  { id: "p-text-9", name: "DeepSeek R1", modelId: "deepseek-r1", emoji: "🎯", description: "Reasoning model" },
  { id: "p-text-10", name: "Qwen 72B", modelId: "qwen-72b", emoji: "🐲", description: "Large Qwen model" },
  { id: "p-text-11", name: "Command R+", modelId: "command-r-plus", emoji: "📡", description: "Cohere Command" },
  { id: "p-text-12", name: "Mistral Large", modelId: "mistral-large", emoji: "🌩️", description: "Mistral flagship" },
  { id: "p-text-13", name: "GPT-4.1 Nano", modelId: "openai", emoji: "💫", description: "OpenAI latest" },
  { id: "p-text-14", name: "Phi-3 Mini", modelId: "phi", emoji: "🔬", description: "Microsoft Phi-3" },
  { id: "p-text-15", name: "Gemma 2", modelId: "gemma", emoji: "💎", description: "Google Gemma" },
  { id: "p-text-16", name: "Solar Pro", modelId: "solar", emoji: "☀️", description: "Upstage Solar" },
  { id: "p-text-17", name: "Yi Large", modelId: "yi", emoji: "🏮", description: "01.AI Yi model" },
  { id: "p-text-18", name: "Dolphin Mix", modelId: "dolphin", emoji: "🐬", description: "Uncensored model" },
  { id: "p-text-19", name: "OpenChat 3.6", modelId: "openchat", emoji: "💬", description: "Open source chat" },
  { id: "p-text-20", name: "Neural Chat", modelId: "neural-chat", emoji: "🧬", description: "Intel Neural" },
  { id: "p-text-21", name: "Zephyr 7B", modelId: "zephyr", emoji: "🌬️", description: "HuggingFace Zephyr" },
  { id: "p-text-22", name: "Nous Hermes", modelId: "nous-hermes", emoji: "🪶", description: "NousResearch" },
  { id: "p-text-23", name: "WizardLM", modelId: "wizardlm", emoji: "🧙", description: "WizardLM 2" },
  { id: "p-text-24", name: "Starling", modelId: "starling", emoji: "⭐", description: "Berkeley Starling" },
  { id: "p-text-25", name: "Orca Mini", modelId: "orca", emoji: "🐋", description: "Microsoft Orca" },
  { id: "p-text-26", name: "Code Llama", modelId: "codellama", emoji: "🔧", description: "Meta Code Llama" },
  { id: "p-text-27", name: "Vicuna 13B", modelId: "vicuna", emoji: "🦌", description: "LMSYS Vicuna" },
  { id: "p-text-28", name: "OpenHermes", modelId: "openhermes", emoji: "📖", description: "Teknium OpenHermes" },
  { id: "p-text-29", name: "BIDARA", modelId: "bidara", emoji: "🦋", description: "Biomimicry AI" },
  { id: "p-text-30", name: "Evil Mode", modelId: "evil", emoji: "😈", description: "Uncensored responses" },
];

// Pollinations Extended Models - 30 Image Models
const POLLINATIONS_IMAGE_MODELS: ImageProviderModel[] = [
  { id: "p-img-1", name: "Flux Pro", modelId: "flux", emoji: "⚡", description: "High quality generation" },
  { id: "p-img-2", name: "Flux Realism", modelId: "flux-realism", emoji: "📸", description: "Photorealistic images" },
  { id: "p-img-3", name: "Flux Anime", modelId: "flux-anime", emoji: "🎌", description: "Anime style art" },
  { id: "p-img-4", name: "Flux 3D", modelId: "flux-3d", emoji: "🎲", description: "3D rendered images" },
  { id: "p-img-5", name: "Flux Cablyai", modelId: "flux-cablyai", emoji: "🎨", description: "Artistic generation" },
  { id: "p-img-6", name: "Turbo", modelId: "turbo", emoji: "🚀", description: "Fast generation" },
  { id: "p-img-7", name: "Flux Dev", modelId: "flux-dev", emoji: "💻", description: "Developer model" },
  { id: "p-img-8", name: "Flux Schnell", modelId: "flux-schnell", emoji: "⏱️", description: "Ultra fast" },
  { id: "p-img-9", name: "Any Dark", modelId: "any-dark", emoji: "🌑", description: "Dark themed" },
  { id: "p-img-10", name: "Flux Redux", modelId: "flux-redux", emoji: "🔄", description: "Enhanced Flux" },
  { id: "p-img-11", name: "Flux Fill Pro", modelId: "flux-fill-pro", emoji: "🖌️", description: "Inpainting" },
  { id: "p-img-12", name: "Midjourney", modelId: "midjourney", emoji: "✨", description: "MJ style" },
  { id: "p-img-13", name: "Stable XL", modelId: "stable-diffusion-xl", emoji: "🖼️", description: "SDXL model" },
  { id: "p-img-14", name: "Dall-E 3", modelId: "dall-e-3", emoji: "🎭", description: "OpenAI DALL-E" },
  { id: "p-img-15", name: "Playground", modelId: "playground-v2.5", emoji: "🎪", description: "Creative styles" },
  { id: "p-img-16", name: "Realistic Vision", modelId: "realistic-vision", emoji: "👁️", description: "Ultra realistic" },
  { id: "p-img-17", name: "DreamShaper", modelId: "dreamshaper", emoji: "💭", description: "Dreamlike art" },
  { id: "p-img-18", name: "Deliberate", modelId: "deliberate", emoji: "🎯", description: "Detailed images" },
  { id: "p-img-19", name: "OpenJourney", modelId: "openjourney", emoji: "🌌", description: "Journey style" },
  { id: "p-img-20", name: "Anything V5", modelId: "anything-v5", emoji: "🌸", description: "Anime/Art" },
  { id: "p-img-21", name: "Rev Animated", modelId: "rev-animated", emoji: "🎬", description: "Animation style" },
  { id: "p-img-22", name: "Pastel Mix", modelId: "pastel-mix", emoji: "🍬", description: "Soft pastels" },
  { id: "p-img-23", name: "MeinaMix", modelId: "meinamix", emoji: "💕", description: "Anime portraits" },
  { id: "p-img-24", name: "Perfect World", modelId: "perfect-world", emoji: "🌍", description: "Perfected images" },
  { id: "p-img-25", name: "Ghostmix", modelId: "ghostmix", emoji: "👻", description: "Ethereal style" },
  { id: "p-img-26", name: "Dark Sushi", modelId: "dark-sushi", emoji: "🍣", description: "Dark anime" },
  { id: "p-img-27", name: "Counterfeit", modelId: "counterfeit", emoji: "🎎", description: "Anime art" },
  { id: "p-img-28", name: "AbsoluteReality", modelId: "absolute-reality", emoji: "🏞️", description: "Real photos" },
  { id: "p-img-29", name: "Proteus", modelId: "proteus", emoji: "🔮", description: "Versatile model" },
  { id: "p-img-30", name: "Inkpunk", modelId: "inkpunk", emoji: "🖋️", description: "Ink art style" },
];

export function AIProviderSettings() {
  const [usePollinationsExtended, setUsePollinationsExtended] = useState(() => {
    return localStorage.getItem("ai_provider") === "pollinations-extended";
  });

  const handleToggle = (checked: boolean) => {
    setUsePollinationsExtended(checked);
    localStorage.setItem("ai_provider", checked ? "pollinations-extended" : "openai");
    toast.success(
      checked 
        ? "Switched to Pollinations Extended (30 Text + 30 Image models)" 
        : "Switched to Default API"
    );
    // Reload to apply changes
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-5 h-5 text-primary" />
            AI Provider Settings
          </CardTitle>
          <CardDescription>
            Switch between your default API and Pollinations Extended models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-muted/20">
            <div className="space-y-1">
              <Label htmlFor="provider-toggle" className="text-base font-semibold">
                Use Pollinations Extended
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable 30 additional text models and 30 image models from Pollinations
              </p>
            </div>
            <Switch
              id="provider-toggle"
              checked={usePollinationsExtended}
              onCheckedChange={handleToggle}
            />
          </div>

          {usePollinationsExtended && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Text Models ({POLLINATIONS_TEXT_MODELS.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-64 overflow-y-auto space-y-2">
                  {POLLINATIONS_TEXT_MODELS.map((model) => (
                    <div key={model.id} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <span className="text-xl">{model.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{model.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Image Models ({POLLINATIONS_IMAGE_MODELS.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-64 overflow-y-auto space-y-2">
                  {POLLINATIONS_IMAGE_MODELS.map((model) => (
                    <div key={model.id} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <span className="text-xl">{model.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{model.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {!usePollinationsExtended && (
            <div className="p-4 rounded-lg bg-muted/30 border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold">Currently using: Default API</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your 60 text models and 60 image models configured in the database are active.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { POLLINATIONS_TEXT_MODELS, POLLINATIONS_IMAGE_MODELS };
