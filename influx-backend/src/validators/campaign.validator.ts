import { z } from 'zod';

export const createCampaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  promotionType: z.enum(['Photo', 'Video', 'Story', 'Reel', 'Review']),
  description: z.string().min(20, "Description must be at least 20 characters"),
  minFollowers: z.coerce.number().int().nonnegative().optional().default(0),
  requiredNiche: z.string().optional(),
  requiredPlatform: z.string().optional(),
  budgetMin: z.coerce.number().int().nonnegative().optional().default(0),
  budgetMax: z.coerce.number().int().nonnegative().optional().default(0),
  applicationDeadline: z.string().transform((val) => new Date(val)),
  slotsAvailable: z.coerce.number().int().positive().optional().default(1),
});

export const applyToCampaignSchema = z.object({
  coverMessage: z.string().min(10, "Cover message must be at least 10 characters"),
  proposedRate: z.coerce.number().int().positive(),
});
