'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Link as LinkIcon, 
  Instagram, 
  Youtube, 
  Loader2, 
  Edit3, 
  ExternalLink,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function DashboardProfilePage() {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.username) return;
        const { data } = await api.get(`/users/@${user.username}`);
        setProfileData(data);
      } catch (err) {
        toast.error("Failed to load your profile details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  const isInfluencer = user?.role === 'INFLUENCER';
  const profileDetails = isInfluencer ? profileData?.influencer_profile : profileData?.brand_profile;
  
  const bannerUrl = isInfluencer ? profileDetails?.cover_photo_url : profileDetails?.banner_url;
  const avatarUrl = isInfluencer ? profileDetails?.profile_photo_url : profileDetails?.logo_url;
  const displayName = isInfluencer ? profileDetails?.full_name : profileDetails?.company_name;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header / Banner Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-white/10 bg-gray-900/50"
      >
        <div className="h-48 md:h-64 w-full relative">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-900 via-indigo-900 to-black opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        <div className="px-8 pb-8 -mt-12 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-900 bg-gray-800 shadow-2xl relative z-10">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-black">
                  {displayName ? displayName[0] : user?.username?.[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white">{displayName || `@${user?.username}`}</h1>
              <p className="text-gray-400 font-medium">@{user?.username} • {isInfluencer ? 'Influencer' : 'Brand'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Link href="/dashboard/settings">
               <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-purple-500/20">
                 <Edit3 size={18} /> Edit Profile
               </button>
             </Link>
             <Link href={`/u/${user?.username}`} target="_blank">
               <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition">
                 <ExternalLink size={18} /> Public View
               </button>
             </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Details & Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Bio / Description */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
          >
            <h3 className="text-xl font-bold text-white mb-4">About</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              {isInfluencer ? profileDetails?.bio : profileDetails?.description}
              {!(isInfluencer ? profileDetails?.bio : profileDetails?.description) && "No description provided yet. Tell the world about yourself!"}
            </p>
            
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/5 text-gray-400">
               {profileDetails?.location && (
                 <div className="flex items-center gap-2 font-medium">
                   <MapPin size={18} className="text-purple-400" /> {profileDetails.location}
                 </div>
               )}
               {profileDetails?.website_url && (
                 <div className="flex items-center gap-2 font-medium">
                   <LinkIcon size={18} className="text-blue-400" /> 
                   <a href={profileDetails.website_url} target="_blank" className="hover:text-white transition">
                     {new URL(profileDetails.website_url).hostname}
                   </a>
                 </div>
               )}
            </div>
          </motion.div>

          {/* Performance Stats (Mocked for now since schema is light) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <Users size={20} className="text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-green-400">+5.2%</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {isInfluencer ? profileDetails?.total_followers?.toLocaleString() : '124'}
                </p>
                <p className="text-sm font-medium text-gray-400">{isInfluencer ? 'Total Followers' : 'Active Leads'}</p>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                    <TrendingUp size={20} className="text-pink-400" />
                  </div>
                  <span className="text-xs font-bold text-green-400">+1.8%</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {isInfluencer ? profileDetails?.engagement_rate + '%' : '3.2%'}
                </p>
                <p className="text-sm font-medium text-gray-400">{isInfluencer ? 'Avg Engagement' : 'Conv Rate'}</p>
             </div>
          </div>

        </div>

        {/* Right Col: Sidebar specific things */}
        <div className="space-y-8">
           
           {/* Influencer Specific: Rates */}
           {isInfluencer && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white/5 border border-white/10 rounded-3xl p-6"
             >
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-400" /> Standard Rates
                </h3>
                <div className="space-y-3">
                   {/* This would ideally map from profileDetails.standard_rates */}
                   <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-sm">Post</span>
                      <span className="text-white font-bold">$250+</span>
                   </div>
                   <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-sm">Video</span>
                      <span className="text-white font-bold">$600+</span>
                   </div>
                   <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-sm">Story</span>
                      <span className="text-white font-bold">$120+</span>
                   </div>
                </div>
             </motion.div>
           )}

           {/* Platforms */}
           <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6"
           >
              <h3 className="font-bold text-white mb-4">Connected Platforms</h3>
              <div className="space-y-2">
                 <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition">
                    <div className="flex items-center gap-3">
                       <Instagram size={18} className="text-pink-500" />
                       <span className="text-sm font-medium">Instagram</span>
                    </div>
                    <span className="text-xs font-bold text-purple-400">Linked</span>
                 </div>
                 <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition">
                    <div className="flex items-center gap-3">
                       <Youtube size={18} className="text-red-500" />
                       <span className="text-sm font-medium">YouTube</span>
                    </div>
                    <span className="text-xs font-bold text-purple-400">Linked</span>
                 </div>
              </div>
           </motion.div>

           {/* Quick Actions */}
           <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-3xl p-6">
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                 <Link href="/dashboard/connections" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition flex flex-col items-center gap-2">
                    <Briefcase size={20} className="text-purple-400" />
                    <span className="text-xs font-bold">Network</span>
                 </Link>
                 <Link href="/dashboard/promote" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition flex flex-col items-center gap-2">
                    <TrendingUp size={20} className="text-pink-400" />
                    <span className="text-xs font-bold">Boost</span>
                 </Link>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
