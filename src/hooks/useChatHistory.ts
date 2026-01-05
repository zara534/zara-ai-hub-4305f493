import { useState, useEffect } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  modelId: string;
  modelName: string;
  modelEmoji: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  title: string;
}

const CHAT_HISTORY_KEY = "zara_chat_history";
const MAX_SESSIONS = 50;

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing chat history:", e);
        setSessions([]);
      }
    }
  }, []);

  const saveSessions = (newSessions: ChatSession[]) => {
    const trimmed = newSessions.slice(0, MAX_SESSIONS);
    setSessions(trimmed);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
  };

  const createSession = (modelId: string, modelName: string, modelEmoji: string): ChatSession => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      modelId,
      modelName,
      modelEmoji,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: "New Chat"
    };
    saveSessions([newSession, ...sessions]);
    return newSession;
  };

  const updateSession = (sessionId: string, messages: ChatMessage[]) => {
    const title = messages.find(m => m.role === "user")?.content.slice(0, 40) || "New Chat";
    const updated = sessions.map(s => 
      s.id === sessionId 
        ? { ...s, messages, updatedAt: new Date().toISOString(), title: title + (title.length >= 40 ? "..." : "") }
        : s
    );
    saveSessions(updated);
  };

  const deleteSession = (sessionId: string) => {
    saveSessions(sessions.filter(s => s.id !== sessionId));
  };

  const clearAllSessions = () => {
    saveSessions([]);
  };

  const getSession = (sessionId: string) => {
    return sessions.find(s => s.id === sessionId);
  };

  return {
    sessions,
    createSession,
    updateSession,
    deleteSession,
    clearAllSessions,
    getSession
  };
}
