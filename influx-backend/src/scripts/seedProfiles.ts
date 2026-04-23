import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const niches = ['Tech', 'Fashion', 'Fitness', 'Travel', 'Food', 'Gaming', 'Beauty', 'Business', 'Lifestyle', 'Art'];
const cities = ['New York, NY', 'Los Angeles, CA', 'London, UK', 'Dubai, UAE', 'Berlin, Germany', 'Mumbai, India', 'Tokyo, Japan', 'Paris, France', 'Toronto, Canada', 'Sydney, Australia'];
const sectors = ['Consumer Tech', 'Luxury Goods', 'SaaS', 'FMCG', 'Automotive', 'Education', 'Health \u0026 Wellness', 'E-commerce', 'Fintech', 'Real Estate'];

async function main() {
  console.log('🚀 Starting profile seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Influencers
  console.log('--- Seeding 100 Influencers ---');
  for (let i = 1; i <= 100; i++) {
    const username = `influencer_${i}_${Math.floor(Math.random() * 1000)}`;
    const email = `${username}@influx-test.com`;
    const niche = niches[Math.floor(Math.random() * niches.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];

    await prisma.user.create({
      data: {
        email,
        username,
        password_hash: passwordHash,
        role: 'INFLUENCER',
        influencer_profile: {
          create: {
            full_name: `Dummy Influencer ${i}`,
            bio: `Hello! I am a professional influencer specializing in ${niche}. Excited to collaborate with premium brands.`,
            location: city,
            total_followers: Math.floor(Math.random() * 500000) + 10000,
            engagement_rate: parseFloat((Math.random() * 8 + 1).toFixed(1)),
            social_links: {
              instagram: { handle: `@${username}`, followers: Math.floor(Math.random() * 100000) },
              youtube: { handle: username, subscribers: Math.floor(Math.random() * 50000) }
            }
          }
        }
      }
    });

    if (i % 20 === 0) console.log(`Created ${i} influencers...`);
  }

  // 2. Seed Brands
  console.log('--- Seeding 100 Brands ---');
  for (let i = 1; i <= 100; i++) {
    const username = `brand_${i}_${Math.floor(Math.random() * 1000)}`;
    const email = `${username}@influx-brand.com`;
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];

    await prisma.user.create({
      data: {
        email,
        username,
        password_hash: passwordHash,
        role: 'BRAND',
        brand_profile: {
          create: {
            company_name: `Influx Partner Brand ${i}`,
            sector: sector,
            description: `We are a leading brand in the ${sector} industry. We are looking for high-quality influencers to promote our latest collections.`,
            location: city,
            website_url: `https://brand${i}.example.com`,
          }
        }
      }
    });

    if (i % 20 === 0) console.log(`Created ${i} brands...`);
  }

  console.log('✅ Seeding complete! 200 dummy profiles added.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
