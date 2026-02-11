const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const u = await prisma.user.findFirst({
            where: { email: 'basic@test.com' },
            include: { pets: true }
        });
        if (!u) {
            console.log('USER NOT FOUND');
            return;
        }
        console.log('USER:', u.email, 'PLAN:', u.plan);
        console.log('PETS_COUNT:', u.pets.length);
        u.pets.forEach(p => console.log('- ', p.name, 'ID:', p.id));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
