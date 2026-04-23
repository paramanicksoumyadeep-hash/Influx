import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { username: 'Anshu12' },
    include: {
      influencer_profile: true,
      brand_profile: true
    }
  });
  console.log(JSON.stringify(user, null, 2));
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
