// @ts-nocheck
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { createCampaignSchema, applyToCampaignSchema } from '../validators/campaign.validator';
import { z } from 'zod';

export const createCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'BRAND') {
      return res.status(403).json({ message: "Only brands can create campaigns" });
    }

    const brand = await prisma.brandProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand profile not found" });
    }

    const validatedData = createCampaignSchema.parse(req.body);

    const campaign = await prisma.campaign.create({
      data: {
        brand_id: brand.id,
        title: validatedData.title,
        promotion_type: validatedData.promotionType,
        description: validatedData.description,
        min_followers: validatedData.minFollowers,
        required_niche: validatedData.requiredNiche,
        required_platform: validatedData.requiredPlatform,
        budget_min: validatedData.budgetMin,
        budget_max: validatedData.budgetMax,
        application_deadline: validatedData.applicationDeadline,
        slots_available: validatedData.slotsAvailable,
      }
    });

    res.status(201).json({ message: "Campaign created successfully", campaign });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Create Campaign Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { niche, platform, minFollowers } = req.query;

    const campaigns = await prisma.campaign.findMany({
      where: {
        application_deadline: { gt: new Date() },
        ...(niche && { required_niche: niche as string }),
        ...(platform && { required_platform: platform as string }),
        ...(minFollowers && { min_followers: { lte: parseInt(minFollowers as string) } }),
      },
      include: {
        brand: {
          select: {
            company_name: true,
            logo_url: true,
            sector: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(campaigns);
  } catch (error) {
    console.error("Get Campaigns Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCampaignDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaignId = req.params.id as string;
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        brand: true,
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const applyToCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'INFLUENCER') {
      return res.status(403).json({ message: "Only influencers can apply to campaigns" });
    }

    const influencer = await prisma.influencerProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!influencer) {
      return res.status(404).json({ message: "Influencer profile not found" });
    }

    const campaignId = req.params.id as string;
    const validatedData = applyToCampaignSchema.parse(req.body);

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        campaign_id: campaignId,
        influencer_id: influencer.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this campaign" });
    }

    const application = await prisma.application.create({
      data: {
        campaign_id: campaignId,
        influencer_id: influencer.id,
        cover_message: validatedData.coverMessage,
        proposed_rate: validatedData.proposedRate,
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Apply Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCampaignApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaignId = req.params.id as string;
    const userId = req.user?.id;

    // Verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true }
    }) as any;

    if (!campaign || campaign.brand.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized to view applications for this campaign" });
    }

    const applications = await prisma.application.findMany({
      where: { campaign_id: campaignId },
      include: {
        influencer: {
          include: {
            user: {
              select: { username: true, email: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicationId = req.params.id as string;
    const { status } = req.body; // ACCEPTED or REJECTED

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { campaign: { include: { brand: true } } }
    }) as any;

    if (!application || application.campaign.brand.user_id !== req.user?.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    res.json({ message: `Application ${status.toLowerCase()}`, application: updatedApplication });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
