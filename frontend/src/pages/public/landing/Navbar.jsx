import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'Event', href: '/events', external: true },
    { name: 'About', href: '/#about' },
    { name: 'Courses', href: '/#courses' },
    { name: 'Grade', href: '/#grades' },
    { name: 'Facility', href: '/#facility' },
    { name: 'Contact', href: '/#contact' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-md shadow-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {/* <img src="/logo.png" alt="Legacy Music" className="h-10" /> */}
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            link.external ? (
              <Link 
                key={link.name} 
                to={link.href}
                className="text-zinc-300 hover:text-gold-500 transition-colors"
              >
                {link.name}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    document.querySelector(link.href.replace('/', ''))?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-zinc-300 hover:text-gold-500 transition-colors"
              >
                {link.name}
              </a>
            )
          ))}
          <div className="h-6 w-px bg-zinc-700"></div>
          <Link to="/login" className="text-zinc-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register">
            <Button className="bg-gold-500 hover:bg-gold-600 text-zinc-950 rounded-full px-6 font-bold">
              Enroll
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-zinc-300" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden absolute top-full left-0 w-full bg-zinc-950 border-t border-zinc-800 shadow-xl py-6 px-6 flex flex-col gap-6">
          {navLinks.map((link) => (
            link.external ? (
              <Link 
                key={link.name} 
                to={link.href}
                onClick={() => setMobileMenu(false)}
                className="text-zinc-300 text-lg hover:text-gold-500"
              >
                {link.name}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    document.querySelector(link.href.replace('/', ''))?.scrollIntoView({ behavior: 'smooth' });
                  }
                  setMobileMenu(false);
                }}
                className="text-zinc-300 text-lg hover:text-gold-500"
              >
                {link.name}
              </a>
            )
          ))}
          <hr className="border-zinc-800" />
          <Link to="/login" onClick={() => setMobileMenu(false)} className="text-zinc-300 text-lg text-center">Sign In</Link>
          <Link to="/register" onClick={() => setMobileMenu(false)} className="w-full">
            <Button className="w-full bg-gold-500 hover:bg-gold-600 text-zinc-950 rounded-full py-6 text-lg font-bold">
              Enroll
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
