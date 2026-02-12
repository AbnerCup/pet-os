-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" TEXT,
    "title" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "frequencyMonths" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_petId_idx" ON "Reminder"("petId");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
