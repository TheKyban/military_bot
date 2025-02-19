"use client";

import { useState } from "react";
import { Shield, AlertTriangle, Loader2, Send, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const emergencyCategories = [
  "Medical Emergency",
  "Hostile Contact",
  "Equipment Failure",
  "Navigation Issues",
  "Communication Loss",
  "Environmental Hazards",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getAIResponse = async (userMessage: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedCategory) return;

    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    await getAIResponse(input);
  };

  return (
    <div className="flex h-screen bg-zinc-900">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-800 p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-emerald-500" />
          <h1 className="text-xl font-bold text-white">MILITARY AI</h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-400 mb-4">
            EMERGENCY CATEGORIES
          </h2>
          {emergencyCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "w-full text-left px-4 py-2 rounded text-sm transition-colors",
                selectedCategory === category
                  ? "bg-emerald-500 text-white"
                  : "text-zinc-300 hover:bg-zinc-700"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Menu className="h-6 w-6 text-zinc-400 md:hidden" />
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <span className="text-white font-medium">
              {selectedCategory || "Select Emergency Category"}
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 max-w-3xl",
                message.role === "user" ? "ml-auto" : ""
              )}
            >
              {message.role === "assistant" && (
                <Shield className="h-8 w-8 text-emerald-500 mt-1" />
              )}
              <div
                className={cn(
                  "rounded-lg p-4",
                  message.role === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-800 text-zinc-100"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <time className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </time>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing response...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedCategory
                  ? "Describe the emergency situation..."
                  : "Please select a category first"
              }
              disabled={!selectedCategory}
              className="flex-1 bg-zinc-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || !selectedCategory}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
