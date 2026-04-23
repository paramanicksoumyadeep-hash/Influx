"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function RegisterBrandPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    sector: 'Tech'
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
      const { data } = await api.post('/auth/register/brand', formData);
      setAuth(data.user, data.accessToken);
      toast.success("Welcome to INFLUX!");
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
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism w-full max-w-xl p-8 rounded-3xl z-10 box-border border-accent/20"
      >
        <h1 className="text-3xl font-bold mb-2">Company Registration</h1>
        <p className="text-text-secondary mb-8">Access the brightest creators on the market</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Company Name</label>
            <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Email</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Company Sector</label>
            <select name="sector" value={formData.sector} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white appearance-none">
              {["Fashion", "Tech", "Food", "Beauty", "Sports", "Finance", "Entertainment", "Healthcare", "Other"].map(s => (
                <option key={s} value={s} className="bg-background text-white">{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Password</label>
              <input type="password" name="password" required minLength={8} value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Confirm Password</label>
              <input type="password" name="confirmPassword" required minLength={8} value={formData.confirmPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-accent/90 hover:bg-accent transition-all text-background font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] mt-4 disabled:opacity-50">
            {isLoading ? "Creating Account..." : "Complete Setup"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
