"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { volunteerSignIn, volunteerSignUp } from '@/lib/volunteerAuth';
import { Button } from '@/components/ui/button';
import { Heart, UserPlus } from 'lucide-react';

export default function VolunteerAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const { data, error } = await volunteerSignIn(email, password);
        
        if (error) {
          setError(error.message || 'Login failed');
        } else {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => {
            router.push('/volunteer/dashboard');
            router.refresh();
          }, 1000);
        }
      } else {
        if (!name) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        
        const { data, error } = await volunteerSignUp(name, email, password);
        
        if (error) {
          if (error.code === '23505') {
            setError('Email already registered');
          } else {
            setError(error.message || 'Signup failed');
          }
        } else {
          setMessage('Account created successfully! Redirecting...');
          setTimeout(() => {
            router.push('/volunteer/dashboard');
            router.refresh();
          }, 1000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-slide-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 rounded-3xl shadow-xl mb-4 animate-pulse-glow">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Volunteer Portal
          </h1>
          <p className="text-black">
            {isLogin ? 'Sign in to monitor patients' : 'Join as a volunteer'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-rose-100/50 animate-slide-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-black"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-black"
                placeholder="volunteer@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-black"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:from-rose-700 hover:via-pink-700 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? (
                    <>
                      <Heart className="w-5 h-5" />
                      Sign In as Volunteer
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Sign Up as Volunteer
                    </>
                  )}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up as volunteer" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <a
              href="/auth"
              className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Back to User Login
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Volunteer access for monitoring patient health data
        </p>
      </div>
    </div>
  );
}
