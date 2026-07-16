import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Clock, RefreshCw, X, HelpCircle, AlertCircle } from "lucide-react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

const STARTER_PROMPTS = [
  "Explain the 5x leverage ceiling for retail safety.",
  "How do liquidation cascades create a liquidity black hole?",
  "What is the Disposition Effect and how does sentiment change it?",
  "How should I structure a hedge overlay for altcoins?"
];

export default function AnalystChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat pane
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages, // Send the full history so the chatbot is contextual
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with the analyst server.");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        role: "model",
        text: data.text || "I apologize, but I could not formulate an analytical response. Please try again."
      };
      
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      setError("Unable to connect to the Analyst server. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div id="analyst-chat-panel" className="bg-white border border-[#EDEDED] flex flex-col h-[600px] overflow-hidden shadow-sm rounded-none text-[#1A1A1A]">
      {/* Panel Header */}
      <div className="bg-white px-5 py-4 border-b border-[#EDEDED] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <div>
            <h4 className="font-display font-semibold text-xs text-black uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-black" />
              Chat with Lead Analyst
            </h4>
            <p className="text-[10px] text-[#717171] font-sans mt-0.5">
              Ask questions about the datasets, sentiment, and risk models.
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            id="clear-chat-btn"
            onClick={handleClearChat}
            className="text-[9px] font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-black font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Main Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA] font-sans">
        {messages.length === 0 ? (
          /* Welcome Banner & Starter suggestions */
          <div className="space-y-5 py-4">
            <div className="bg-white border border-[#EDEDED] p-5 text-center max-w-md mx-auto space-y-3 shadow-sm rounded-none">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-none flex items-center justify-center mx-auto text-black border border-[#EDEDED]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h5 className="font-display font-semibold text-xs text-black uppercase tracking-wider">Lead Analyst Companion</h5>
              <p className="text-[11px] text-[#717171] leading-relaxed font-light">
                Hello. I am the Lead Analyst and Data Scientist behind this cross-sectional study. Ask me any conceptual question about the Fear & Greed Index, the Hyperliquid execution logs, or our 15 business insights and risk guidelines.
              </p>
            </div>

            {/* Starter Suggestion Grid */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className="text-[9px] font-mono font-bold text-[#A1A1A1] uppercase tracking-widest text-center">
                Suggested Q&A Core Topics:
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    id={`starter-prompt-btn-${idx}`}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left px-3 py-2 bg-white border border-[#EDEDED] hover:border-black text-xs text-[#4A4A4A] hover:text-black transition-all flex items-center gap-2 group cursor-pointer rounded-none shadow-sm"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#A1A1A1] shrink-0 group-hover:text-black transition-colors" />
                    <span className="truncate">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`text-[9px] font-mono font-bold text-[#A1A1A1] mb-1 uppercase tracking-widest`}>
                {msg.role === "user" ? "YOU" : "LEAD ANALYST"}
              </div>
              <div 
                className={`max-w-[85%] px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#1A1A1A] text-white rounded-none shadow-sm font-medium"
                    : "bg-white border border-[#EDEDED] text-[#4A4A4A] space-y-2 whitespace-pre-wrap font-sans font-light rounded-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}

        {/* Loading / Generating State */}
        {loading && (
          <div className="flex flex-col items-start">
            <div className="text-[9px] font-mono font-bold text-[#A1A1A1] mb-1 uppercase tracking-widest">LEAD ANALYST</div>
            <div className="bg-white border border-[#EDEDED] rounded-none px-4 py-3 flex items-center gap-2 text-xs text-[#717171] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "300ms" }}></span>
              <span className="font-mono text-[9px] ml-1 tracking-widest uppercase text-[#A1A1A1] font-bold">Querying ledger logs...</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-none p-3 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold uppercase tracking-wider text-[10px]">Connection Error</p>
              <p className="opacity-95 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <form
        id="analyst-chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="bg-white px-3 py-3 border-t border-[#EDEDED] flex gap-2 shrink-0"
      >
        <input
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type an analytical question or risk query..."
          className="flex-1 bg-[#FAFAFA] border border-[#EDEDED] focus:border-black rounded-none py-2 px-3 text-xs text-black focus:outline-none transition-colors"
          disabled={loading}
        />
        <button
          id="send-chat-message-btn"
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-black hover:bg-neutral-800 disabled:bg-[#EDEDED] disabled:text-[#A1A1A1] text-white px-4 py-2 rounded-none transition-colors cursor-pointer text-xs uppercase tracking-wider font-bold"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
