import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextGeneration } from "@/components/TextGeneration";
import { ImageGeneration } from "@/components/ImageGeneration";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminLogin } from "@/components/AdminLogin";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Header } from "@/components/Header";
import { BroadcastViewer } from "@/components/BroadcastViewer";
import { AnnouncementsHistory } from "@/components/AnnouncementsHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Loader2, MessageSquare, Image, Megaphone } from "lucide-react";

const Index = () => {
  const { user, session } = useAuth();
  const { isAdmin } = useApp();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"home" | "admin" | "settings">("home");
  const [isLoading, setIsLoading] = useState(true);

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
      <main className="container mx-auto py-4 md:py-8 px-4">
        {currentView === "home" && (
          <>
            <BroadcastViewer />
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="text" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Text Generation
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-2">
                  <Image className="w-4 h-4" />
                  Image Generation
                </TabsTrigger>
                <TabsTrigger value="announcements" className="gap-2">
                  <Megaphone className="w-4 h-4" />
                  Announcements
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <TextGeneration />
              </TabsContent>
              <TabsContent value="image">
                <ImageGeneration />
              </TabsContent>
              <TabsContent value="announcements">
                <AnnouncementsHistory />
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
