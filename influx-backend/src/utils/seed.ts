import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function ensureDemoUsersExist() {
  try {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // Ensure Demo Influencer
    await prisma.user.upsert({
      where: { email: 'influencer@demo.com' },
      update: {},
      create: {
        email: 'influencer@demo.com',
        username: 'demo_influencer',
        password_hash: passwordHash,
        role: 'INFLUENCER',
        influencer_profile: {
          create: {
            full_name: 'Demo Influencer',
            bio: 'Premium content creator for testing.',
            location: 'London, UK',
            social_links: {
              instagram: { handle: "demo_insta", followers: 150000, link: "https://instagram.com" }
            },
            total_followers: 150000
          }
        }
      }
    });

    // Ensure Demo Brand
    await prisma.user.upsert({
      where: { email: 'brand@demo.com' },
      update: {},
      create: {
        email: 'brand@demo.com',
        username: 'demo_brand',
        password_hash: passwordHash,
        role: 'BRAND',
        brand_profile: {
          create: {
            company_name: 'Demo Brand Corp',
            sector: 'Fashion',
            description: 'Global fashion brand looking for influencers.'
          }
        }
      }
    });

    console.log('✅ Demo accounts verified/created.');
  } catch (error) {
    console.error('❌ Failed to seed demo users:', error);
  }
}
