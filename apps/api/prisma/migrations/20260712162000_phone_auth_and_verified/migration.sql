-- DropEmailAndSetPhoneUnique
ALTER TABLE "User" DROP COLUMN "email";
ALTER TABLE "User" ADD CONSTRAINT "User_phoneNumber_key" UNIQUE ("phoneNumber");
ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
