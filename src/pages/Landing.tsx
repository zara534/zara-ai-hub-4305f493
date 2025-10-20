import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Shield, Heart, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import zaraLogo from "@/assets/zara-logo.jpg";
import heroCouple from "@/assets/hero-couple.jpg";
import featureBg from "@/assets/feature-bg.jpg";

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          {/* Hero Section with Logo */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Built with Passion</span>
            </div>
            
            <img 
              src={zaraLogo} 
              alt="ZARA AI HUB Logo" 
              className="w-64 h-64 mx-auto object-contain drop-shadow-2xl"
            />
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-glow via-primary to-accent bg-clip-text text-transparent">
              ZARA AI HUB
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              by <span className="font-semibold text-foreground">Zara Codec</span> ✓
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/signup")} className="text-lg px-8 shadow-primary">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="text-lg px-8">
                Sign In
              </Button>
            </div>
          </div>

          {/* Hero Images Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={heroCouple} 
                alt="AI Generated Art" 
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={featureBg} 
                alt="AI Technology" 
                className="w-full h-80 object-cover"
              />
            </div>
          </div>

          {/* Creator Story */}
          <Card className="border-2 shadow-xl overflow-hidden">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold">About the Creator</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Zara Goodluck</span> is a passionate young developer 
                from Nigeria who built ZARA AI HUB to make artificial intelligence accessible to everyone. 
                Through countless hours of learning, coding, and creativity, Zara transformed a dream into reality - 
                creating a platform where anyone can harness the power of AI for text generation, image creation, 
                and intelligent conversations.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Every feature you see was carefully crafted with love and dedication. This isn't just another AI tool - 
                it's a bridge between complex technology and everyday users, designed to empower creativity and productivity.
              </p>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <p className="text-sm italic text-muted-foreground">
                  "I believe technology should empower everyone, not just experts. ZARA AI HUB is my contribution 
                  to making AI simple, accessible, and useful for all."
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

          {/* Terms & Privacy Link */}
          <Card className="border-2 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Terms of Service & Privacy Policy</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                By using ZARA AI HUB, you agree to use this platform responsibly and respect community guidelines. 
                We protect your privacy and never share your data with third parties. Users must not generate harmful, 
                illegal, or inappropriate content. AI responses are generated by third-party services - please verify 
                important information independently.
              </p>
              <p className="text-sm text-muted-foreground italic">
                For full terms and privacy details, please contact support after signing up.
              </p>
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
