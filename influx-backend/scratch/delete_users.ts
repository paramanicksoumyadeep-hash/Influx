import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Wipe ---');
  
  const userCount = await prisma.user.count();
  console.log(`Current user count: ${userCount}`);
  
  if (userCount === 0) {
    console.log('No users found in database. Nothing to delete.');
    return;
  }

  console.log(`Deleting all ${userCount} users...`);
  
  const deleted = await prisma.user.deleteMany();
  
  console.log(`Successfully deleted ${deleted.count} users.`);
  
  const finalCount = await prisma.user.count();
  console.log(`Final user count: ${finalCount}`);
  
  if (finalCount === 0) {
    console.log('--- Database Wipe Complete ---');
  } else {
    console.warn('--- Database Wipe Incomplete ---');
  }
}

main()
  .catch((e) => {
    console.error('Error during wipe:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
