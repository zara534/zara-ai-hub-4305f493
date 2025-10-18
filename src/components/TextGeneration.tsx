import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Download, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function TextGeneration() {
  const { aiModels } = useApp();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(aiModels[0]?.id || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stopGeneration, setStopGeneration] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clearOnSwitch, setClearOnSwitch] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [usage, setUsage] = useState({ count: 0, limit: null as number | null });
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousModelRef = useRef<string>(selectedModel);

  useEffect(() => {
    checkUsage();
  }, [user]);

  const checkUsage = async () => {
    if (!user) return;
    
    try {
      const { data: limitsData } = await supabase
        .from("global_limits")
        .select("daily_text_limit")
        .single();

      const { data: usageData } = await supabase
        .from("user_usage_limits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (usageData && usageData.last_reset_date !== new Date().toISOString().split('T')[0]) {
        await supabase
          .from("user_usage_limits")
          .update({
            text_count: 0,
            last_reset_date: new Date().toISOString().split('T')[0]
          })
          .eq("user_id", user.id);
        setUsage({ count: 0, limit: limitsData?.daily_text_limit });
      } else {
        setUsage({ 
          count: usageData?.text_count || 0, 
          limit: limitsData?.daily_text_limit 
        });
      }
    } catch (error) {
      console.error("Error checking usage:", error);
    }
  };

  useEffect(() => {
    loadUsername();
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (previousModelRef.current !== selectedModel && clearOnSwitch) {
      setMessages([]);
    }
    previousModelRef.current = selectedModel;
  }, [selectedModel, clearOnSwitch]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (usage.limit !== null && usage.count >= usage.limit) {
      toast.error(`Daily limit reached! You can generate ${usage.limit} texts per day.`);
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
    setStopGeneration(false);

    const assistantId = (Date.now() + 1).toString();

    try {
      const systemPrompt = model.systemPrompt || model.behavior;
      const usernamePrefix = username ? `The user's name is ${username}. ` : "";
      const enhancedPrompt = `${systemPrompt}. ${usernamePrefix}${userMessage.content}`;
      const response = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(enhancedPrompt)}?model=openai`
      );

      if (!response.ok) {
        throw new Error("Failed to generate text");
      }

      const fullText = await response.text();
      
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      let currentText = "";
      const chars = fullText.split("");
      
      for (let i = 0; i < chars.length; i++) {
        if (stopGeneration) {
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
      
      if (!stopGeneration) {
        toast.success("Response complete!");
        
        // Update usage count
        if (user) {
          try {
            const { data: existingUsage } = await supabase
              .from("user_usage_limits")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();

            if (existingUsage) {
              await supabase
                .from("user_usage_limits")
                .update({ text_count: existingUsage.text_count + 1 })
                .eq("user_id", user.id);
            } else {
              await supabase
                .from("user_usage_limits")
                .insert({
                  user_id: user.id,
                  text_count: 1,
                  image_count: 0,
                  last_reset_date: new Date().toISOString().split('T')[0]
                });
            }
            checkUsage();
          } catch (err) {
            console.error("Error updating usage:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate text. Please try again.");
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
    } finally {
      setIsLoading(false);
      setStopGeneration(false);
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

  const selectedModelData = aiModels.find((m) => m.id === selectedModel);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3 px-2 md:px-4">
      <Card className="shadow-lg border-2">
        <CardContent className="pt-4 md:pt-6 space-y-3">
          <div className="flex items-start md:items-center gap-2 md:gap-3 flex-col md:flex-row justify-between">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
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
            {usage.limit !== null && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {usage.count} / {usage.limit} today
              </span>
            )}
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
              {selectedModelData && (
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 flex-1">
                  {selectedModelData.description || selectedModelData.behavior}
                </p>
              )}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                  <Switch
                    id="clear-switch"
                    checked={clearOnSwitch}
                    onCheckedChange={setClearOnSwitch}
                    className="scale-75"
                  />
                  <Label htmlFor="clear-switch" className="text-xs cursor-pointer">
                    Clear on switch
                  </Label>
                </div>
                {messages.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMessages([]);
                        toast.success("Chat cleared");
                      }}
                      className="flex-shrink-0"
                    >
                      <RefreshCw className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Clear</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex-shrink-0"
                    >
                      <Download className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Download</span>
                    </Button>
                  </>
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
              messages.map((message) => (
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
                  <div
                     className={`rounded-2xl px-3 py-2 md:px-5 md:py-3 max-w-[85%] md:max-w-[75%] transition-all duration-300 ${
                       message.role === "user"
                         ? "bg-primary text-primary-foreground shadow-md"
                         : "bg-gradient-to-br from-muted/60 to-muted/40 border border-primary/20 shadow-soft"
                     }`}
                  >
                    <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    {message.role === "assistant" && message.content && (
                      <div className="flex justify-end mt-1 md:mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(message.content, message.id)}
                          className="h-6 md:h-7 px-1 md:px-2"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-base md:text-lg font-bold text-primary-foreground">U</span>
                    </div>
                  )}
                </div>
              ))
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
                  handleGenerate();
                }
              }}
              className="min-h-[50px] md:min-h-[60px] resize-none text-sm md:text-base"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                onClick={() => setStopGeneration(true)}
                variant="destructive"
                size="icon"
                className="h-[50px] w-[50px] md:h-[60px] md:w-[60px] shadow-md flex-shrink-0"
              >
                <span className="text-xs font-bold">STOP</span>
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
    </div>
  );
}