import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '../../components/layout/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      switch (user.role) {
        case 'SUPER_ADMIN':
          navigate('/admin');
          break;
        case 'STAFF':
          navigate('/staff');
          break;
        case 'TEACHER':
          navigate('/teacher');
          break;
        case 'STUDENT':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Harmonize Your Education."
      subtitle="Manage classes, schedules, and progress with our state-of-the-art academy management system."
      badgeText="Legacy Musik ERP"
      badgeColorClass="bg-cyan-400"
    >
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          Enter your credentials to access your dashboard.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 relative group">
          <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-medium">Email Address</Label>
          <Input
            type="email"
            id="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="h-12 px-4 rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="current-password" className="text-zinc-700 dark:text-zinc-300 font-medium">Password</Label>
            <a href="https://wa.me/62812xxxxxx" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors">
              Lupa password? Hubungi WA 0812-xxxx-xxxx
            </a>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="current-password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 px-4 pr-12 rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all duration-300"
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-zinc-900/10 dark:shadow-none hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-zinc-900 hover:text-zinc-600 dark:text-white transition-colors">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}
