import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Sparkles, User, Award, HelpCircle, ArrowRight, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export default function MockInterviewCoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I am your Senior MLOps Engineer mentor and technical interviewer. I'm here to help you prepare for your technical assessment.\n\nYou can ask me any question about the 14 assessment sections, or type in your answers to practice questions and let me **grade your implementation approach** against our evaluation rubric.\n\nSelect a preset topic below to start, or type your own query!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gradingMode, setGradingMode] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const presetPrompts = [
    {
      label: "Explain Determinism (Seed)",
      prompt: "Explain why a fixed random seed is critical for reproducibility, and give three real-world examples in ML pipelines.",
      type: "explain"
    },
    {
      label: "Metrics on Error (Observability)",
      prompt: "Why must metrics.json be written even if the pipeline crashes? Show a conceptual Python code structure.",
      type: "explain"
    },
    {
      label: "Test My Code: Rolling Mean",
      prompt: "Grade my approach: 'I am calculating a rolling mean. I will use a for-loop with df.iterrows() and hardcode the window size as 3. If there aren't enough rows, the code will just throw an index error.' Please evaluate this against best practices and auto-fail conditions.",
      type: "grade"
    },
    {
      label: "Docker Layer Caching",
      prompt: "Explain why we copy requirements.txt before the rest of our source code in a Dockerfile, and how it impacts CI/CD builds.",
      type: "explain"
    }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setApiKeyError(null);
    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Format history for Gemini API
    // Gemini SDK expects format: Array<{role: "user" | "model", parts: Array<{text: string}>}>
    const payloadMessages = [...messages, userMessage].map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // Formulate a structured system instruction to align Gemini as a strict Senior MLOps Engineer mentor
    const systemInstruction = gradingMode 
      ? `You are an elite Senior MLOps Engineer conducting a technical assessment. The candidate has submitted an approach. 
         Evaluate their response STRICTLY against these criteria:
         1. Correctness and architectural hygiene.
         2. Performance (e.g. vectorization in pandas instead of loops).
         3. Production-ready error handling.
         4. Observability and containerization hygiene.
         
         Identify any "Auto-Fail Conditions" they are triggering (e.g. hardcoded paths, lack of metrics output on crash, slow loops).
         Provide feedback in clear, constructive, technical, and professional language. Be strict but supportive.`
      : `You are a friendly, expert Senior MLOps Engineer and technical mentor. 
         Your task is to explain MLOps requirements, designs, and architectural patterns in simple English.
         Never write full, completed final solution codes for the user's assignment, but explain structures, mock examples, and best practices.
         Structure your responses with clear headings, bullet points, and code concepts where necessary. Keep the tone professional, objective, and mentorship-oriented.`;

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: payloadMessages,
          systemInstruction
        })
      });

      const data = await response.json();

      if (response.status === 400 && data.error === "API_KEY_MISSING") {
        setApiKeyError(data.message);
        // Fallback simulated response
        simulateLocalResponse(textToSend);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to communicate with API server.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: "model",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "model",
          text: `⚠️ Mentoring system offline: ${err.message || "Connection timed out."}\n\nPlease verify that your dev server is fully functional and running correctly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe fallback offline simulations for when the API Key is not set yet, so they get maximum value
  const simulateLocalResponse = (query: string) => {
    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      if (lower.includes("seed") || lower.includes("determinism")) {
        reply = `### 💡 Mentor Response (Offline Simulation Mode)

It looks like your **GEMINI_API_KEY** is not configured in secrets yet, but here is a Senior MLOps explanation regarding **Random Seeds**:

1. **What is a Random Seed?** It's a starting number for pseudo-random generators. 
2. **Why it matters:** Computers generate random numbers using formulas. A fixed seed ensures the mathematical random sequence is identical on every run.
3. **Implementation in Python:** Set seeds for all active libraries:
   \`\`\`python
   import random
   import numpy as np
   
   random.seed(42)
   np.random.seed(42)
   \`\`\`
4. **Best Practices:** Prefer Numpy's modern generator instances: \`np.random.default_rng(seed)\` to avoid mutating global random state.
5. **Mistake to Avoid:** Mutating the seed value mid-execution or forgetting to seed deep learning frames.
6. **Evaluation Goal:** The interviewer is validating your attention to experimental control and scientific auditability.`;
      } else if (lower.includes("metrics") || lower.includes("finally") || lower.includes("crash")) {
        reply = `### 💡 Mentor Response (Offline Simulation Mode)

It looks like your **GEMINI_API_KEY** is not configured in secrets yet, but here is a Senior MLOps explanation regarding **Resilient Metrics**:

1. **Why metrics.json must always write:** Production container orchestrators (like Airflow or Argo) poll structured telemetry files. If your job crashes and yields no metrics file, it causes complete loss of observability.
2. **Implementation Pattern:** Use Python's \`try-except-finally\` structure:
   \`\`\`python
   try:
       # core logic
       metrics["status"] = "SUCCESS"
   except Exception as e:
       metrics["status"] = "FAILED"
       metrics["error"] = str(e)
       raise e
   finally:
       # Guaranteed to run even during crashes
       with open("metrics.json", "w") as f:
           json.dump(metrics, f)
   \`\`\``;
      } else if (lower.includes("iterrows") || lower.includes("pandas") || lower.includes("grade")) {
        reply = `### 🚨 Mentor Grading Evaluation (Offline Simulation Mode)

Here is an analysis of your proposed approach:

* **Critique 1: Vectorization (CRITICAL):** You proposed using \`df.iterrows()\` in a slow loop. This is a severe MLOps anti-pattern. Large scale production datasets will crawl. You **must** write vectorized operations: \`df['close'].rolling(w).mean()\`.
* **Critique 2: Edge Case Handling (AUTO-FAIL):** You mentioned letting the code throw an "index error" on boundary conditions. This is an immediate fail. MLOps systems must practice **defensive programming**. Handle empty states or small datasets gracefully by flagging validations.
* **Critique 3: Hardcoding (WARNING):** Hardcoding the window size to 3 inside your code file removes deployment flexibility. Externalize it fully inside \`config.yaml\`.`;
      } else {
        reply = `### 💡 Mentor Response (Offline Simulation Mode)

Thank you for your question! To enable my full interactive reasoning and receive detailed personalized code grading, please **configure your GEMINI_API_KEY** in the **Settings > Secrets** panel in AI Studio.

In the meantime, feel free to use the interactive **Visual Simulator** tab to see exactly how seeds, rolling averages, error validation, and telemetry metrics operate step-by-step!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: "model",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div id="mentor-chat-container" className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[750px]">
      {/* Left Column: Instruction & Presets */}
      <div id="mentor-presets-panel" className="xl:col-span-4 bg-[#161B22] rounded-lg border border-slate-800 shadow-sm p-5 flex flex-col justify-between h-full font-sans">
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-950/40 text-blue-400 rounded-lg flex items-center justify-center border border-blue-900/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-100">AI MLOps Mentor & Interviewer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by server-side **Gemini 3.5 Flash**. Simulate real interview questions, type code strategies, or ask for conceptual clarifications.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="p-4 bg-[#0D1117] rounded border border-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Interviewer Grading Mode
              </span>
              <button
                id="grading-mode-toggle"
                onClick={() => setGradingMode(!gradingMode)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${
                  gradingMode ? "bg-blue-600" : "bg-slate-700"
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-all transform ${
                  gradingMode ? "translate-x-4" : "translate-x-0"
                }`}></div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              When **Grading Mode** is active, the mentor acts as a strict technical interviewer—grading your answers against the assessment rubric and warning of any auto-fail patterns.
            </p>
          </div>

          {/* Preset Prompts list */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Suggested Practice Prompts
            </span>
            <div className="space-y-1.5">
              {presetPrompts.map((preset, index) => (
                <button
                  id={`preset-${index}`}
                  key={index}
                  onClick={() => {
                    if (preset.type === "grade") {
                      setGradingMode(true);
                    } else {
                      setGradingMode(false);
                    }
                    handleSendMessage(preset.prompt);
                  }}
                  className="w-full text-left p-2.5 rounded border border-slate-800 bg-[#0D1117] hover:bg-slate-850 text-xs text-slate-300 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-4 font-bold">{preset.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* API key status or error block */}
        {apiKeyError && (
          <div id="api-key-warning" className="bg-amber-950/20 border border-amber-900/30 text-amber-300 rounded p-3 text-xs flex gap-2 items-start leading-normal">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[11px]">Gemini API Offline Mode</p>
              <p className="text-[10px] text-amber-400 mt-0.5">
                To enable live conversational grading and ask custom questions, add your <strong>GEMINI_API_KEY</strong> under <strong>Settings &gt; Secrets</strong>. 
                Falling back to high-quality local concept presets.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Chat Interface */}
      <div id="mentor-chat-panel" className="xl:col-span-8 bg-[#161B22] rounded-lg border border-slate-800 shadow-sm flex flex-col h-full overflow-hidden font-sans">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#161B22]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {gradingMode ? "Strict Technical Grading Mode Active" : "Interactive Q&A Mentoring Sessions"}
            </span>
          </div>
          <button
            id="reset-chat-btn"
            onClick={() => {
              setMessages([
                {
                  id: "welcome",
                  role: "model",
                  text: "Hello! I am your Senior MLOps Engineer mentor and technical interviewer. I'm here to help you prepare for your technical assessment.\n\nYou can ask me any question about the 14 assessment sections, or type in your answers to practice questions and let me **grade your implementation approach** against our evaluation rubric.\n\nSelect a preset topic below to start, or type your own query!",
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              setApiKeyError(null);
            }}
            className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Clear Chat
          </button>
        </div>

        {/* Conversation flow */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
                  isUser 
                    ? "bg-blue-600 text-white border-blue-500" 
                    : "bg-slate-850 text-blue-400 border-slate-800"
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message bubble */}
                <div className={`rounded px-4 py-2.5 border text-xs leading-relaxed space-y-2 whitespace-pre-wrap shadow-sm ${
                  isUser
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-[#0D1117] text-slate-300 border-slate-850"
                }`}>
                  {msg.text}
                  <span className={`block text-[9px] mt-1 text-right ${isUser ? "text-blue-200" : "text-slate-500"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-slate-850 text-blue-400 border border-slate-800 flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-[#0D1117] text-slate-400 rounded px-4 py-2.5 border border-slate-850 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                <span>Interviewer is analyzing your response...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#161B22]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              id="mentor-chat-input"
              type="text"
              placeholder={
                gradingMode 
                  ? "Describe your code approach or paste code outline for grading..." 
                  : "Ask any MLOps conceptual question (e.g. 'Explain rolling mean logic')..."
              }
              className="flex-1 px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              id="mentor-send-btn"
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`px-4 rounded text-white font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${
                inputValue.trim() && !isLoading 
                  ? "bg-blue-600 hover:bg-blue-700 shadow border border-blue-500 active:scale-98" 
                  : "bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
