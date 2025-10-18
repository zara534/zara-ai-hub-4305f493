import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Volume2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

const VOICES = [
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "nova", label: "Nova" },
  { value: "onyx", label: "Onyx" },
  { value: "shimmer", label: "Shimmer" },
];

export function TextToSpeech() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to convert");
      return;
    }

    setIsGenerating(true);
    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;
      
      // Create a new audio object and test if it loads
      const newAudio = new Audio(url);
      
      await new Promise((resolve, reject) => {
        newAudio.oncanplaythrough = resolve;
        newAudio.onerror = reject;
        newAudio.load();
      });

      // Clean up previous audio
      if (audio) {
        audio.pause();
        audio.src = '';
      }

      setAudio(newAudio);
      setAudioUrl(url);
      
      // Auto-play the audio
      newAudio.onplay = () => setIsPlaying(true);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onended = () => setIsPlaying(false);
      
      await newAudio.play();
      toast.success("Audio generated and playing!");
      
    } catch (error) {
      console.error("Error generating speech:", error);
      toast.error("Failed to generate speech. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const WaveAnimation = () => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full wave-bar"
          style={{ height: '4px' }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 gradient-soft rounded-full border border-primary/20">
            <Volume2 className="w-6 h-6 text-primary" />
            <span className="font-semibold text-primary">AI Text-to-Speech</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Convert Text to Speech
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your written content into natural-sounding speech with advanced AI voices
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-primary border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Text Input & Voice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Enter your text
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste the text you want to convert to speech. You can write anything - stories, articles, poems, or just casual messages..."
                className="min-h-40 text-lg transition-smooth border-primary/20 focus:border-primary focus:ring-primary/20"
                maxLength={5000}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Maximum 5,000 characters</span>
                <span>{text.length}/5000</span>
              </div>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select Voice
              </label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="transition-smooth border-primary/20 focus:border-primary focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateSpeech}
              disabled={isGenerating || !text.trim()}
              size="lg"
              className="w-full gradient-primary shadow-primary hover:shadow-audio transition-all duration-300 text-lg font-semibold py-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Speech...
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 mr-2" />
                  Convert to Speech
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Audio Player */}
        {audioUrl && (
          <Card className="shadow-audio border-primary/30 gradient-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={togglePlayback}
                    size="lg"
                    variant="secondary"
                    className="gradient-primary shadow-soft hover:shadow-primary transition-all duration-300"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </Button>
                  
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Generated Audio</p>
                    <p className="text-sm text-muted-foreground">
                      Voice: {VOICES.find(v => v.value === voice)?.label}
                    </p>
                  </div>
                </div>

                {isPlaying && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Playing</span>
                    <WaveAnimation />
                  </div>
                )}
              </div>

              {/* HTML5 Audio Player (hidden but provides controls) */}
              <div className="mt-4">
                <audio
                  controls
                  src={audioUrl}
                  className="w-full opacity-75 accent-primary"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}