"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function RegisterInfluencerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    platform: 'Instagram'
  });
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register/influencer', formData);
      setAuth(data.user, data.accessToken);
      toast.success("Welcome to INFLUX!");
      // Adding a small timeout ensures state flushes properly before route change
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden py-20">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism w-full max-w-xl p-8 rounded-3xl z-10 box-border"
      >
        <h1 className="text-3xl font-bold mb-2">Influencer Application</h1>
        <p className="text-text-secondary mb-8">Join the premier network of creators</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Full Name</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">@handle (Username)</label>
              <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Email</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Primary Platform</label>
            <select name="platform" value={formData.platform} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white appearance-none">
              <option value="Instagram" className="bg-background text-white">Instagram</option>
              <option value="YouTube" className="bg-background text-white">YouTube</option>
              <option value="TikTok" className="bg-background text-white">TikTok</option>
              <option value="Twitter" className="bg-background text-white">Twitter</option>
              <option value="Facebook" className="bg-background text-white">Facebook</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Password</label>
              <input type="password" name="password" required minLength={8} value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Confirm Password</label>
              <input type="password" name="confirmPassword" required minLength={8} value={formData.confirmPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/80 transition-all text-white font-semibold py-3 rounded-xl shadow-[0_0_15px_rgba(75,27,130,0.5)] mt-4 disabled:opacity-50">
            {isLoading ? "Creating Profile..." : "Complete Setup"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
