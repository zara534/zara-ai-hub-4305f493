import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextGeneration } from "@/components/TextGeneration";
import { ImageGeneration } from "@/components/ImageGeneration";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminLogin } from "@/components/AdminLogin";
import { SettingsPanel } from "@/components/SettingsPanel";
import { UserMessaging } from "@/components/UserMessaging";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"home" | "admin" | "settings" | "text" | "image">("home");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user && session === null) {
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [user, session, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tools = [
    {
      id: "text",
      title: "AI Chat Assistant",
      description: "Engage in intelligent conversations with multiple AI models. Get help with writing, coding, analysis, and more.",
      icon: MessageSquare,
      color: "from-blue-500 to-purple-500",
    },
    {
      id: "image",
      title: "Quick Image Generator",
      description: "Generate high-quality images from simple text descriptions. Powered by advanced AI image generation models.",
      icon: ImageIcon,
      color: "from-pink-500 to-orange-500",
    },
  ];

  const filteredTools = tools.filter(tool =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentView={currentView === "text" || currentView === "image" ? "home" : currentView} 
        onViewChange={(view) => {
          if (view === "home" && (currentView === "text" || currentView === "image")) {
            setCurrentView("home");
          } else {
            setCurrentView(view);
          }
        }} 
      />
      <UserMessaging />
      <main className="container mx-auto py-20 md:py-24 px-4">
        {currentView === "home" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                Welcome to ZARA AI HUB
              </h1>
              <p className="text-lg text-muted-foreground">
                Tap any tool below to start creating with AI
              </p>
            </div>

            <Input
              type="text"
              placeholder="Search for an agent or tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-2xl mx-auto h-12 text-base"
            />

            <div className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <div className="h-10 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                <h2 className="text-2xl font-bold">Standard Tools</h2>
              </div>

              <div className="grid gap-4">
                {filteredTools.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No tools found</p>
                ) : (
                  filteredTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Card
                        key={tool.id}
                        className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 overflow-hidden group"
                        onClick={() => setCurrentView(tool.id as any)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
        {currentView === "text" && (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setCurrentView("home")}>
              ← Back to Tools
            </Button>
            <TextGeneration />
          </div>
        )}
        {currentView === "image" && (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setCurrentView("home")}>
              ← Back to Tools
            </Button>
            <ImageGeneration />
          </div>
        )}
        {currentView === "settings" && <SettingsPanel />}
        {currentView === "admin" && (isAdmin ? <AdminPanel /> : <AdminLogin />)}
      </main>
    </div>
  );
};

export default Index;
