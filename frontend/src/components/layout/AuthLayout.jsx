import { Link } from 'react-router-dom';

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  badgeText, 
  badgeColorClass = "bg-cyan-400" 
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-zinc-950 font-sans">
      {/* Left side — Beautiful Image / Branding */}
      <div className="hidden md:flex md:w-1/2 relative bg-zinc-900 overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-amber-500 via-amber-600 to-zinc-900 opacity-60">
        </div>
        
        <div className="relative z-10 flex flex-col justify-end p-12 lg:p-24 h-full text-white">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 leading-normal pb-2">
            {title}
          </h1>
          <p className="text-lg lg:text-xl text-zinc-300 font-light max-w-md leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-zinc-950 relative overflow-y-auto">
        {/* Back Button */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors group">
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 py-12 mt-8 md:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
