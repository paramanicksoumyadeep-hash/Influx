'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const isInfluencer = user?.role === 'INFLUENCER';

  // Unified Form State
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    bio: '',
    description: '',
    sector: '',
    location: '',
    profile_photo_url: '',
    logo_url: '',
    cover_photo_url: '',
    banner_url: '',
    website_url: ''
  });

  useEffect(() => {
    // Fetch current profile data
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/@${user?.username}`);
        const profile = isInfluencer ? data.influencer_profile : data.brand_profile;
        if (profile) {
          setFormData(prev => ({ ...prev, ...profile }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    if (user?.username) fetchProfile();
  }, [user, isInfluencer]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isInfluencer ? '/users/influencer/me' : '/users/brand/me';
      await api.patch(endpoint, formData);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (field: string) => {
    setUploadingField(field);
    const input = document.getElementById('gallery-upload') as HTMLInputElement;
    if (input) input.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingField) return;

    // Check size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, [uploadingField]: base64String }));
      toast.success("Image selected from gallery!");
    };
    reader.readAsDataURL(file);
    
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const handleAutoGen = async (field: string) => {
    try {
      await api.get('/upload/signature');
      const mockUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${Math.random()}`;
      setFormData(prev => ({ ...prev, [field]: mockUrl }));
      toast.success("Random avatar generated!");
    } catch (err) {
       toast.error("Auto-generation failed");
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <Link href="/dashboard/profile" className="flex items-center gap-2 text-gray-400 hover:text-white transition group w-fit">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        <span className="font-medium">Back to Profile</span>
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your public presence and connection details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Images Card */}
        <motion.div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Media \u0026 Branding</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="flex flex-col items-center gap-4">
               <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-purple-500 bg-gray-800 flex items-center justify-center">
                 {formData.profile_photo_url || formData.logo_url ? (
                   <img src={isInfluencer ? formData.profile_photo_url : formData.logo_url} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-gray-500 text-sm">No Image</span>
                 )}
               </div>
               <button type="button" onClick={() => handleUploadClick(isInfluencer ? 'profile_photo_url' : 'logo_url')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition">
                 Upload Avatar
               </button>
             </div>

             <div className="flex-1 w-full space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cover Banner URL (or Upload)</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={isInfluencer ? formData.cover_photo_url : formData.banner_url}
                      onChange={(e) => setFormData({...formData, [isInfluencer ? 'cover_photo_url' : 'banner_url']: e.target.value})}
                      placeholder="https://..." 
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    />
                    <button type="button" onClick={() => handleUploadClick(isInfluencer ? 'cover_photo_url' : 'banner_url')} className="px-6 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition whitespace-nowrap">
                      Gallery
                    </button>
                    <button type="button" onClick={() => handleAutoGen(isInfluencer ? 'cover_photo_url' : 'banner_url')} className="px-6 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition whitespace-nowrap">
                      Auto Gen
                    </button>
                  </div>
               </div>
             </div>
          </div>
          {/* Hidden File Input */}
          <input 
            type="file" 
            id="gallery-upload" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </motion.div>

        {/* Identity Card */}
        <motion.div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md space-y-6">
          <h2 className="text-xl font-bold border-b border-white/10 pb-4">Personal Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {isInfluencer ? "Full Name" : "Company Name"}
              </label>
              <input 
                type="text" 
                value={isInfluencer ? formData.full_name : formData.company_name}
                onChange={(e) => setFormData({...formData, [isInfluencer ? 'full_name' : 'company_name']: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
              <input 
                type="text" 
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Los Angeles, CA"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {isInfluencer ? "Bio" : "Company Description"}
            </label>
            <textarea 
              rows={4}
              value={isInfluencer ? formData.bio : formData.description}
              onChange={(e) => setFormData({...formData, [isInfluencer ? 'bio' : 'description']: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 transition"
            />
          </div>

          {!isInfluencer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sector</label>
                  <input type="text" value={formData.sector || ''} onChange={e => setFormData({...formData, sector: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 transition" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Website URL</label>
                  <input type="text" value={formData.website_url || ''} onChange={e => setFormData({...formData, website_url: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 transition" />
               </div>
            </div>
          )}
        </motion.div>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
           <button 
             type="submit" 
             disabled={loading}
             className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl flex items-center space-x-2 transition"
           >
             {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Save Settings</span>}
           </button>
        </div>

      </form>
    </div>
  );
}
