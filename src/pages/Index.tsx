import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextGeneration } from "@/components/TextGeneration";
import { ImageGeneration } from "@/components/ImageGeneration";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminLogin } from "@/components/AdminLogin";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/contexts/AuthContext";
import { Loader2, MessageSquare, ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { user, session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"home" | "admin" | "settings">("home");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");

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

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="container mx-auto py-4 md:py-8 px-0 md:px-4">
        {currentView === "home" && (
          <>
            {/* Quick Access Buttons */}
            <div className="flex justify-center gap-2 mb-4 px-2">
              <Button
                variant={activeTab === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("text")}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Text AI
              </Button>
              <Button
                variant={activeTab === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("image")}
                className="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Image AI
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "image")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="text">Text Generation</TabsTrigger>
                <TabsTrigger value="image">Image Generation</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <TextGeneration />
              </TabsContent>
              <TabsContent value="image">
                <ImageGeneration />
              </TabsContent>
            </Tabs>
          </>
        )}
        {currentView === "settings" && <SettingsPanel />}
        {currentView === "admin" && (isAdmin ? <AdminPanel /> : <AdminLogin />)}
      </main>
    </div>
  );
};

export default Index;
