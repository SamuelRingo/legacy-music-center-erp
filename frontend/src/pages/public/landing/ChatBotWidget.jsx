import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import api from '../../../lib/api';
import { useLandingContent } from './useLandingContent';

export default function ChatBotWidget() {
  const { data, loading } = useLandingContent('chatbot', { greeting: 'Halo! Selamat datang di Legacy Music Center. Apakah ada yang bisa saya bantu?' });
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && data && data.greeting) {
      setMessages([{ text: data.greeting, isBot: true }]);
    }
  }, [loading, data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/public/chatbot', { message: userMessage });
      if (res.data && res.data.reply) {
        setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
      } else {
        throw new Error('No reply from server');
      }
    } catch (error) {
      const apiError = error.response?.data?.error;
      const fallbackError = 'Maaf, chatbot sedang tidak tersedia. Silakan hubungi WA 0812-xxxx-xxxx.';
      setMessages(prev => [...prev, { 
        text: apiError || fallbackError, 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gold-500 text-zinc-950 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/20 hover:scale-110 transition-transform z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      <div className={`fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-3rem)] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 text-zinc-950 font-bold rounded-full flex items-center justify-center">
              AI
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Legacy Musik Bot</h3>
              <p className="text-gold-500 text-xs">Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.isBot ? 'bg-zinc-800 text-zinc-200 rounded-tl-none' : 'bg-gold-500 text-zinc-950 rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-900">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan Anda..."
              disabled={isLoading}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-gold-500 disabled:opacity-50 transition-colors"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 w-8 h-8 flex items-center justify-center bg-gold-500 text-zinc-950 rounded-full disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
