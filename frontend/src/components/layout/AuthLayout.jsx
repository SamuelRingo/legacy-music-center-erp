import { Link } from 'react-router-dom';

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  badgeText, 
  badgeColorClass = "bg-cyan-400" 
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-amber-500 via-amber-600 to-zinc-900 font-sans">
      <div className="w-full max-w-md bg-white/95 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>

        <div className="mt-12 mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/20 text-sm font-medium text-zinc-800 dark:text-white mx-auto">
            <span className={`w-2 h-2 rounded-full animate-pulse ${badgeColorClass}`}></span>
            {badgeText}
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{title}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {children}
        </div>
      </div>
    </div>
  );
}
