import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  await prisma.expense.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.locationLog.deleteMany()
  await prisma.healthRecord.deleteMany()
  await prisma.pet.deleteMany()
  await prisma.user.deleteMany()

  console.log('Base de datos limpiada')

  const passwordHash = await bcrypt.hash('123456', 10)

  const userFree = await prisma.user.create({
    data: {
      email: 'free@test.com',
      password: passwordHash,
      name: 'Usuario Free',
      phone: '+591 70111111',
      plan: 'FREE',
    }
  })

  const userBasic = await prisma.user.create({
    data: {
      email: 'basic@test.com',
      password: passwordHash,
      name: 'Usuario Basic',
      phone: '+591 70222222',
      plan: 'BASIC',
    }
  })

  const userFamily = await prisma.user.create({
    data: {
      email: 'family@test.com',
      password: passwordHash,
      name: 'Usuario Family',
      phone: '+591 70333333',
      plan: 'FAMILY',
    }
  })

  const luna = await prisma.pet.create({
    data: {
      name: 'Luna',
      species: 'dog',
      breed: 'Golden Retriever',
      birthDate: new Date('2020-03-15'),
      weight: 28.5,
      photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      userId: userFamily.id,
    }
  })

  const milo = await prisma.pet.create({
    data: {
      name: 'Milo',
      species: 'cat',
      breed: 'Siamés',
      birthDate: new Date('2019-07-22'),
      weight: 4.2,
      photoUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400',
      userId: userFamily.id,
    }
  })

  const coco = await prisma.pet.create({
    data: {
      name: 'Coco',
      species: 'dog',
      breed: 'Beagle',
      birthDate: new Date('2021-11-10'),
      weight: 12.3,
      photoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400',
      userId: userFamily.id,
    }
  })

  await prisma.healthRecord.createMany({
    data: [
      { petId: luna.id, type: 'vaccine', title: 'Vacuna Rabia', date: new Date('2023-11-15'), nextDate: new Date('2024-11-15'), vetName: 'Dr. García', status: 'pending' },
      { petId: luna.id, type: 'deworming', title: 'Desparasitación', date: new Date('2024-01-10'), nextDate: new Date('2024-04-10'), vetName: 'Clínica VetCare', status: 'pending' },
      { petId: milo.id, type: 'vaccine', title: 'Vacuna Triple Felina', date: new Date('2023-08-20'), nextDate: new Date('2024-02-20'), status: 'overdue' },
    ]
  })

  console.log('Seed completado!')
  console.log('Usuarios: free@test.com, basic@test.com, family@test.com (pass: 123456)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
