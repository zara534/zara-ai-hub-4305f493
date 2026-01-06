import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  History, 
  Trash2, 
  MessageSquare, 
  Plus,
  Clock,
  Bot
} from "lucide-react";
import { ChatSession } from "@/hooks/useChatHistory";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatHistoryPanelProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
  onNewChat: () => void;
}

export function ChatHistoryPanel({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  onNewChat
}: ChatHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSelectSession = (session: ChatSession) => {
    onSelectSession(session);
    setIsOpen(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(sessionId);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteSession(deleteId);
      setDeleteId(null);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    setIsOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-primary" />
                Chat History
              </SheetTitle>
              {sessions.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowClearDialog(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* New Chat Button */}
          <div className="p-3 border-b">
            <Button 
              onClick={handleNewChat}
              className="w-full gap-2 h-10"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">No chat history</p>
                  <p className="text-sm mt-1">Start a conversation!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-muted/80 ${
                        currentSessionId === session.id 
                          ? "bg-primary/10 border border-primary/30 shadow-sm" 
                          : "hover:shadow-sm"
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Model Emoji */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          currentSessionId === session.id 
                            ? "bg-primary/20" 
                            : "bg-muted"
                        }`}>
                          <span className="text-lg">{session.modelEmoji || "🤖"}</span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-8">
                          <p className="font-medium text-sm leading-tight line-clamp-1">
                            {session.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Bot className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">
                              {session.modelName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-7 w-7 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Delete single session dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all chat history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {sessions.length} conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onClearAll();
                setShowClearDialog(false);
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
