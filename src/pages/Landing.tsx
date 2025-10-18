import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Zap, Shield, Heart, Palette, Type, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/hero-ai.jpg";
import featureBg from "@/assets/feature-bg.jpg";

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, updateSettings } = useApp();

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          {/* Hero Section with Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-primary">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
            </div>
            <div className="relative text-center space-y-6 py-16 md:py-24 px-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full mb-4 border border-primary/30">
                <Sparkles className="w-5 h-5 text-primary-glow" />
                <span className="text-sm font-medium text-white">Built with Passion</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-glow via-primary to-accent bg-clip-text text-transparent drop-shadow-2xl">
                ZARA AI HUB
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                Experience the future of AI conversations, created by Zara Goodluck - 
                a young innovator with a dream to make AI accessible to everyone
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" onClick={() => navigate("/signup")} className="text-lg px-8 shadow-primary">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                  Sign In
                </Button>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Customize Your Experience
              </CardTitle>
              <CardDescription>
                Try different themes and fonts before signing up!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Font Family
                </Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) => updateSettings({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="poppins">Poppins</SelectItem>
                    <SelectItem value="playfair">Playfair Display</SelectItem>
                    <SelectItem value="mono">JetBrains Mono</SelectItem>
                    <SelectItem value="lato">Lato</SelectItem>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                    <SelectItem value="raleway">Raleway</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Theme
                </Label>
                <Select
                  value={settings.colorTheme}
                  onValueChange={(value) => updateSettings({ colorTheme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Purple)</SelectItem>
                    <SelectItem value="purple">Royal Purple</SelectItem>
                    <SelectItem value="blue">Ocean Blue</SelectItem>
                    <SelectItem value="green">Forest Green</SelectItem>
                    <SelectItem value="orange">Sunset Orange</SelectItem>
                    <SelectItem value="red">Ruby Red</SelectItem>
                    <SelectItem value="pink">Rose Pink</SelectItem>
                    <SelectItem value="cyan">Aqua Cyan</SelectItem>
                    <SelectItem value="indigo">Deep Indigo</SelectItem>
                    <SelectItem value="teal">Tropical Teal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <Label className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </Label>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Story Card */}
          <Card className="border-2 shadow-xl">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold">The Story Behind ZARA AI HUB</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                This platform was built by <span className="font-semibold text-foreground">Zara Goodluck</span>, 
                a passionate young developer who dreamed of creating something that could help people connect with AI 
                in meaningful ways. Despite facing numerous challenges and countless hours of learning, Zara persevered 
                with determination and creativity.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Every line of code, every feature, and every design choice was carefully crafted with the user in mind. 
                This isn't just another AI tool - it's a labor of love, built to empower users to explore the limitless 
                possibilities of artificial intelligence.
              </p>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <p className="text-sm italic text-muted-foreground">
                  "Technology should be accessible to everyone, regardless of their technical expertise. 
                  That's why I built ZARA AI HUB - to bridge the gap between complex AI and everyday users."
                  <span className="block mt-2 text-right font-semibold text-foreground">- Zara Goodluck</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="relative">
            <div 
              className="absolute inset-0 rounded-3xl opacity-20 blur-2xl"
              style={{ backgroundImage: `url(${featureBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <div className="relative grid md:grid-cols-3 gap-6">
              <Card className="border-2 hover:shadow-primary transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-primary">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Multiple AI Agents</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from various specialized AI agents, each designed for different tasks and conversations
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-primary transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-primary">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Customizable Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize your interface with multiple themes, fonts, and color schemes to match your style
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-primary transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-primary">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your conversations and data are protected with enterprise-grade security measures
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Terms Section */}
          <Card className="border-2 bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-xl font-bold">Terms of Service</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">1. Acceptance of Terms:</strong> By accessing ZARA AI HUB, 
                  you agree to use this platform responsibly and respect the community guidelines.
                </p>
                <p>
                  <strong className="text-foreground">2. User Responsibilities:</strong> You are responsible for 
                  maintaining the confidentiality of your account and for all activities under your account.
                </p>
                <p>
                  <strong className="text-foreground">3. AI Usage:</strong> The AI responses are generated by 
                  third-party services. While we strive for accuracy, please verify important information independently.
                </p>
                <p>
                  <strong className="text-foreground">4. Privacy:</strong> We respect your privacy. Your personal 
                  information and conversations are stored securely and never shared with third parties without consent.
                </p>
                <p>
                  <strong className="text-foreground">5. Content Policy:</strong> Users must not use this platform 
                  to generate harmful, illegal, or inappropriate content.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
