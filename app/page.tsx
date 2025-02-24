"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  AlertTriangle,
  Loader2,
  Send,
  Menu,
  ChevronRight,
  MessageSquare,
  Mic,
  MicOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { emergencyCategories, initialSuggestions } from "@/lib/constants";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  // @ts-ignore
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedCategory) {
      setSuggestions(initialSuggestions[selectedCategory] || []);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (
      (typeof window !== "undefined" && "SpeechRecognition" in window) ||
      "webkitSpeechRecognition" in window
    ) {
      const SpeechRecognition =
        // @ts-ignore
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // @ts-ignore
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          // @ts-ignore
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setInput(transcript);

        // Reset silence timer when speech is detected
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
        setSilenceTimer(
          setTimeout(() => {
            if (isListening) {
              recognition.stop();
              setIsListening(false);
            }
          }, 3000)
        ); // Stop after 3 seconds of silence
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
      };

      setRecognition(recognition);

      return () => {
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
      };
    }
  }, [isListening, silenceTimer]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    } else {
      setInput(""); // Clear input when starting new recording
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening, silenceTimer]);

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

      const newSuggestions = data.suggestions || [];
      setSuggestions(newSuggestions);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          suggestions: newSuggestions,
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

    // Stop listening if active
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    }

    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input after sending
    await getAIResponse(input);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const userMessage = {
      role: "user" as const,
      content: suggestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await getAIResponse(suggestion);
  };

  return (
    <div className="flex h-screen bg-zinc-900">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-800 p-4 hidden md:block border-r border-zinc-700">
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
                "w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-between group",
                selectedCategory === category
                  ? "bg-emerald-500 text-white"
                  : "text-zinc-300 hover:bg-zinc-700"
              )}
            >
              {category}
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  selectedCategory === category
                    ? "rotate-90"
                    : "opacity-0 group-hover:opacity-100"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-zinc-800 p-4 flex items-center justify-between border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Menu className="h-6 w-6 text-zinc-400 md:hidden" />
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <span className="text-white font-medium">
              {selectedCategory || "Select Emergency Category"}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                message.role === "user"
                  ? "justify-end"
                  : "justify-start max-w-4xl"
              )}
            >
              {message.role === "assistant" && (
                <Shield className="h-8 w-8 text-emerald-500 mt-1 flex-shrink-0" />
              )}
              <div
                className={cn(
                  "rounded-lg shadow-lg",
                  message.role === "user" ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <div className="p-4">
                  <div
                    className={cn(
                      "prose prose-sm max-w-none",
                      message.role === "user"
                        ? "text-white"
                        : "text-zinc-100 prose-headings:text-emerald-400 prose-strong:text-emerald-400"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                  <time className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </time>
                </div>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 bg-zinc-800/50 p-4 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing response...</span>
            </div>
          )}
        </div>

        {/* Suggestions Panel */}
        {suggestions.length > 0 && (
          <div className="p-4 bg-zinc-800/50 border-t border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">
              {messages.length === 0
                ? "Common Emergency Situations:"
                : "Related Scenarios:"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full text-sm hover:bg-zinc-700 transition-colors flex items-center gap-1 group"
                >
                  <MessageSquare className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-zinc-800 border-t border-zinc-700"
        >
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
              className="flex-1 bg-zinc-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder-zinc-500"
            />
            {recognition && (
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                )}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || loading || !selectedCategory}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
