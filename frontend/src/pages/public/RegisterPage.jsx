import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '../../components/layout/AuthLayout';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    parentPhone: '',
    address: ''
  });
  
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'parentPhone') {
      value = value.replace(/[^0-9]/g, '');
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatus('loading');

    try {
      await api.post('/auth/register', formData);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Pendaftaran gagal, silakan coba lagi');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 font-sans relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-amber-500 via-amber-600 to-zinc-900 opacity-80">
        </div>
        
        <div className="relative z-10 max-w-md w-full bg-white/10 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-3xl shadow-2xl p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30 ring-4 ring-white/10">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Registration Successful!</h2>
          <p className="text-zinc-300 mb-8 leading-relaxed">
            Your account has been created and is currently in <span className="text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-400/10 rounded-md">PENDING</span> status.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <p className="text-zinc-400 text-sm mb-2">
              Please contact our WhatsApp for class consultation and account activation:
            </p>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-2xl font-bold text-white hover:text-emerald-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.89-4.443 9.893-9.892.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.738-.974zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              0812-3456-7890
            </a>
          </div>
          
          <Link to="/" className="inline-flex justify-center w-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold py-3.5 px-4 rounded-xl transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Start Your Musical Journey."
      subtitle="Create an account to enroll in our world-class music programs and track your progress."
      badgeText="Join the Academy"
      badgeColorClass="bg-emerald-400"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Register Account
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-zinc-900 hover:text-zinc-600 dark:text-white transition-colors underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">
            Sign in here
          </Link>
        </p>
      </div>

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2 group">
            <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300 font-medium">Full Name</Label>
            <Input id="name" name="name" type="text" autoComplete="name" required
              value={formData.name} onChange={handleChange} 
              className="h-12 px-4 rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-medium">Email Address</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required
              value={formData.email} onChange={handleChange} 
              className="h-12 px-4 rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="new-password" className="text-zinc-700 dark:text-zinc-300 font-medium">Password</Label>
            <div className="relative">
              <Input id="new-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required
                value={formData.password} onChange={handleChange} minLength={6} 
                className="h-12 px-4 pr-12 rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="parentPhone" className="text-zinc-700 dark:text-zinc-300 font-medium">Parent's Phone (WhatsApp)</Label>
            <Input id="parentPhone" name="parentPhone" type="tel" autoComplete="tel" required
              value={formData.parentPhone} onChange={handleChange} 
              inputMode="numeric" pattern="[0-9]*"
              className="h-12 px-4 rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all"
              placeholder="0812..."
            />
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="address" className="text-zinc-700 dark:text-zinc-300 font-medium">Full Address</Label>
            <textarea id="address" name="address" rows={3} autoComplete="street-address" required
              value={formData.address} onChange={handleChange}
              className="w-full flex rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 px-4 py-3 text-sm focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all placeholder:text-zinc-400"
              placeholder="Enter your complete home address"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={status === 'loading'} 
            className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-zinc-900/10 dark:shadow-none hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>
        
        <p className="text-xs text-center text-zinc-500 mt-4 px-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
