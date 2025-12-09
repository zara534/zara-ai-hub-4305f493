import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Download, Copy, Check, X, Share2, RefreshCw, ThumbsDown, Heart } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function TextGeneration() {
  const { aiModels, rateLimits } = useApp();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(aiModels[0]?.id || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [usageCount, setUsageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareContent, setShareContent] = useState("");

  useEffect(() => {
    loadUsername();
    loadUsage();
  }, [user]);

  const loadUsername = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (data?.username) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error("Error loading username:", error);
    }
  };

  const loadUsage = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("user_usage")
        .select("text_generations")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .single();
      
      if (data) {
        setUsageCount(data.text_generations);
      }
    } catch (error) {
      console.error("Error loading usage:", error);
    }
  };

  const incrementUsage = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .single();

      if (existing) {
        await supabase
          .from("user_usage")
          .update({ 
            text_generations: existing.text_generations + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
        setUsageCount(existing.text_generations + 1);
      } else {
        await supabase
          .from("user_usage")
          .insert({ 
            user_id: user.id,
            usage_date: today,
            text_generations: 1,
            image_generations: 0
          });
        setUsageCount(1);
      }
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Check rate limits
    if (!rateLimits.isUnlimited && usageCount >= rateLimits.dailyTextGenerations) {
      toast.error(`Daily limit reached! You can generate ${rateLimits.dailyTextGenerations} texts per day. Current usage: ${usageCount}/${rateLimits.dailyTextGenerations}`);
      return;
    }

    const model = aiModels.find((m) => m.id === selectedModel);
    if (!model) {
      toast.error("Please select an AI model");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    abortControllerRef.current = new AbortController();

    try {
      const systemPrompt = model.systemPrompt || model.behavior;
      const usernameContext = username ? `The user's name is ${username}. Address them by name when appropriate.` : "";
      
      // Build conversation messages for POST request
      const conversationMessages = [
        { role: "system", content: `${systemPrompt}. ${usernameContext}` },
        ...messages.slice(-5).map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: "user", content: userMessage.content }
      ];
      
      const response = await fetch(
        "https://text.pollinations.ai/openai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: conversationMessages,
            model: "openai",
            stream: false
          }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate text");
      }

      const data = await response.json();
      const fullText = data.choices?.[0]?.message?.content || "";
      
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      let currentText = "";
      const chars = fullText.split("");
      
      for (let i = 0; i < chars.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          toast.info("Generation stopped");
          break;
        }
        currentText += chars[i];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: currentText } : msg
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      
      if (!abortControllerRef.current?.signal.aborted) {
        await incrementUsage();
        toast.success("Response complete!");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.info("Generation stopped");
      } else {
        console.error("Error:", error);
        toast.error("Failed to generate text. Please try again.");
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  const handleDownload = () => {
    const conversationText = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");
    
    const blob = new Blob([conversationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zara-ai-conversation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Conversation downloaded!");
  };

  const handleShare = (content: string) => {
    setShareContent(content);
    setShareDialogOpen(true);
  };

  const shareToSocial = (platform: string) => {
    const text = `🚀 Discover ZARA AI Hub - Your Ultimate AI Playground!\n\nExperience the power of 30+ AI models for text generation and stunning image creation, all in one place. From creative writing to professional design, ZARA AI Hub makes AI accessible to everyone!\n\n✨ Try it now: https://zara-ai-hub.lovable.app`;
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://zara-ai-hub.lovable.app")}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://zara-ai-hub.lovable.app")}`;
        break;
      case "tiktok":
        toast.info("Please copy the text and share manually on TikTok");
        navigator.clipboard.writeText(text);
        return;
      case "instagram":
        toast.info("Please copy the text and share manually on Instagram");
        navigator.clipboard.writeText(text);
        return;
      case "youtube":
        toast.info("Please copy the text and share manually on YouTube");
        navigator.clipboard.writeText(text);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
      setShareDialogOpen(false);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].role !== "assistant") return;

    const previousMessages = messages.slice(0, messageIndex);
    setMessages(previousMessages);
    
    const lastUserMessage = previousMessages.filter(m => m.role === "user").pop();
    if (lastUserMessage) {
      setPrompt(lastUserMessage.content);
      setTimeout(() => handleGenerate(), 100);
    }
  };

  const handleLikeFeedback = () => {
    const email = "mgbeahuruchizaram336@gmail.com";
    const subject = encodeURIComponent("ZARA AI Hub - What I Liked");
    const body = encodeURIComponent("Hi! I wanted to share what I liked about ZARA AI Hub:\n\n");
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleDislikeFeedback = () => {
    const email = "mgbeahuruchizaram336@gmail.com";
    const subject = encodeURIComponent("ZARA AI Hub - Issue Report");
    const body = encodeURIComponent("Hi! I encountered an issue with ZARA AI Hub:\n\nIssue Description:\n\n");
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  const selectedModelData = aiModels.find((m) => m.id === selectedModel);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3 px-2 md:px-4">
      <Card className="shadow-lg border-2">
        <CardContent className="pt-4 md:pt-6 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3 flex-1">
              <Select value={selectedModel} onValueChange={(value) => {
                setSelectedModel(value);
                const model = aiModels.find(m => m.id === value);
                toast.success(`Switched to ${model?.name || 'AI Model'}`);
              }}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Choose AI Agent" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{model.emoji}</span>
                        <span className="font-medium">{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Download</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[450px] md:min-h-[550px] flex flex-col shadow-lg border-2">
        <ScrollArea className="flex-1 p-3 md:p-6" ref={scrollRef}>
          <div className="space-y-4 md:space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center px-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    {selectedModelData?.name.charAt(0).toUpperCase() || "Z"}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Chat with {selectedModelData?.name || "ZARA AI"}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-md">
                  {selectedModelData?.description || "Start a conversation and experience AI-powered assistance"}
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                        <span className="text-base md:text-lg font-bold text-primary">
                          {selectedModelData?.name.charAt(0).toUpperCase() || "Z"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[75%]">
                      <div
                        className={`rounded-2xl px-3 py-2 md:px-5 md:py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted/50"
                        }`}
                      >
                        <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content || (message.role === "assistant" && isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : message.content)}
                        </p>
                      </div>
                      {message.content && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(message.content, message.id)}
                            className="h-7 px-2"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(message.content)}
                            className="h-7 px-2"
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                          {message.role === "assistant" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRegenerate(message.id)}
                                className="h-7 px-2"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLikeFeedback}
                                className="h-7 px-2 hover:text-red-500"
                              >
                                <Heart className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDislikeFeedback}
                                className="h-7 px-2 hover:text-yellow-500"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-base md:text-lg font-bold text-primary-foreground">
                          {username ? username.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                      <span className="text-base md:text-lg font-bold text-primary">
                        {selectedModelData?.name.charAt(0).toUpperCase() || "Z"}
                      </span>
                    </div>
                    <div className="rounded-2xl px-3 py-2 md:px-5 md:py-3 bg-muted/50">
                      <div className="flex gap-1">
                        <span className="animate-bounce inline-block" style={{ animationDelay: "0ms" }}>.</span>
                        <span className="animate-bounce inline-block" style={{ animationDelay: "150ms" }}>.</span>
                        <span className="animate-bounce inline-block" style={{ animationDelay: "300ms" }}>.</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
        
        <CardContent className="border-t pt-3 md:pt-4 bg-muted/30 pb-3 md:pb-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading) handleGenerate();
                }
              }}
              className="min-h-[50px] md:min-h-[60px] resize-none text-sm md:text-base"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                onClick={handleStopGeneration}
                size="icon"
                className="h-[50px] w-[50px] md:h-[60px] md:w-[60px] shadow-md flex-shrink-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                size="icon"
                className="h-[50px] w-[50px] md:h-[60px] md:w-[60px] shadow-md flex-shrink-0"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share AI Response</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button onClick={() => shareToSocial("whatsapp")} className="gap-2">
              <Share2 className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button onClick={() => shareToSocial("facebook")} className="gap-2">
              <Share2 className="w-4 h-4" />
              Facebook
            </Button>
            <Button onClick={() => shareToSocial("twitter")} className="gap-2">
              <Share2 className="w-4 h-4" />
              Twitter
            </Button>
            <Button onClick={() => shareToSocial("linkedin")} className="gap-2">
              <Share2 className="w-4 h-4" />
              LinkedIn
            </Button>
            <Button onClick={() => shareToSocial("tiktok")} className="gap-2">
              <Share2 className="w-4 h-4" />
              TikTok
            </Button>
            <Button onClick={() => shareToSocial("instagram")} className="gap-2">
              <Share2 className="w-4 h-4" />
              Instagram
            </Button>
            <Button onClick={() => shareToSocial("youtube")} className="gap-2">
              <Share2 className="w-4 h-4" />
              YouTube
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}