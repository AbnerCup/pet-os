-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'BASIC', 'FAMILY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "planExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "birthDate" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "photoUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nextDate" TIMESTAMP(3),
    "vetName" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationLog" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "battery" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "Pet_userId_idx" ON "Pet"("userId");

-- CreateIndex
CREATE INDEX "HealthRecord_petId_idx" ON "HealthRecord"("petId");

-- CreateIndex
CREATE INDEX "LocationLog_petId_timestamp_idx" ON "LocationLog"("petId", "timestamp");

-- CreateIndex
CREATE INDEX "Activity_petId_idx" ON "Activity"("petId");

-- CreateIndex
CREATE INDEX "Expense_userId_idx" ON "Expense"("userId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationLog" ADD CONSTRAINT "LocationLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
