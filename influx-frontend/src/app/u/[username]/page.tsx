'use client';

import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Instagram, Twitter, Youtube, UserPlus, MessageSquare, Loader2, UserCheck, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const { user: currentUser } = useAuthStore();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('NONE');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: profile } = await api.get(`/users/@${username}`);
        setProfileData(profile);

        if (currentUser && currentUser.id !== profile.id) {
          const { data: connections } = await api.get('/connections');
          const connection = connections.find((c: any) => 
            (c.requester_id === currentUser.id && c.recipient_id === profile.id) ||
            (c.requester_id === profile.id && c.recipient_id === currentUser.id)
          );
          
          if (connection) {
            setConnectionStatus(connection.status);
            setConnectionId(connection.id);
          }
        }
      } catch (err) {
        console.error("Fetch Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username, currentUser]);

  const handleMessage = async () => {
    if (!profileData) return;
    try {
      const { data: conv } = await api.post('/conversations', { recipientId: profileData.id });
      window.location.href = '/dashboard/messages';
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  };

  const handleConnect = async () => {
    if (!currentUser) {
      toast.error("Please login to connect");
      return;
    }
    if (!profileData) return;

    setConnecting(true);
    try {
      const { data } = await api.post('/connections', { recipientId: profileData.id });
      setConnectionStatus('PENDING');
      setConnectionId(data.connection.id);
      toast.success("Connection request sent!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white"><Loader2 className="animate-spin text-purple-500" size={48} /></div>;
  }

  if (!profileData) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white text-2xl font-bold">404 - Profile Not Found</div>;
  }

  const isInfluencer = profileData.role === 'INFLUENCER';
  const profileDetails = isInfluencer ? profileData.influencer_profile : profileData.brand_profile;
  const isOwnProfile = currentUser?.id === profileData.id;

  const bannerUrl = isInfluencer ? profileDetails?.cover_photo_url : profileDetails?.banner_url;
  const avatarUrl = isInfluencer ? profileDetails?.profile_photo_url : profileDetails?.logo_url;
  const displayName = isInfluencer ? profileDetails?.full_name : profileDetails?.company_name;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      
      {/* Cover Banner */}
      <div className="w-full h-64 md:h-80 bg-gray-900 relative">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-gray-900 to-black" />
        )}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-950 to-transparent" />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main Info) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Identity Panel */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16 sm:-mt-20">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-950 bg-gray-800 shadow-2xl relative">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-black">
                           {displayName ? displayName[0] : username[0].toUpperCase()}
                        </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left mb-2">
                    <h1 className="text-4xl font-black tracking-tight">{displayName || `@${username}`}</h1>
                    <p className="text-gray-400 font-medium">@{username} • {isInfluencer ? 'Influencer' : 'Brand'}</p>
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {connectionStatus === 'NONE' ? (
                      <button 
                        onClick={handleConnect}
                        disabled={connecting}
                        className="flex-1 sm:flex-none px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-purple-500/25"
                      >
                        {connecting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />} Connect
                      </button>
                    ) : connectionStatus === 'PENDING' ? (
                      <div className="flex-1 sm:flex-none px-6 py-3 bg-white/5 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-white/10 cursor-default">
                        <Clock size={18} /> Pending
                      </div>
                    ) : (
                      <button className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition border border-white/10">
                        <UserCheck size={18} /> Connected
                      </button>
                    )}
                    
                    {(connectionStatus === 'ACCEPTED' || isOwnProfile) && (
                      <button 
                        onClick={handleMessage}
                        className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition border border-white/10"
                      >
                        <MessageSquare size={18} /> Message
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bio & Details */}
              <div className="space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed">
                  {isInfluencer ? profileDetails?.bio : profileDetails?.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-medium">
                  {profileDetails?.location && (
                    <div className="flex items-center gap-1"><MapPin size={16} className="text-purple-400" /> {profileDetails.location}</div>
                  )}
                  {(!isInfluencer && profileDetails?.sector) && (
                    <div className="flex items-center gap-1"><Target size={16} className="text-blue-400" /> {profileDetails.sector}</div>
                  )}
                  {(!isInfluencer && profileDetails?.website_url) && (
                    <div className="flex items-center gap-1"><LinkIcon size={16} className="text-pink-400" /> <a href={profileDetails.website_url} target="_blank" className="hover:text-white transition">{new URL(profileDetails.website_url).hostname}</a></div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Content Tabs area (Mocked) */}
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.1 }}
               className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[300px]"
            >
              <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
              <div className="flex items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl">
                 <p className="text-gray-500 font-medium">No recent activity to show.</p>
              </div>
            </motion.div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
            
            {/* Stats Overview */}
            {isInfluencer && (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-6 backdrop-blur-xl"
              >
                <h3 className="font-bold text-gray-400 mb-4 text-sm uppercase tracking-wider">Audience Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-black text-white">{profileDetails?.total_followers ? (profileDetails.total_followers / 1000).toFixed(1) + 'k' : 'N/A'}</p>
                    <p className="text-sm font-medium text-gray-400">Total Reach</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{profileDetails?.engagement_rate ? profileDetails.engagement_rate + '%' : 'N/A'}</p>
                    <p className="text-sm font-medium text-gray-400">Engagement</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Social Links */}
            <motion.div 
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.1 }}
               className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
            >
               <h3 className="font-bold mb-4">Connected Platforms</h3>
               <div className="space-y-3">
                 {/* Mocked social mapping */}
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-lg"><Instagram size={18} className="text-white" /></div>
                      <span className="font-medium">@{username}_ig</span>
                   </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500 rounded-lg"><Youtube size={18} className="text-white" /></div>
                      <span className="font-medium">{username} Channel</span>
                   </div>
                 </div>
               </div>
            </motion.div>

            {/* Rates Table */}
            {isInfluencer && (
               <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
               >
                 <h3 className="font-bold mb-4">Standard Rates</h3>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-300">Dedicated Video</span>
                      <span className="font-black text-green-400">$850</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-300">Instagram Static Post</span>
                      <span className="font-black text-green-400">$350</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Brand Integration (60s)</span>
                      <span className="font-black text-green-400">$1,200</span>
                    </div>
                 </div>
               </motion.div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}

// Ensure lucide-react Target is imported by mocking it at bottom for quick fix if omitted above
import { Target } from 'lucide-react';
