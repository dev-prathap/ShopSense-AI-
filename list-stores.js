const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany();
  console.log('Stores in DB:', stores.map(s => ({ id: s.id, shop: s.shopDomain })));
  process.exit(0);
}

main();
