import { z } from 'zod';

export const registerInfluencerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  platform: z.enum(["Instagram", "YouTube", "TikTok", "Twitter", "Facebook"]),
  profilePhotoUrl: z.string().url().optional(),
});

export const registerBrandSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  sector: z.enum(["Fashion", "Tech", "Food", "Beauty", "Sports", "Finance", "Entertainment", "Healthcare", "Other"]),
  logoUrl: z.string().url().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});
