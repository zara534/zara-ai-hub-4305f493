import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Shield, MessageCircle, Mail, Phone, Image as ImageIcon, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-ai.jpg";
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
                Your all-in-one AI platform for intelligent text generation and stunning image creation
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

          {/* About Section */}
          <Card className="border-2 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                What is ZARA AI HUB?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto">
                ZARA AI HUB is a cutting-edge artificial intelligence platform that combines powerful text generation 
                with advanced image creation capabilities. Whether you need creative content, professional writing, 
                or stunning visuals, our AI models are here to assist you 24/7.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">AI Text Generation</h4>
                      <p className="text-sm text-muted-foreground">
                        Access multiple specialized AI models for creative writing, technical content, translations, and more
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">AI Image Creation</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate professional images from text descriptions using state-of-the-art AI models
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Customizable Interface</h4>
                      <p className="text-sm text-muted-foreground">
                        Personalize your experience with multiple themes, fonts, and color schemes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Secure & Reliable</h4>
                      <p className="text-sm text-muted-foreground">
                        Your data and conversations are protected with enterprise-grade security
                      </p>
                    </div>
                  </div>
                </div>
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
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Smart AI Assistants</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple specialized AI models for writing, coding, creative content, and professional communication
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-primary transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-primary">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Image Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Create stunning visuals with cutting-edge AI models like Flux, DALL-E 3, and Stable Diffusion XL
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-primary transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-primary">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Fast & Reliable</h3>
                  <p className="text-sm text-muted-foreground">
                    Lightning-fast responses with 99.9% uptime, powered by enterprise-grade infrastructure
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Section */}
          <Card className="border-2 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">
                Have questions or need support? Reach out to us directly!
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="pt-6 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-center">Email</h4>
                    <a 
                      href="mailto:mgbeahuruchizaram336@gmail.com"
                      className="text-sm text-primary hover:underline block text-center break-all"
                    >
                      mgbeahuruchizaram336@gmail.com
                    </a>
                  </CardContent>
                </Card>
                
                <Card className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="pt-6 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-center">WhatsApp</h4>
                    <a 
                      href="https://wa.me/2347011156046"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block text-center"
                    >
                      +234 701 115 6046
                    </a>
                  </CardContent>
                </Card>
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
