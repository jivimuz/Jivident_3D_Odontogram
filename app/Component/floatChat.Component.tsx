"use client";

import { useState, FormEvent, useEffect, useRef } from "react";

// --- Komponen Kecil untuk Efek Mengetik (Typing Indicator) ---
const TypingIndicator = () => (
  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none w-fit shadow-sm flex gap-1 items-center">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
  </div>
);

export default function FloatChat() {
  const phoneNumber = "6282120741970"; // Ganti nomor kamu

  // Definisi tipe pesan
  type Message = {
    id: number;
    sender: "bot" | "user";
    text?: string;
    type: "text" | "options" | "action" | "language-selector"; // Tambah language-selector
    options?: Array<{ label: string; value: string; message?: string }>;
    actionLink?: string;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<"id" | "en" | null>(null); // State Bahasa
  const [isTyping, setIsTyping] = useState(false); // State Mengetik
  const [isSelectedLang, setIsSelectedLang] = useState(false); // State Mengetik
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [waktu, setWaktu] = useState("");

  // --- KAMUS BAHASA (Dictionary) ---
  const RESOURCES = {
    id: {
      greeting: "Halo! Saya asisten virtual AI Jivi. Sebelum kita mulai, silakan pilih bahasa Anda.",
      menuGreeting: "Senang bertemu denganmu! 👋 Apa tujuan Anda mengunjungi profil Jivi hari ini?",
      options: [
        { label: "💼 Ingin Merekrut (Hiring)", value: "hiring", message: "Halo Jivi, saya tertarik merekrut Anda." },
        { label: "🤝 Kolaborasi Proyek", value: "project", message: "Halo Jivi, ayo diskusikan proyek kolaborasi." },
        { label: "👋 Sekedar Menyapa", value: "hello", message: "Halo Jivi, salam kenal!" },
      ],
      responseLink: "Baik, saya sudah siapkan tautan ke WhatsApp pribadi Jivi untuk diskusi lebih lanjut. Silakan klik tombol di bawah:",
      btnLabel: "Buka WhatsApp",
      placeholder: "Ketik pesan manual...",
      reset: "Mulai Ulang",
      status: "Asisten AI"
    },
    en: {
      greeting: "Hello! I am Jivi's AI virtual assistant. Before we start, please select your language.",
      menuGreeting: "Nice to meet you! 👋 What brings you to Jivi's profile today?",
      options: [
        { label: "💼 Hiring Inquiry", value: "hiring", message: "Hi Jivi, I am interested in hiring you." },
        { label: "🤝 Project Collaboration", value: "project", message: "Hi Jivi, let's discuss a collaboration." },
        { label: "👋 Just Saying Hi", value: "hello", message: "Hi Jivi, nice to meet you!" },
      ],
      responseLink: "Great! I've prepared a direct link to Jivi's personal WhatsApp for further discussion. Please click below:",
      btnLabel: "Open WhatsApp",
      placeholder: "Type a message...",
      reset: "Restart Chat",
      status: "AI Assistant"
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setWaktu(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    };
    updateTime();
    
    // Inisialisasi pertama kali
    if (messages.length === 0) {
      startConversation();
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // --- FUNGSI LOGIKA CHAT ---

  const startConversation = () => {
    setLanguage(null);
    setMessages([
      {
        id: 1,
        sender: "bot",
        type: "language-selector", // Mulai dengan pilih bahasa
        text: "🌏 Please select your language / Silakan pilih bahasa",
      },
    ]);
  };

  const handleLanguageSelect = (lang: "id" | "en") => {
    setLanguage(lang);
    setIsSelectedLang(true);
    
    // 1. Tambahkan feedback user memilih bahasa
    const userMsgId = Date.now();
    setMessages((prev) => [
      ...prev,
      { 
        id: userMsgId, 
        sender: "user", 
        type: "text", 
        text: lang === "id" ? "🇮🇩 Bahasa Indonesia" : "🇬🇧 English" 
      }
    ]);

    // 2. Bot "Mengetik" lalu menampilkan menu
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const res = RESOURCES[lang];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "bot",
          type: "text",
          text: res.menuGreeting,
        },
        {
          id: Date.now() + 1,
          sender: "bot",
          type: "options",
          options: res.options,
        }
      ]);
    }, 1000); // Delay 1 detik agar terasa natural
  };

  const handleOptionClick = (option: { label: string; value: string; message?: string }) => {
    // Gunakan bahasa yang dipilih, atau default ke ID jika entah kenapa null
    const currentLang = language || "id";
    const res = RESOURCES[currentLang];

    // 1. Pesan User
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", type: "text", text: option.label },
    ]);

    // 2. Efek Mengetik
    setIsTyping(true);

    // 3. Respon Bot
    setTimeout(() => {
      setIsTyping(false);
      
      const finalMessage = option.message || "Hello Jivi";
      const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          type: "text",
          text: res.responseLink,
        },
        {
          id: Date.now() + 2,
          sender: "bot",
          type: "action",
          text: res.btnLabel,
          actionLink: waLink
        }
      ]);
    }, 1200); // Delay sedikit lebih lama untuk respon "berpikir"
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const encodedMessage = encodeURIComponent(userMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setUserMessage("");
    setIsOpen(false);
  };

  const resetChat = () => {
    setMessages([]);
    startConversation();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Helper untuk mendapatkan teks UI saat ini
  const uiText = language ? RESOURCES[language] : RESOURCES['id'];

  return (
    <>
      {/* Jendela Chat */}
      {isOpen && (
        <div className="fixed bottom-[90px] right-5 z-40 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col animate-fade-in-up overflow-hidden border border-gray-200 font-sans">
          
          {/* Header Chat */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Kita pakai Avatar AI style */}
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold border-2 border-white overflow-hidden">
                    <img 
                      src="jivi.jpg" 
                      alt="AI" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <span className="absolute text-[10px]">AI</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-700 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1 text-black">
                  Jivi's Assistant 
                  <span className="bg-green-500/20 text-green-300 text-[10px] px-1 rounded border border-green-500/30">AI</span>
                </h3>
                <p className="text-[10px] text-slate-300 flex items-center gap-1">
                  {language ? uiText.status : "Bot"} • Online
                </p>
              </div>
            </div>
            
            {/* Tombol Close & Reset */}
            <div className="flex items-center gap-2">
                <button onClick={resetChat} title="Reset" className="text-slate-400 hover:text-white transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.3"/>
                    </svg>
                </button>
                <button onClick={toggleChat} className="text-slate-400 hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"/><path d="m6 6 18 18"/>
                    </svg>
                </button>
            </div>
          </div>

          {/* Body Chat */}
          <div className="flex-grow overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar overscroll-contain"
          onWheel={(e) => e.stopPropagation()}>
            <div className="text-center text-[10px] text-gray-400 my-2 uppercase tracking-wider">Today, {waktu}</div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                
                {/* Bubble Text */}
                {msg.type === 'text' && (
                  <div 
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-slate-800 text-white rounded-br-none' 
                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* PEMILIH BAHASA (Language Selector) */}
                {msg.type === 'language-selector' && (
                    <div className="flex flex-col items-center w-full gap-3 my-2">
                        <div className="bg-white p-3 rounded-xl border border-gray-100 text-sm text-center text-gray-600 shadow-sm">
                            {msg.text}
                        </div>
                        <div className="flex gap-3 w-full justify-center">
                            <button 
                                onClick={() => handleLanguageSelect('id')}
                                className="flex-1 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 p-3 rounded-xl transition-all transform hover:-translate-y-1 shadow-sm flex flex-col items-center gap-1"
                            >
                                <span className="text-2xl text-black">🇮🇩</span>
                                <span className="text-xs font-semibold text-gray-700">Indonesia</span>
                            </button>
                            <button 
                                onClick={() => handleLanguageSelect('en')}
                                className="flex-1 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 p-3 rounded-xl transition-all transform hover:-translate-y-1 shadow-sm flex flex-col items-center gap-1"
                            >
                                <span className="text-2xl text-black">🇬🇧</span>
                                <span className="text-xs font-semibold text-gray-700">English</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Opsi Pilihan (Menu) */}
                {msg.type === 'options' && msg.options && (
                  <div className="flex flex-col gap-2 mt-1 w-full max-w-[90%]">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionClick(opt)}
                        className="text-left text-sm bg-white hover:bg-green-50 text-slate-700 hover:text-green-700 border border-gray-200 hover:border-green-300 py-3 px-4 rounded-xl transition-all hover:shadow-sm active:scale-95 flex items-center gap-2 group"
                      >
                        <span className="group-hover:scale-110 transition-transform">{opt.label.split(' ')[0]}</span>
                        <span>{opt.label.substring(opt.label.indexOf(' ') + 1)}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tombol WhatsApp Action */}
                {msg.type === 'action' && (
                  <a 
                    href={msg.actionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-full text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5 w-fit"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    {msg.text}
                  </a>
                )}
              </div>
            ))}

            {/* Indikator Mengetik (AI Thinking) */}
            {isTyping && (
                <div className="flex justify-start animate-fade-in">
                    <TypingIndicator />
                </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer/Input Chat */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder={uiText.placeholder}
                className="flex-grow bg-slate-100 text-gray-700 text-sm p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 border-transparent border transition-all"
              />
              <button
                type="submit"
                disabled={!userMessage.trim() || !isSelectedLang}
                className={`p-3 rounded-full text-white transition-all shadow-sm flex-shrink-0 ${
                    userMessage.trim() &&  isSelectedLang? 'bg-slate-800 hover:bg-slate-900 hover:shadow-md' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div className="text-center mt-2 flex justify-center gap-2 text-[10px] text-gray-400">
                 <span>Powered by Jivi Manual Logic</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-5 right-5 z-50 w-16 h-16  flex items-center justify-center rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            isOpen ? "bg-red-800 rotate-90" : "bg-green-900 hover:bg-green-700 animate-bounce-slow"
        }`}
        aria-label="Toggle Chat"
      >
        {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M18 6 6 18"/><path d="m6 6 18 18"/>
            </svg>
        ) : (
            <div className="relative">
                {/* Ikon Robot/AI Sederhana */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
                </svg>
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </div>
        )}
      </button>
      
      <style jsx>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes fade-in {
             from { opacity: 0; transform: translateY(5px); }
             to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}