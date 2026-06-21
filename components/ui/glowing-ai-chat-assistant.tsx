import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Link, Code, Mic, Send, Info, Bot, X, Sparkles, Check, Play, User } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time?: string;
}

const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real messaging states
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      text: "Hello! I am your premium unified WorldPosta AI Assistant. How can I help you today with billing, cloud products, or server configurations?", 
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for chat instance matching Chatbot.tsx behavior
  const geminiChatRef = useRef<Chat | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [messages, isChatOpen]);

  const handleSend = async () => {
    const userMessage = message.trim();
    if (!userMessage || isLoading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const newMsg: Message = { id: Date.now().toString(), text: userMessage, sender: 'user', time: currentTime };
    setMessages(prev => [...prev, newMsg]);
    setMessage('');
    setCharCount(0);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    // Add placeholder for the streaming response
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', time: currentTime }]);

    try {
      // Find API key
      const apiKey = (window as any).__ENV__?.API_KEY || (process as any).env?.API_KEY || (process as any).env?.GEMINI_API_KEY || '';
      
      if (!apiKey) {
        // Fallback mock responses if API Key is not set yet
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
      }
    } catch (error) {
      console.error('Error with Gemini model call:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, text: "I'm having trouble connecting to my brain systems. Please try again soon!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        // Check if the click is not on the floating button (which has classes of .floating-ai-button or its children)
        const target = event.target as HTMLElement;
        if (!target.closest('.floating-ai-button')) {
          setIsChatOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating 3D Glowing AI Logo with Blue Gradient Motion & Purple Stroke */}
      <button 
        aria-label="Toggle AI Chat"
        className={`floating-ai-button h-16 w-16 relative rounded-full flex items-center justify-center transition-all duration-500 transform ${
          isChatOpen ? 'rotate-90 scale-95' : 'rotate-0 hover:scale-110'
        } blue-gradient-animate`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          border: '1px solid #a855f7',
        }}
      >
        {/* 3D Glass overlay effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30"></div>
        
        {/* Inner glow outline */}
        <div className="absolute inset-0 rounded-full border border-white/10"></div>
        
        {/* Toggle Icons */}
        <div className="relative z-10 text-white">
          {isChatOpen ? <X className="h-6 w-6 animate-pulse" /> : <Bot className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />}
        </div>
        
        {/* Glowing sweep wave behind the button */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-15 bg-blue-500 pointer-events-none"></div>
      </button>

      {/* Chat Interface */}
      {isChatOpen && (
        <div 
          ref={chatRef}
          className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-2rem)] transition-all duration-300 origin-bottom-right z-50"
          style={{
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
        >
          {/* Responsive height container (h-auto with max-h) cleanly resolves big bottom negative space when messages are short */}
          <div className="relative flex flex-col h-auto max-h-[min(560px,calc(100vh-140px))] rounded-3xl bg-white dark:bg-gradient-to-br dark:from-[#121c27] dark:via-[#0f171e] dark:to-[#0a0f14] border border-gray-200 dark:border-[#679a41]/50 shadow-[0_15px_50px_rgba(0,0,0,0.15),0_0_30px_rgba(103,154,65,0.08)] dark:shadow-[0_0_40px_rgba(103,154,65,0.15),0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden">
            
            {/* Ambient subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#679a41]/8 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            {/* Premium Solid Modern Chat Header - Curved top with safe padding to prevent text clipping */}
            <div className="relative flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-150 dark:border-slate-800/80 bg-slate-900 text-white shadow-sm rounded-t-3xl min-h-[72px]">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-widest uppercase font-black text-[#89cc59] leading-none mb-0.5">WorldPosta</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    Sphere AI <Sparkles className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/20" />
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center gap-1">
                  Gemini Pro
                </span>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat History Section */}
            <div 
              className="relative flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40 dark:bg-transparent scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800/80"
              style={{ overscrollBehaviorY: 'contain' }}
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="h-8 w-8 rounded-full bg-[#121c27] dark:bg-[#1a2635] border border-[#679a41]/30 flex items-center justify-center text-[#679a41] dark:text-emerald-400 flex-shrink-0 shadow-sm z-10 transition-transform hover:scale-115">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.06)] transform transition-all duration-200 relative ${
                      msg.sender === 'user' 
                        ? 'bg-[#679a41] text-white rounded-tr-none whatsapp-user-bubble ml-6 border border-[#679a41]/15' 
                        : 'bg-white dark:bg-[#1f2c39] text-slate-800 dark:text-[#f1f5f9] rounded-tl-none whatsapp-ai-bubble mr-6 border border-gray-150 dark:border-slate-800/60'
                    }`}
                  >
                    <div className="flex flex-col">
                      <p className="whitespace-pre-wrap select-text text-[13.5px] font-normal leading-relaxed">
                        {msg.text}
                      </p>
                      
                      {/* Compact Timestamp directly mapped under message to completely solve unneeded space */}
                      <div className={`flex items-center justify-end gap-1 mt-1.5 select-none text-[9px] font-semibold ${
                        msg.sender === 'user' ? 'text-emerald-100/70' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        <span>{msg.time || '12:00 PM'}</span>
                        {msg.sender === 'user' && (
                          <span className="text-white fill-current flex items-center">
                            <svg viewBox="0 0 16 15" width="13" height="12">
                              <path d="M15.01 3.316a.713.713 0 0 0-.962-.124l-6.843 4.962-2.316-2.11a.715.715 0 0 0-1.01.033.715.715 0 0 0 .033 1.012l2.768 2.521a.713.713 0 0 0 .915.056l7.291-5.287a.713.713 0 0 0 .124-.963zm-3.87 1.48a.723.723 0 0 0-.124-.102.713.713 0 0 0-.962.124l-3.324 2.41a3.02 3.02 0 0 0-.102-.093L3.84 5.021a.715.715 0 0 0-1.01.033.715.715 0 0 0 .033 1.012l2.768 2.521a.713.713 0 0 0 .915.056l4.498-3.264a.715.715 0 0 0 .093-.102z" fill="currentColor"></path>
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 items-start justify-start animate-fade-in">
                  <div className="h-8 w-8 rounded-full bg-[#121c27] dark:bg-[#1a2635] border border-[#679a41]/30 flex items-center justify-center text-[#679a41] dark:text-emerald-400 flex-shrink-0 shadow-sm z-10">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="relative bg-white dark:bg-[#1f2c39] border border-gray-150 dark:border-slate-800/60 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] mr-6 whatsapp-ai-bubble">
                    <span className="w-1.5 h-1.5 bg-[#679a41] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#8fcb64] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Unified Round Pill Controls Bar */}
            <div className="px-5 pb-5 pt-3.5 border-t border-gray-150 dark:border-slate-850 bg-white dark:bg-[#0d131a]">
              <div className="flex items-center gap-2.5">
                
                {/* Round Pill Wrap Container */}
                <div className="flex-grow flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-[#16212e] border border-gray-200 dark:border-slate-800 focus-within:border-[#679a41] dark:focus-within:border-[#679a41] focus-within:ring-2 focus-within:ring-[#679a41]/15 transition-all duration-250 shadow-inner">
                  
                  {/* Plus Trigger Button Inside */}
                  <button 
                    title="File/Image Upload"
                    className="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-[#679a41] dark:hover:text-[#679a41] transition-all"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Input Element */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-transparent border-none outline-none py-1 text-sm font-normal text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:placeholder-slate-500 dark:focus:placeholder-slate-405"
                    placeholder="Ask Sphere AI anything..."
                    disabled={isLoading}
                  />

                  {/* Character Counter Inside */}
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none bg-gray-200/50 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
                    {charCount}/{maxChars}
                  </span>

                  {/* Mic Button Inside */}
                  <button 
                    title="Voice Assistant"
                    className="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-[#679a41] dark:hover:text-[#679a41] transition-all"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                {/* Separated Circular Send Button */}
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !message.trim()}
                  className="p-3 bg-[#679a41] hover:bg-[#5b873a] disabled:opacity-45 disabled:scale-100 border-none rounded-full cursor-pointer transition-all duration-300 text-white shadow-md shadow-[#679a41]/20 hover:scale-105 flex items-center justify-center flex-shrink-0 focus:ring-2 focus:ring-[#679a41]/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Extra helper shortcuts / branding */}
              <div className="flex items-center justify-between mt-3 px-1 text-[9px] text-slate-400 dark:text-slate-500 font-medium font-sans">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-[#679a41]" />
                  <span>Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded text-slate-500 dark:text-slate-400 font-mono text-[9px]">Enter</kbd> to send instantly</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-3 bg-gradient-to-t from-emerald-500 to-[#679a41] rounded"></div>
                  <span className="font-extrabold uppercase tracking-wider text-[#679a41]">Secure Guard</span>
                </div>
              </div>
            </div>

            {/* Floating Glow Overlay */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ 
                background: 'linear-gradient(135deg, rgba(103, 154, 65, 0.03), transparent, rgba(16, 185, 129, 0.03))' 
              }}
            ></div>
          </div>
        </div>
      )}
      
      {/* CSS for animations & dynamic button blue-gradient colors with purple stroke */}
      <style>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes blueGradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes bluePulseGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.5), 0 0 25px rgba(168, 85, 247, 0.35);
          }
          50% {
            box-shadow: 0 0 32px rgba(59, 130, 246, 0.85), 0 0 45px rgba(168, 85, 247, 0.7);
          }
        }

        .blue-gradient-animate {
          background: linear-gradient(135deg, #679a41 0%, #2563eb 45%, #a855f7 75%, #679a41 100%);
          background-size: 250% 250%;
          animation: blueGradientFlow 6s ease-in-out infinite, bluePulseGlow 3s ease-in-out infinite;
        }

        .blue-gradient-animate:hover {
          box-shadow: 0 0 35px rgba(59, 130, 246, 0.95), 0 0 55px rgba(168, 85, 247, 0.8) !important;
          transform: scale(1.1) !important;
        }

        /* Pure CSS chat message tails */
        .whatsapp-user-bubble::after {
          content: '';
          position: absolute;
          top: 0;
          right: -7px;
          width: 0;
          height: 0;
          border-width: 7px;
          border-style: solid;
          border-color: transparent;
          border-top-color: #679a41;
          border-left-color: #679a41;
        }

        .whatsapp-ai-bubble::after {
          content: '';
          position: absolute;
          top: 0;
          left: -7px;
          width: 0;
          height: 0;
          border-width: 7px;
          border-style: solid;
          border-color: transparent;
          border-top-color: #ffffff;
          border-right-color: #ffffff;
        }
        
        .dark .whatsapp-ai-bubble::after {
          border-top-color: #1f2c39;
          border-right-color: #1f2c39;
        }
      `}</style>
    </div>
  );
};

export { FloatingAiAssistant };

