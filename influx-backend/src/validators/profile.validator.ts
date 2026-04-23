import { z } from 'zod';

export const updateInfluencerProfileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters").optional().nullable(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().nullable(),
  location: z.string().optional().nullable(),
  profile_photo_url: z.string().optional().nullable().or(z.literal('')),
  cover_photo_url: z.string().optional().nullable().or(z.literal('')),
  standard_rates: z.any().optional().nullable(),
  social_links: z.any().optional().nullable(),
});

export const updateBrandProfileSchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters").optional().nullable(),
  sector: z.string().optional().nullable(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().nullable(),
  website_url: z.string().optional().nullable().or(z.literal('')),
  location: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable().or(z.literal('')),
  banner_url: z.string().optional().nullable().or(z.literal('')),
  social_links: z.any().optional().nullable(),
});
