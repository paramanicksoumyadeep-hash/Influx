import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findDuplicates() {
  const conversations = await prisma.conversation.findMany();
  const pairs = new Map<string, string[]>();

  for (const conv of conversations) {
    const sortedPair = [conv.participant_1, conv.participant_2].sort().join(':');
    if (!pairs.has(sortedPair)) {
      pairs.set(sortedPair, []);
    }
    pairs.get(sortedPair)!.push(conv.id);
  }

  const duplicates = Array.from(pairs.entries()).filter(([pair, ids]) => ids.length > 1);
  console.log('Duplicate Pairs Found:', JSON.stringify(duplicates, null, 2));
}

findDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
