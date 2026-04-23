'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { UserCheck, UserPlus, Clock, X, Check, Loader2, Search, ExternalLink, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { Users as UsersIcon } from 'lucide-react';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED'>('ALL');

  const fetchConnections = async () => {
    try {
      const { data } = await api.get('/connections');
      setConnections(data);
    } catch (err) {
      console.error("Fetch Connections Error:", err);
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleRespond = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      await api.put(`/connections/${id}`, { status });
      toast.success(`Request ${status === 'ACCEPTED' ? 'accepted' : 'declined'}`);
      fetchConnections();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const filteredConnections = connections.filter(c => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const pendingCount = connections.filter(c => c.status === 'PENDING').length;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Your Network</h1>
          <p className="text-gray-400">Manage your connections and pending requests</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {(['ALL', 'PENDING', 'ACCEPTED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter === f ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()} 
              {f === 'PENDING' && pendingCount > 0 && (
                <span className="ml-2 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
          <p className="text-gray-400 font-medium">Loading your network...</p>
        </div>
      ) : filteredConnections.length === 0 ? (
        <EmptyState 
          icon={UsersIcon}
          title={filter === 'PENDING' ? "No pending requests" : "No connections found"}
          description={filter === 'PENDING' ? "You're all caught up! No one is waiting for your response right now." : "Start growing your network by exploring profiles and sending connection requests."}
          action={{
            label: "Explore Profiles",
            onClick: () => { window.location.href = '/dashboard'; }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredConnections.map((conn) => {
              const isRequester = conn.requester_id === connections[0]?.currentUserId; // This logic needs backend help or comparison with AuthStore
              // Better: Compare with AuthStore inside the map
              const otherUser = conn.requester.id === conn.recipient_id ? conn.recipient : (conn.requester.id === conn.requester.id ? (conn.recipient.id === conn.recipient.id ? conn.recipient : conn.requester) : conn.requester);
              // Simplified: the related user is whichever one is NOT the current user.
              // I'll use a safer approach since I don't have currentUserId directly in the item
              return (
                <ConnectionCard 
                  key={conn.id} 
                  connection={conn} 
                  onRespond={handleRespond}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ConnectionCard({ connection, onRespond }: { connection: any, onRespond: any }) {
  const { user: currentUser } = (require('@/store/authStore')).useAuthStore();
  
  const isRecipient = connection.recipient_id === currentUser?.id;
  const partner = isRecipient ? connection.requester : connection.recipient;
  const isPending = connection.status === 'PENDING';
  
  const displayName = partner.role === 'INFLUENCER' 
    ? (partner.influencer_profile?.full_name || partner.username)
    : (partner.brand_profile?.company_name || partner.username);
    
  const avatarUrl = partner.role === 'INFLUENCER'
    ? partner.influencer_profile?.profile_photo_url
    : partner.brand_profile?.logo_url;

  const subline = partner.role === 'INFLUENCER'
    ? partner.influencer_profile?.location
    : partner.brand_profile?.sector;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/20 hover:bg-white/10 transition-all flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 border-2 border-white/5 shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
                {displayName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-white leading-tight">{displayName}</h4>
            <p className="text-xs text-gray-400">@{partner.username} • {subline || partner.role}</p>
          </div>
        </div>
        <Link href={`/u/${partner.username}`} className="text-gray-400 hover:text-purple-400 p-2 transition">
          <ExternalLink size={18} />
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {connection.status === 'ACCEPTED' ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
              <UserCheck size={12} /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md">
              <Clock size={12} /> Pending
            </span>
          )}
        </div>

        {connection.status === 'ACCEPTED' && (
          <Link 
            href={`/dashboard/messages?recipientId=${partner.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-purple-500/20"
          >
            <MessageSquare size={14} /> Message
          </Link>
        )}

        {isPending && isRecipient && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onRespond(connection.id, 'DECLINED')}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition"
            >
              <X size={18} />
            </button>
            <button 
              onClick={() => onRespond(connection.id, 'ACCEPTED')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm transition flex items-center gap-2"
            >
              <Check size={16} /> Accept
            </button>
          </div>
        )}

        {isPending && !isRecipient && (
          <span className="text-xs text-gray-500 italic">Waiting for response...</span>
        )}
      </div>
    </motion.div>
  );
}
