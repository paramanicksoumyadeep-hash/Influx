'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Filter, 
  ChevronRight, 
  Target, 
  Globe,
  Loader2,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { EmptyState } from '@/components/EmptyState';
import { Briefcase } from 'lucide-react';

export default function PromotePage() {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Filter states
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/campaigns', {
        params: { niche, platform }
      });
      setCampaigns(data);
    } catch (err) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [niche, platform]);

  const handleApply = (campaign: any) => {
    if (user?.role !== 'INFLUENCER') {
      toast.error("Only influencers can apply to campaigns");
      return;
    }
    setSelectedCampaign(campaign);
    setIsApplyModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white">Promote Marketplace</h1>
          <p className="text-gray-400">Discover active campaigns matched for you</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <select 
            value={niche} 
            onChange={(e) => setNiche(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-purple-500 transition"
          >
            <option value="">All Niches</option>
            <option value="Tech">Tech</option>
            <option value="Fashion">Fashion</option>
            <option value="Gaming">Gaming</option>
            <option value="Lifestyle">Lifestyle</option>
          </select>
          <select 
            value={platform} 
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-purple-500 transition"
          >
            <option value="">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
            <option value="Twitter">Twitter</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Scanning Marketplace...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState 
          icon={Briefcase}
          title="No campaigns found"
          description="Try adjusting your filters or check back later for new opportunities from top brands."
          action={{
            label: "Reset Filters",
            onClick: () => { setNiche(''); setPlatform(''); }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign, i) => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              onApply={() => handleApply(campaign)}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Application Modal */}
      <AnimatePresence>
        {isApplyModalOpen && selectedCampaign && (
          <ApplyModal 
            campaign={selectedCampaign} 
            onClose={() => setIsApplyModalOpen(false)} 
            onSuccess={() => {
                setIsApplyModalOpen(false);
                fetchCampaigns();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CampaignCard({ campaign, onApply, index }: { campaign: any, onApply: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] hover:border-purple-500/30 transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4">
         <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md border border-purple-500/20">
            {campaign.promotion_type}
         </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gray-800 overflow-hidden border border-white/10">
          {campaign.brand.logo_url ? (
            <img src={campaign.brand.logo_url} alt={campaign.brand.company_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">
              {campaign.brand.company_name[0]}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{campaign.title}</h4>
          <p className="text-xs text-gray-400">{campaign.brand.company_name} • {campaign.brand.sector}</p>
        </div>
      </div>

      <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10">
        {campaign.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 uppercase font-black">Budget Range</p>
          <div className="flex items-center gap-1 text-green-400 font-bold">
             <DollarSign size={14} />
             <span>${campaign.budget_min} - ${campaign.budget_max}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 uppercase font-black">Min Reach</p>
          <div className="flex items-center gap-1 text-blue-400 font-bold">
             <Users size={14} />
             <span>{(campaign.min_followers / 1000).toFixed(0)}k+</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onApply}
        className="w-full py-4 bg-white text-gray-950 font-black rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-2"
      >
        View Details & Apply <ChevronRight size={18} />
      </button>
    </motion.div>
  );
}

function ApplyModal({ campaign, onClose, onSuccess }: { campaign: any, onClose: any, onSuccess: any }) {
  const [coverMessage, setCoverMessage] = useState('');
  const [proposedRate, setProposedRate] = useState(campaign.budget_min);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coverMessage.length < 20) {
        toast.error("Please provide a more detailed pitch (min 20 chars)");
        return;
    }
    
    setSubmitting(true);
    try {
      await api.post(`/campaigns/${campaign.id}/apply`, {
        coverMessage,
        proposedRate
      });
      toast.success("Application submitted successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
             <X size={24} />
          </button>
        </div>

        <div className="p-10">
          <header className="mb-10">
            <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 mb-4 inline-block">
               Campaign Application
            </span>
            <h2 className="text-3xl font-black text-white mb-2">{campaign.title}</h2>
            <p className="text-gray-400">By {campaign.brand.company_name}</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Your Pitch / Cover Message</label>
              <textarea 
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Why are you the perfect match for this campaign? Tell the brand about your audience and style..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white min-h-[160px] outline-none focus:border-purple-500 transition resize-none placeholder:text-gray-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Proposed Rate ($)</label>
                   <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-6 text-white outline-none focus:border-purple-500 transition"
                        min={0}
                        required
                      />
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Brand's Budget</label>
                   <div className="py-4 text-green-400 font-bold text-lg">
                      ${campaign.budget_min} — ${campaign.budget_max}
                   </div>
                </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : "Submit Application Strategy"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
