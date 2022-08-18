/*
  Warnings:

  - You are about to drop the `UsersOnPods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideosOnPods` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UsersOnPods" DROP CONSTRAINT "UsersOnPods_podId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnPods" DROP CONSTRAINT "UsersOnPods_userId_fkey";

-- DropForeignKey
ALTER TABLE "VideosOnPods" DROP CONSTRAINT "VideosOnPods_podId_fkey";

-- DropForeignKey
ALTER TABLE "VideosOnPods" DROP CONSTRAINT "VideosOnPods_videoId_fkey";

-- DropTable
DROP TABLE "UsersOnPods";

-- DropTable
DROP TABLE "VideosOnPods";

-- CreateTable
CREATE TABLE "PodUsers" (
    "userId" TEXT NOT NULL,
    "podId" TEXT NOT NULL,
    "role" "PodRole" NOT NULL
);

-- CreateTable
CREATE TABLE "_PodToVideo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PodUsers_userId_podId_key" ON "PodUsers"("userId", "podId");

-- CreateIndex
CREATE UNIQUE INDEX "_PodToVideo_AB_unique" ON "_PodToVideo"("A", "B");

-- CreateIndex
CREATE INDEX "_PodToVideo_B_index" ON "_PodToVideo"("B");

-- AddForeignKey
ALTER TABLE "PodUsers" ADD CONSTRAINT "PodUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodUsers" ADD CONSTRAINT "PodUsers_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Pod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodToVideo" ADD CONSTRAINT "_PodToVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "Pod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodToVideo" ADD CONSTRAINT "_PodToVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
