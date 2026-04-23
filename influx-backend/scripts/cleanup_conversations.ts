import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanup() {
  console.log('--- Starting Conversation Cleanup ---');
  
  const conversations = await prisma.conversation.findMany({
    include: {
      messages: true
    }
  });

  const pairs = new Map<string, string[]>();

  for (const conv of conversations) {
    const sortedPair = [conv.participant_1, conv.participant_2].sort().join(':');
    if (!pairs.has(sortedPair)) {
      pairs.set(sortedPair, []);
    }
    pairs.get(sortedPair)!.push(conv.id);
  }

  const duplicates = Array.from(pairs.entries()).filter(([pair, ids]) => ids.length > 1);
  
  if (duplicates.length === 0) {
    console.log('No duplicates found. All clean!');
    return;
  }

  console.log(`Found ${duplicates.length} duplicate pairs. Merging...`);

  for (const [pair, ids] of duplicates) {
    // We keep the first ID as the master
    const [masterId, ...redundantIds] = ids;
    console.log(`Merging ${redundantIds.length} threads into master thread: ${masterId}`);

    // 1. Move all messages from redundant threads to master
    const moveResult = await prisma.message.updateMany({
      where: {
        conversation_id: { in: redundantIds }
      },
      data: {
        conversation_id: masterId
      }
    });
    console.log(`Moved ${moveResult.count} messages to master thread.`);

    // 2. Clear last_message_id for redundant threads to avoid FK violations
    await prisma.conversation.updateMany({
      where: { id: { in: redundantIds } },
      data: { last_message_id: null }
    });

    // 3. Delete redundant conversations
    const deleteResult = await prisma.conversation.deleteMany({
      where: {
        id: { in: redundantIds }
      }
    });
    console.log(`Deleted ${deleteResult.count} redundant conversation records.`);
  }

  console.log('--- Cleanup Complete ---');
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
