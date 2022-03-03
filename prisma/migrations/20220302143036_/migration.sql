/*
  Warnings:

  - You are about to drop the column `image` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the column `libraryId` on the `Video` table. All the data in the column will be lost.
  - The `status` column on the `Video` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Library` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoOnPod` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[inviteCode]` on the table `Pod` will be added. If there are existing duplicate values, this will fail.
  - The required column `inviteCode` was added to the `Pod` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `podId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'APPROVED');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('READY', 'ERROR', 'CREATED', 'UPLOADED', 'UPLOADING', 'PROCESSING');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PodRole" ADD VALUE 'ADMIN';
ALTER TYPE "PodRole" ADD VALUE 'MODERATOR';

-- DropForeignKey
ALTER TABLE "Library" DROP CONSTRAINT "Library_userId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "VideoOnPod" DROP CONSTRAINT "VideoOnPod_podId_fkey";

-- DropForeignKey
ALTER TABLE "VideoOnPod" DROP CONSTRAINT "VideoOnPod_videoId_fkey";

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT E'PENDING';

-- AlterTable
ALTER TABLE "Pod" DROP COLUMN "image",
ADD COLUMN     "inviteCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "libraryId",
ADD COLUMN     "podId" TEXT NOT NULL,
ALTER COLUMN "title" SET DEFAULT E'',
DROP COLUMN "status",
ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT E'CREATED';

-- DropTable
DROP TABLE "Library";

-- DropTable
DROP TABLE "VideoOnPod";

-- DropEnum
DROP TYPE "MediaStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Pod_inviteCode_key" ON "Pod"("inviteCode");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
