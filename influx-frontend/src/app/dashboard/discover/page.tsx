'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  MapPin, 
  ExternalLink, 
  TrendingUp, 
  Filter, 
  Loader2,
  ChevronRight,
  Briefcase,
  Star,
  UserPlus,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'INFLUENCER' | 'BRAND'>('ALL');
  const [connections, setConnections] = useState<any[]>([]);
  const [sendingRequests, setSendingRequests] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const url = `/users/search?q=${encodeURIComponent(query)}${activeTab !== 'ALL' ? `\u0026role=${activeTab}` : ''}`;
        const [{ data }, { data: connectionData }] = await Promise.all([
          api.get(url),
          api.get('/connections')
        ]);
        setResults(data);
        setConnections(connectionData);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, activeTab]);

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white">Discover</h1>
          <p className="text-gray-400 font-medium">
            {query ? `Showing results for "${query}"` : "Explore curated influencers and premium brands"}
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          {(['ALL', 'INFLUENCER', 'BRAND'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}s
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
           <div className="p-6 bg-white/5 rounded-full border border-white/10 text-gray-500">
             <Search size={40} />
           </div>
           <div>
             <h3 className="text-xl font-bold text-white">No results found</h3>
             <p className="text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
           </div>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {results.map((profile, i) => {
              const profileDetails = profile.role === 'INFLUENCER' ? profile.influencer_profile : profile.brand_profile;
              const name = profile.role === 'INFLUENCER' ? profileDetails?.full_name : profileDetails?.company_name;
              const avatar = profile.role === 'INFLUENCER' ? profileDetails?.profile_photo_url : profileDetails?.logo_url;
              const niche = profile.role === 'INFLUENCER' ? 'Influencer' : (profileDetails?.sector || 'Brand');

              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-md relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/u/${profile.username}`} target="_blank">
                      <ExternalLink size={18} className="text-gray-400 hover:text-purple-400" />
                    </Link>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-800 border-2 border-white/5 shrink-0">
                      {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xl font-black">
                          {name?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg line-clamp-1">{name}</h3>
                      <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">{niche}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                        <MapPin size={12} /> {profileDetails?.location || 'Global'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Growth</p>
                      <div className="flex items-center gap-1 text-green-400">
                        <TrendingUp size={14} /> <span className="text-sm font-black">+4.2%</span>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Score</p>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={14} fill="currentColor" /> <span className="text-sm font-black">9.8</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {connections.some(c => (c.requester_id === profile.id || c.recipient_id === profile.id) && c.status === 'ACCEPTED') ? (
                      <Link 
                        href={`/dashboard/messages?recipientId=${profile.id}`}
                        className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-500/20"
                      >
                        <MessageSquare size={16} /> Message
                      </Link>
                    ) : (
                      <button 
                        onClick={() => handleConnect(profile.id)}
                        disabled={sendingRequests[profile.id] || sentRequests[profile.id]}
                        className={`flex-1 py-3 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                          sentRequests[profile.id]
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-white text-gray-900 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        {sendingRequests[profile.id] ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : sentRequests[profile.id] ? (
                          <>
                            <CheckCircle2 size={16} /> Sent
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} /> Connect
                          </>
                        )}
                      </button>
                    )}
                    <Link href={`/u/${profile.username}`} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition">
                       <ExternalLink size={20} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}
