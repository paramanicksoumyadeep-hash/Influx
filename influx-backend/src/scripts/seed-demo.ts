import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Create Demo Influencer
  const influencer = await prisma.user.upsert({
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
          bio: 'I am a demo influencer account for testing purposes.',
          location: 'New York, NY',
          social_links: {
            instagram: { handle: "demo_insta", followers: 125000, link: "https://instagram.com" },
            youtube: { handle: "demo_tube", followers: 500000, link: "https://youtube.com" }
          },
          total_followers: 625000,
          engagement_rate: 4.8
        }
      }
    }
  });

  console.log('Demo Influencer created/updated');

  // 2. Create Demo Brand
  const brand = await prisma.user.upsert({
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
          sector: 'Tech',
          description: 'A demo brand account looking for innovative creators.',
          website_url: 'https://example.com',
          location: 'San Francisco, CA'
        }
      }
    }
  });

  console.log('Demo Brand created/updated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
