// @ts-nocheck
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, setRefreshCookie } from '../utils/jwt';
import { registerInfluencerSchema, registerBrandSchema, loginSchema } from '../validators/auth.validator';
import { z } from 'zod';

export const registerInfluencer = async (req: Request, res: Response) => {
  try {
    const validatedData = registerInfluencerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { username: validatedData.username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(validatedData.password, salt);

    // Create user and profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.username,
          password_hash,
          role: 'INFLUENCER',
          influencer_profile: {
            create: {
              full_name: validatedData.fullName,
              profile_photo_url: validatedData.profilePhotoUrl,
              social_links: {
                [validatedData.platform.toLowerCase()]: { handle: "", followers: 0, link: "" }
              }
            }
          }
        },
        include: {
          influencer_profile: true
        }
      });
      return user;
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ 
      message: "Influencer registered properly",
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.influencer_profile
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: (error as any).errors });
    }
    console.error("Authentication Debug Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerBrand = async (req: Request, res: Response) => {
  try {
    const validatedData = registerBrandSchema.parse(req.body);
    
    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Generate unique username
    let username = "";
    let isUnique = false;
    const baseUsername = validatedData.companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || "brand";
    
    while (!isUnique) {
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      username = `${baseUsername}_${uniqueSuffix}`;
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (!existingUsername) isUnique = true;
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(validatedData.password, salt);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          username: username,
          password_hash,
          role: 'BRAND',
          brand_profile: {
            create: {
              company_name: validatedData.companyName,
              sector: validatedData.sector,
              logo_url: validatedData.logoUrl || null,
            }
          }
        },
        include: {
          brand_profile: true
        }
      });
      return user;
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ 
      message: "Brand registered properly",
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.brand_profile
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: (error as any).errors });
    }
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      if (target.includes('email')) return res.status(409).json({ message: "Email already in use" });
      if (target.includes('username')) return res.status(409).json({ message: "Username collision, please try again" });
    }

    console.error("Authentication Debug Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }]
      },
      include: {
        influencer_profile: true,
        brand_profile: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Account not found, kindly sign up" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.role === 'INFLUENCER' ? user.influencer_profile : user.brand_profile
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: (error as any).errors });
    }
    console.error("Authentication Debug Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) return res.status(401).json({ message: "No cookies found" });
    
    const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('refresh_token='));
    if (!tokenCookie) return res.status(401).json({ message: "No refresh token" });
    
    const token = tokenCookie.split('=')[1];

    jwt.verify(token, process.env.JWT_REFRESH_SECRET as string, async (err: any, decoded: any) => {
      if (err || !decoded?.id) return res.status(403).json({ message: "Invalid or expired refresh token" });

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) return res.status(403).json({ message: "User not found" });

      const accessToken = generateAccessToken(user);
      // Optional: rotate refresh token here
      res.json({ accessToken });
    });
  } catch (error) {
    console.error("Authentication Debug Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { u } = req.params;
    if (!u) return res.status(400).json({ message: "Username required" });

    const user = await prisma.user.findUnique({ where: { username: u } });
    if (user) {
      return res.status(200).json({ available: false });
    }
    return res.status(200).json({ available: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
