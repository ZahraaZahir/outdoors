-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TRAVELER', 'ADMIN');

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "passengerName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "seatsBooked" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "priceIQD" INTEGER NOT NULL,
    "maxSeats" INTEGER NOT NULL DEFAULT 30,
    "availableSeats" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TRAVELER',
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booking_tourId_idx" ON "Booking"("tourId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Tour_date_idx" ON "Tour"("date");

-- CreateIndex
CREATE INDEX "Tour_destination_idx" ON "Tour"("destination");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
