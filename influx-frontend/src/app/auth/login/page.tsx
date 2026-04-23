"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      setAuth(data.user, data.accessToken);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism w-full max-w-md p-8 rounded-3xl z-10 box-border"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-text-secondary mb-8">Sign in to your INFLUX account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">Email or Username</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
              placeholder="Enter your credential"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-secondary">Password</label>
              <Link href="#" className="text-xs text-primary hover:text-accent transition-colors">Forgot Password?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/80 transition-all text-white font-semibold py-3 rounded-xl shadow-[0_0_15px_rgba(75,27,130,0.5)] disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Don't have an account? <Link href="/auth/register" className="text-white hover:text-accent transition-colors">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
