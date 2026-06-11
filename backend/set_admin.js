const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const address = "0x1c334667841443D4E80B5964bfc03319844ead76".toLowerCase();
    
    console.log(`Setting role ADMIN for ${address}...`);
    
    const user = await prisma.user.upsert({
        where: { address },
        update: { role: 'ADMIN' },
        create: { address, role: 'ADMIN' }
    });
    
    console.log("Success! User is now:", user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
