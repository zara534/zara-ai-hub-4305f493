import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, MessageCircle, Mail, Phone, Image as ImageIcon, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
          {/* Hero Section - Simplified */}
          <div className="text-center space-y-6 py-12 md:py-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Built with Passion</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              ZARA AI HUB
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your all-in-one AI platform for intelligent text generation and stunning image creation
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
                    <h4 className="font-semibold text-center">Email Support</h4>
                    <a 
                      href="mailto:mgbeahuruchizaram336@gmail.com"
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </CardContent>
                </Card>
                
                <Card className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="pt-6 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-center">WhatsApp Chat</h4>
                    <a 
                      href="https://wa.me/2347011156046"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Chat on WhatsApp
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
