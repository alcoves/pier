-- CreateEnum
CREATE TYPE "PodRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateTable
CREATE TABLE "Pod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Pod',
    "isCollaborative" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideosOnPods" (
    "videoId" TEXT NOT NULL,
    "podId" TEXT NOT NULL,

    CONSTRAINT "VideosOnPods_pkey" PRIMARY KEY ("videoId","podId")
);

-- CreateTable
CREATE TABLE "UsersOnPods" (
    "userId" TEXT NOT NULL,
    "podId" TEXT NOT NULL,
    "role" "PodRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "UsersOnPods_pkey" PRIMARY KEY ("userId","podId")
);

-- AddForeignKey
ALTER TABLE "VideosOnPods" ADD CONSTRAINT "VideosOnPods_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideosOnPods" ADD CONSTRAINT "VideosOnPods_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnPods" ADD CONSTRAINT "UsersOnPods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnPods" ADD CONSTRAINT "UsersOnPods_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
