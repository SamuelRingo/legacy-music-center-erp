import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (Kunci rahasia diambil dari file .env.local)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Halo! Selamat datang di Legacy Music Center. Apakah ada yang bisa saya bantu?', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Otomatis scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!genAI) {
      setMessages(prev => [...prev, { text: input, isBot: false }, { text: 'Maaf, API Key Gemini Anda belum dimasukkan. Silakan cek file panduan untuk cara memasukkannya ya!', isBot: true }]);
      setInput('');
      return;
    }

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      // Menggunakan model Gemini 3.5 Flash sesuai dengan standar API terbaru
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
      
      // Memberikan prompt sistem agar AI tahu karakternya
      const prompt = `Anda adalah Customer Service virtual yang sangat ramah, profesional, dan membantu untuk sekolah musik bernama "Legacy Music Center". Jawablah pertanyaan berikut dengan singkat, informatif, dan menggunakan bahasa Indonesia yang baik: "${userMessage}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { text: text, isBot: true }]);
    } catch (error) {
      console.error("Error Detail:", error);
      setMessages(prev => [...prev, { text: `Gagal menyambung: ${error.message || "Unknown error"}. Coba periksa koneksi atau API Key.`, isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Tombol Floating */}
      <button 
        className={`chatbot-btn ${isOpen ? 'hidden' : ''}`} 
        onClick={() => setIsOpen(true)} 
        title="Chat dengan AI"
      >
        <MessageSquare size={28} />
      </button>

      {/* Jendela Chat */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        
        {/* Header Chat */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="bot-avatar">AI</div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'white', fontWeight: 600 }}>Legacy Assistant</h3>
              <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--primary)', fontWeight: 600 }}>Online</p>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}><X size={24} /></button>
        </div>
        
        {/* Area Pesan */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.isBot ? 'bot' : 'user'}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble bot typing">
              Mengetik<span>.</span><span>.</span><span>.</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Area Input */}
        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ketik pesan Anda..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn" disabled={isLoading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
