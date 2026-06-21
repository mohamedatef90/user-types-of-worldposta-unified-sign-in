import React, { useCallback, useId, useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Bot,
  Info,
  Mic,
  Paperclip,
  Send,
  Sparkles,
  X,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { GoogleGenAI, Chat } from "@google/genai";

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "busy" | "offline";
  icon: React.ElementType;
  gradient: string;
}

const AI_AGENTS: Agent[] = [
  {
    id: "sphere-ai",
    name: "Sphere AI",
    role: "WorldPosta Assistant",
    avatar: "https://i.postimg.cc/bJ3HdM5x/WP-icon.png",
    status: "online",
    icon: Sparkles,
    gradient: "from-[#679a41]/20 to-emerald-500/20",
  },
  {
    id: "gemini",
    name: "Gemini Pro",
    role: "Advanced Analysis",
    avatar: "https://images.unsplash.com/photo-1675271591211-126ad94e4958?w=150&h=150&fit=crop&q=80",
    status: "online",
    icon: Bot,
    gradient: "from-blue-500/20 to-cyan-500/20",
  }
];

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transformOrigin: "bottom right",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 10, x: -10 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
};

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  time?: string;
}

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>(AI_AGENTS[0].id);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I am your premium unified WorldPosta AI Assistant. How can I help you today with billing, cloud products, or server configurations?",
      sender: "ai",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const widgetId = useId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiChatRef = useRef<Chat | null>(null);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const userMessage = message.trim();
    if (!userMessage || isLoading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const newMsg: Message = { id: Date.now().toString(), text: userMessage, sender: 'user', time: currentTime };
    setMessages(prev => [...prev, newMsg]);
    setMessage('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', time: currentTime }]);

    try {
      const apiKey = (window as any).__ENV__?.API_KEY || (process as any).env?.API_KEY || (process as any).env?.GEMINI_API_KEY || '';
      
      if (!apiKey) {
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? {
              ...msg,
              text: `Thanks for asking about: "${userMessage}".\n\nI am configured and running in the WorldPosta Unified Console. To enable live Gemini stream responses, please make sure your Google GenAI API key is configured.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } : msg
          ));
          setIsLoading(false);
        }, 1200);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      if (!geminiChatRef.current) {
        geminiChatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: 'You are a professional, helpful, and premium WorldPosta assistant. You can assist with WorldPosta Mail boxes, CloudEdge infrastructure, SMTP logs, system routing, subscription pricing, and account configs.',
          }
        });
      }

      const responseStream = await geminiChatRef.current.sendMessageStream({ message: userMessage });
      for await (const chunk of responseStream) {
        const chunkText = chunk.text || '';
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: msg.text + chunkText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : msg
        ));
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error with Gemini model call:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, text: "I'm having trouble connecting to my brain systems. Please try again soon!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : msg
      ));
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const currentAgent = AI_AGENTS.find((a) => a.id === selectedAgent) || AI_AGENTS[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-800/80 bg-white/95 dark:bg-[#0d131a]/95 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10"
          >
            {/* Header */}
            <div className="relative border-b border-gray-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-4 overflow-hidden">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-50 dark:opacity-20",
                  currentAgent.gradient
                )}
              />
              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm bg-white">
                      <AvatarImage
                        src={currentAgent.avatar}
                        alt={currentAgent.name}
                        className="object-contain p-1"
                      />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800",
                        currentAgent.status === "online"
                          ? "bg-emerald-500"
                          : currentAgent.status === "busy"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {currentAgent.name}
                      {currentAgent.id === 'sphere-ai' && <Sparkles className="h-3 w-3 text-[#679a41] dark:text-emerald-400" />}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#679a41] dark:text-emerald-400/80">
                        {currentAgent.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setMessages([{
                        id: "welcome",
                        text: "Hello! I am your premium unified WorldPosta AI Assistant. How can I help you today with billing, cloud products, or server configurations?",
                        sender: "ai",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }]);
                      geminiChatRef.current = null;
                    }}
                    title="Reset Chat"
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative z-10 mt-3 flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg">
                 <button 
                   onClick={() => setSelectedAgent(AI_AGENTS[0].id)}
                   className={cn("flex-1 text-xs font-semibold py-1.5 rounded-md transition-all", selectedAgent === AI_AGENTS[0].id ? "bg-white dark:bg-slate-700 shadow-sm text-[#679a41] dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                 >
                   Support Agent
                 </button>
                 <button 
                   onClick={() => setSelectedAgent(AI_AGENTS[1].id)}
                   className={cn("flex-1 text-xs font-semibold py-1.5 rounded-md transition-all", selectedAgent === AI_AGENTS[1].id ? "bg-white dark:bg-slate-700 shadow-sm text-[#679a41] dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                 >
                   Sales Agent
                 </button>
              </div>
            </div>

            {/* Agent Selector */}
            <div className="hidden border-b border-gray-100 dark:border-slate-800/50 p-2 bg-white dark:bg-[#0a0f14]">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-full border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-sm font-medium h-auto hover:bg-slate-50 dark:hover:bg-slate-900/50 px-3 py-2 cursor-pointer transition-colors rounded-lg">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-[#0d131a]/95 border-gray-100 dark:border-slate-800">
                  {AI_AGENTS.map((agent) => {
                    const Icon = agent.icon;
                    return (
                      <SelectItem
                        key={agent.id}
                        value={agent.id}
                        className="cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800/80"
                      >
                        <div className="flex items-center gap-3 py-1">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br",
                              agent.gradient
                            )}
                          >
                            <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-medium dark:text-slate-200">
                              {agent.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {agent.role}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Chat Area */}
             <div className="flex flex-col h-[380px] overflow-y-auto p-4 gap-4 bg-slate-50/50 dark:bg-transparent scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "flex gap-3",
                    msg.sender === "user" ? "flex-row-reverse self-end" : "flex-row"
                  )}
                >
                  <Avatar className="h-8 w-8 border border-gray-200/50 dark:border-slate-700 shadow-sm flex-shrink-0 bg-white">
                    <AvatarImage src={msg.sender === 'user' ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&q=80" : currentAgent.avatar} className={msg.sender === 'user' ? "object-cover" : "object-contain p-0.5"} />
                    <AvatarFallback className={msg.sender === 'user' ? "bg-[#679a41] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"}>
                      {msg.sender === 'user' ? 'ME' : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    "flex max-w-[85%] flex-col gap-1",
                    msg.sender === "user" ? "items-end" : "items-start"
                  )}>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1">
                      {msg.sender === 'user' ? 'You' : currentAgent.name}
                    </span>
                    <div className={cn(
                      "px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm border",
                      msg.sender === "user"
                        ? "rounded-2xl rounded-tr-none bg-[#679a41] text-white border-[#679a41]/20"
                        : "rounded-2xl rounded-tl-none bg-white dark:bg-[#1f2c39] border-gray-150 dark:border-slate-800/60 text-slate-800 dark:text-slate-200"
                    )}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8 border border-gray-200/50 dark:border-slate-700 shadow-sm flex-shrink-0 bg-white">
                    <AvatarImage src={currentAgent.avatar} className="object-contain p-0.5" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1">
                      {currentAgent.name}
                    </span>
                    <div className="rounded-2xl rounded-tl-none bg-white dark:bg-[#1f2c39] px-4 py-3 shadow-sm border border-gray-150 dark:border-slate-800/60 w-16 flex items-center justify-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#679a41] animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8fcb64] animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Area matched to WorldPosta style */}
            <div className="border-t border-gray-150 dark:border-slate-850 p-4 bg-white dark:bg-[#0d131a] rounded-b-2xl">
              <form
                className="relative flex items-center gap-2"
                onSubmit={handleSend}
              >
                <div className="flex-grow flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-[#16212e] border border-gray-200 dark:border-slate-800 focus-within:border-[#679a41] dark:focus-within:border-[#679a41] focus-within:ring-1 focus-within:ring-[#679a41]/20 transition-all shadow-inner">
                  <button 
                    type="button"
                    title="Attach"
                    className="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-[#679a41] transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Ask ${currentAgent.name}...`}
                    className="flex-1 bg-transparent border-none outline-none py-1.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <button 
                    type="button"
                    title="Voice"
                    className="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-[#679a41] transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="h-11 w-11 flex items-center justify-center rounded-full bg-[#679a41] hover:bg-[#5b873a] text-white shadow-md transition-all disabled:opacity-50 disabled:hover:scale-100 hover:scale-105 flex-shrink-0"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
              
              <div className="flex items-center justify-between mt-3 px-1 text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-[#679a41]" />
                  <span>Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded font-mono">Enter</kbd> to send</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#679a41]" />
                  <span className="uppercase tracking-wider text-[#679a41]">Secure Guard</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className={cn(
          "cursor-pointer relative flex items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 z-50",
          isOpen
            ? "h-12 w-12 bg-slate-800 dark:bg-slate-700 text-white rotate-90 scale-95"
            : "h-16 w-16 text-white hover:shadow-[#679a41]/25"
        )}
        style={!isOpen ? {
          background: 'linear-gradient(135deg, #679a41 0%, #8fcb64 45%, #5b873a 75%, #679a41 100%)',
          backgroundSize: '250% 250%',
          animation: 'greenGradientFlow 6s ease-in-out infinite, greenPulseGlow 3s ease-in-out infinite',
          border: '1px solid #8fcb64'
        } : {}}
      >
        {!isOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30" />
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full animate-ping opacity-15 bg-[#8fcb64] pointer-events-none" />
          </>
        )}
        
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-8 w-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        )}
      </motion.button>
      
      <style>{`
        @keyframes greenGradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes greenPulseGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(103, 154, 65, 0.5), 0 0 25px rgba(143, 203, 100, 0.35);
          }
          50% {
            box-shadow: 0 0 32px rgba(103, 154, 65, 0.85), 0 0 45px rgba(143, 203, 100, 0.7);
          }
        }
      `}</style>
    </div>
  );
}
