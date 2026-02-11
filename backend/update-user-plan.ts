
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'gps-test@test.com'

    console.log(`Buscando usuario ${email}...`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log('Usuario no encontrado. Asegúrate de haber corrido test-location.js al menos una vez.')
        return
    }

    console.log(`Usuario encontrado: ${user.name} (${user.id}). Plan actual: ${user.plan}`)

    const updated = await prisma.user.update({
        where: { email },
        data: { plan: 'BASIC' }
    })

    console.log(`✅ Plan actualizado a: ${updated.plan}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
