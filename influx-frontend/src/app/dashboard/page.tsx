'use client';

import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Activity, Target, TrendingUp, Users, Loader2, UserPlus, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [sendingRequests, setSendingRequests] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  const isInfluencer = user?.role === 'INFLUENCER';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/users/stats/me');
        
        // Map icon strings to components
        const iconMap: any = { Users, Activity, Target, TrendingUp };
        const mappedStats = (statsRes.data.stats || []).map((s: any) => ({
          ...s,
          icon: iconMap[s.icon] || Activity
        }));
        
        setStats(mappedStats);
        
        // Fetch real suggestions and connections
        const [{ data: userData }, { data: connectData }] = await Promise.all([
           api.get('/users/search?q='),
           api.get('/connections')
        ]);
        
        setConnections(connectData);
        // Filter out self and take top 4
        const realSuggestions = userData
          .filter((u: any) => u.id !== user?.id)
          .slice(0, 4);
          
        setSuggestions(realSuggestions);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) fetchDashboardData();
  }, [user]);

  const handleConnect = async (recipientId: string) => {
    setSendingRequests(prev => ({ ...prev, [recipientId]: true }));
    try {
      await api.post('/connections', { recipientId });
      setSentRequests(prev => ({ ...prev, [recipientId]: true }));
      toast.success("Connection request sent!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send request";
      toast.error(msg);
      if (msg.includes("already exists")) {
        setSentRequests(prev => ({ ...prev, [recipientId]: true }));
      }
    } finally {
      setSendingRequests(prev => ({ ...prev, [recipientId]: false }));
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-3xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10 p-8 backdrop-blur-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-purple-500/30 blur-[80px] rounded-full pointer-events-none" />
        
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username} ✨
        </h1>
        <p className="text-gray-400 max-w-xl">
          {isInfluencer 
            ? "Your influence is growing. You have 3 new campaign offers waiting for your review today."
            : "Your campaigns are performing well. Review the latest applicant pitches securely."}
        </p>

        <div className="mt-8 flex items-center space-x-4">
          <Link href={`/u/${user?.username}`}>
            <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition">
              View Public Profile
            </button>
          </Link>
          <Link href="/dashboard/settings">
            <button className="px-6 py-3 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition">
              Edit Settings
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
             [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white/5 border border-white/10 animate-pulse rounded-2xl" />
            ))
        ) : (
          stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={stat.label}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Icon size={20} className="text-purple-400" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-400 mt-1">{stat.label}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[400px] flex items-center justify-center">
             <div className="text-center">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                 <Activity className="text-gray-400" />
               </div>
               <h3 className="text-lg font-bold text-white mb-1">No recent activity</h3>
               <p className="text-gray-400 text-sm">When you connect or apply, it will show up here.</p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Suggested Connections</h2>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
             {suggestions.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition cursor-pointer border border-transparent hover:border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold overflow-hidden border border-white/10">
                      {v.role === 'INFLUENCER' && v.influencer_profile?.profile_photo_url ? (
                        <img src={v.influencer_profile.profile_photo_url} className="w-full h-full object-cover" />
                      ) : v.role === 'BRAND' && v.brand_profile?.logo_url ? (
                        <img src={v.brand_profile.logo_url} className="w-full h-full object-cover" />
                      ) : (
                        v.username[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">@{v.username}</p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {v.role === 'INFLUENCER' ? v.influencer_profile?.location : v.brand_profile?.sector}
                      </p>
                    </div>
                  </div>
                  {connections.some(c => (c.requester_id === v.id || c.recipient_id === v.id) && c.status === 'ACCEPTED') ? (
                    <Link 
                      href={`/dashboard/messages?recipientId=${v.id}`}
                      className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1"
                    >
                      <MessageSquare size={12} /> Message
                    </Link>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleConnect(v.id); }}
                      disabled={sendingRequests[v.id] || sentRequests[v.id]}
                      className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg flex items-center gap-1 ${
                        sentRequests[v.id] 
                          ? 'text-green-400 bg-green-400/10' 
                          : 'text-purple-400 hover:text-white hover:bg-purple-600'
                      }`}
                    >
                      {sendingRequests[v.id] ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : sentRequests[v.id] ? (
                        <>
                          <CheckCircle2 size={12} /> Sent
                        </>
                      ) : (
                        <>
                          <UserPlus size={12} /> Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
