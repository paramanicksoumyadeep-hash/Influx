'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { 
  Plus, 
  Users, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  Loader2, 
  X, 
  CheckCircle2, 
  Clock, 
  Trash2,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null); // For viewing applicants

  const fetchMyCampaigns = async () => {
    try {
      // We'll need a way to filter "my" campaigns. 
      // For now, I'll filter on the frontend or we can add a specific backend route /api/campaigns/me
      const { data } = await api.get('/campaigns');
      // In a real app, the backend would handle this. 
      // For this demo, let's assume the backend returns all and we filter if needed, 
      // but ideally we'd have a specific endpoint.
      setCampaigns(data);
    } catch (err) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Campaign Management</h1>
          <p className="text-gray-400">Track performance and manage applicants</p>
        </div>
        
        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-purple-500 hover:text-white transition flex items-center gap-2 shadow-lg shadow-white/5"
        >
          <Plus size={20} /> Post New Opening
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
          <p className="text-gray-400 font-medium">Loading your campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-20 text-center">
          <h3 className="text-xl font-bold text-white mb-2">No active campaigns</h3>
          <p className="text-gray-400 mb-8">Create your first campaign to start receiving applications from top influencers.</p>
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.map((campaign) => (
            <BrandCampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              onViewApplicants={() => setSelectedCampaign(campaign)}
            />
          ))}
        </div>
      )}

      {/* Post Campaign Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <PostCampaignModal 
            onClose={() => setIsPostModalOpen(false)} 
            onSuccess={() => {
              setIsPostModalOpen(false);
              fetchMyCampaigns();
            }}
          />
        )}
      </AnimatePresence>

      {/* View Applicants Modal/Drawer */}
      <AnimatePresence>
        {selectedCampaign && (
          <ApplicantsList 
            campaign={selectedCampaign} 
            onClose={() => setSelectedCampaign(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BrandCampaignCard({ campaign, onViewApplicants }: { campaign: any, onViewApplicants: any }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/10">
              {campaign.promotion_type}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={14} /> Ends {new Date(campaign.application_deadline).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{campaign.title}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><DollarSign size={16} className="text-green-400" /> ${campaign.budget_min} - ${campaign.budget_max}</span>
            <span className="flex items-center gap-1"><Users size={16} className="text-blue-400" /> {campaign._count?.applications || 0} Applicants</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onViewApplicants}
            className="flex-1 lg:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition flex items-center justify-center gap-2"
          >
            Manage Applicants <ChevronRight size={18} />
          </button>
          <button className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PostCampaignModal({ onClose, onSuccess }: { onClose: any, onSuccess: any }) {
  const [formData, setFormData] = useState({
    title: '',
    promotionType: 'Photo',
    description: '',
    minFollowers: 1000,
    requiredNiche: 'Lifestyle',
    requiredPlatform: 'Instagram',
    budgetMin: 100,
    budgetMax: 500,
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    slotsAvailable: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/campaigns', formData);
      toast.success("Campaign posted successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-3xl bg-gray-900 border border-white/10 rounded-[32px] overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-2xl font-black text-white italic">Create New Opening</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Campaign Title</label>
              <input 
                type="text" 
                required 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Summer Fitness Gear Launch"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Promotion Type</label>
              <select 
                value={formData.promotionType}
                onChange={(e) => setFormData({...formData, promotionType: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              >
                {['Photo', 'Video', 'Story', 'Reel', 'Review'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Platform</label>
               <select 
                value={formData.requiredPlatform}
                onChange={(e) => setFormData({...formData, requiredPlatform: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              >
                {['Instagram', 'TikTok', 'YouTube', 'Twitter'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description \u0026 Requirements</label>
              <textarea 
                required 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Min. Followers</label>
              <input 
                type="number" 
                value={formData.minFollowers}
                onChange={(e) => setFormData({...formData, minFollowers: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Deadline</label>
              <input 
                type="date" 
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Min Budget ($)</label>
              <input 
                type="number" 
                value={formData.budgetMin}
                onChange={(e) => setFormData({...formData, budgetMin: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Max Budget ($)</label>
              <input 
                type="number" 
                value={formData.budgetMax}
                onChange={(e) => setFormData({...formData, budgetMax: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Publish Campaign"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ApplicantsList({ campaign, onClose }: { campaign: any, onClose: any }) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      const { data } = await api.get(`/campaigns/${campaign.id}/applications`);
      setApplicants(data);
    } catch (err) {
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [campaign.id]);

  const handleStatus = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.patch(`/campaigns/applications/${appId}`, { status });
      toast.success(`Application ${status.toLowerCase()}`);
      fetchApplicants();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl h-full bg-gray-900 border-l border-white/10 flex flex-col pt-24"
      >
        <div className="p-8 flex justify-between items-center border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic">Applicants</h2>
            <p className="text-gray-400 text-sm">{campaign.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={32} /></div>
          ) : applicants.length === 0 ? (
             <div className="text-center py-20">
                <FileText className="mx-auto text-gray-700 mb-4" size={48} />
                <p className="text-gray-500 font-medium">No applicants yet.</p>
             </div>
          ) : (
            applicants.map((app) => (
              <div key={app.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                       {app.influencer.user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">@{app.influencer.user.username}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{app.influencer.total_followers.toLocaleString()} Followers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">${app.proposed_rate}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Asking Rate</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 italic text-sm text-gray-300">
                  "{app.cover_message}"
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     {app.status === 'PENDING' ? (
                        <>
                          <button onClick={() => handleStatus(app.id, 'REJECTED')} className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold transition">Decline</button>
                          <button onClick={() => handleStatus(app.id, 'ACCEPTED')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition">Accept App</button>
                        </>
                     ) : (
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${app.status === 'ACCEPTED' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'} px-2 py-1 rounded-md`}>
                           {app.status === 'ACCEPTED' ? <CheckCircle2 size={12} /> : <X size={12} />} {app.status}
                        </span>
                     )}
                   </div>
                   <span className="text-[10px] text-gray-600 font-medium">{new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
