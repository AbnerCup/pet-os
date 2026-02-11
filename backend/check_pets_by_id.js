const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const userId = 'cmlh7lcyj00013e6b9fkiunvo';
    try {
        const u = await prisma.user.findUnique({
            where: { id: userId },
            include: { pets: true }
        });
        if (!u) {
            console.log('USER NOT FOUND');
            return;
        }
        console.log('USER:', u.email, 'PLAN:', u.plan);
        console.log('DB_PETS_COUNT:', u.pets.length);
        u.pets.forEach(p => console.log('- ', p.name, 'ID:', p.id));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
