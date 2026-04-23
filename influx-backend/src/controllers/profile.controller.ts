// @ts-nocheck
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

import { updateInfluencerProfileSchema, updateBrandProfileSchema } from '../validators/profile.validator';
import { z } from 'zod';

// Get Public Profile by Username
export const getPublicProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        influencer_profile: true,
        brand_profile: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Increment view count
    if (user.role === 'INFLUENCER' && user.influencer_profile) {
      await prisma.influencerProfile.update({
        where: { id: user.influencer_profile.id },
        data: { view_count: { increment: 1 } }
      });
    } else if (user.role === 'BRAND' && user.brand_profile) {
      await prisma.brandProfile.update({
        where: { id: user.brand_profile.id },
        data: { view_count: { increment: 1 } }
      });
    }

    // Safety: strip password hash before sending
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error("Public Profile Fetch Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Influencer Profile (Protected)
export const updateInfluencerProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const updateData = updateInfluencerProfileSchema.parse(req.body);

    // Verify user role
    if (req.user?.role !== 'INFLUENCER') {
      return res.status(403).json({ message: "Access Denied: Invalid role" });
    }

    const updatedProfile = await prisma.influencerProfile.upsert({
      where: { user_id: userId },
      update: {
        full_name: updateData.full_name,
        bio: updateData.bio,
        location: updateData.location,
        profile_photo_url: updateData.profile_photo_url,
        cover_photo_url: updateData.cover_photo_url,
        standard_rates: updateData.standard_rates,
        social_links: updateData.social_links,
      },
      create: {
        user_id: userId,
        full_name: updateData.full_name,
        bio: updateData.bio,
        location: updateData.location,
        profile_photo_url: updateData.profile_photo_url,
        cover_photo_url: updateData.cover_photo_url,
        standard_rates: updateData.standard_rates,
        social_links: updateData.social_links,
      }
    });

    res.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Influencer Profile Update Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Brand Profile (Protected)
export const updateBrandProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const updateData = updateBrandProfileSchema.parse(req.body);

    if (req.user?.role !== 'BRAND') {
      return res.status(403).json({ message: "Access Denied: Invalid role" });
    }

    const updatedProfile = await prisma.brandProfile.upsert({
      where: { user_id: userId },
      update: {
        company_name: updateData.company_name,
        sector: updateData.sector,
        description: updateData.description,
        website_url: updateData.website_url,
        location: updateData.location,
        logo_url: updateData.logo_url,
        banner_url: updateData.banner_url,
        social_links: updateData.social_links,
      },
      create: {
        user_id: userId,
        company_name: updateData.company_name || 'My Brand',
        sector: updateData.sector,
        description: updateData.description,
        website_url: updateData.website_url,
        location: updateData.location,
        logo_url: updateData.logo_url,
        banner_url: updateData.banner_url,
        social_links: updateData.social_links,
      }
    });

    res.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Brand Profile Update Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get Dashboard Stats (Protected)
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role === 'INFLUENCER') {
      const profile = await prisma.influencerProfile.findUnique({
        where: { user_id: userId },
        include: { applications: true }
      });

      if (!profile) return res.status(404).json({ message: "Profile not found" });

      const pendingOffers = await prisma.application.count({
        where: { influencer_id: profile.id, status: 'PENDING' }
      });

      const acceptedApps = await prisma.application.findMany({
        where: { influencer_id: profile.id, status: 'ACCEPTED' }
      });

      const totalEarnings = acceptedApps.reduce((acc, app) => acc + app.proposed_rate, 0);

      res.json({
        stats: [
          { label: 'Profile Views', value: profile.view_count.toLocaleString(), change: '+0%', icon: 'Users' },
          { label: 'Avg Engagement', value: profile.engagement_rate + '%', change: '+0%', icon: 'Activity' },
          { label: 'Pending Offers', value: pendingOffers.toString(), change: 'New', icon: 'Target' },
          { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}`, change: 'Total', icon: 'TrendingUp' },
        ]
      });
    } else {
      // BRAND Stats
      const profile = await prisma.brandProfile.findUnique({
        where: { user_id: userId },
        include: { campaigns: { include: { applications: true } } }
      });

      if (!profile) return res.status(404).json({ message: "Profile not found" });

      const activeCampaigns = profile.campaigns.length;
      const totalApplicants = profile.campaigns.reduce((acc, camp) => acc + camp.applications.length, 0);
      
      const acceptedApps = await prisma.application.findMany({
        where: { campaign: { brand_id: profile.id }, status: 'ACCEPTED' }
      });

      const totalSpend = acceptedApps.reduce((acc, app) => acc + app.proposed_rate, 0);
      const conversionRate = totalApplicants > 0 ? ((acceptedApps.length / totalApplicants) * 100).toFixed(1) : '0';

      res.json({
        stats: [
          { label: 'Active Campaigns', value: activeCampaigns.toString(), change: 'Live', icon: 'Target' },
          { label: 'Total Applicants', value: totalApplicants.toString(), change: 'Total', icon: 'Users' },
          { label: 'Avg Conversion', value: conversionRate + '%', change: 'Rate', icon: 'Activity' },
          { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, change: 'Spent', icon: 'TrendingUp' },
        ]
      });
    }
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search Profiles (Public/Protected)
export const searchProfiles = async (req: Request, res: Response) => {
  try {
    const { q, role } = req.query;
    const query = q as string;

    const where: any = {};
    
    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { influencer_profile: { full_name: { contains: query, mode: 'insensitive' } } },
        { brand_profile: { company_name: { contains: query, mode: 'insensitive' } } },
        { influencer_profile: { location: { contains: query, mode: 'insensitive' } } },
        { brand_profile: { sector: { contains: query, mode: 'insensitive' } } },
        { influencer_profile: { bio: { contains: query, mode: 'insensitive' } } },
        { brand_profile: { description: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (role) {
      where.role = role as any;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        influencer_profile: true,
        brand_profile: true,
      },
      take: 50
    });

    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });

    res.json(safeUsers);
  } catch (error) {
    console.error("Search Profiles Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
