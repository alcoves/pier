/*
  Warnings:

  - The values [MODERATOR] on the enum `PodRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PodRole_new" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'EDITOR', 'VIEWER', 'CONTRIBUTOR');
ALTER TABLE "Membership" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Membership" ALTER COLUMN "role" TYPE "PodRole_new" USING ("role"::text::"PodRole_new");
ALTER TYPE "PodRole" RENAME TO "PodRole_old";
ALTER TYPE "PodRole_new" RENAME TO "PodRole";
DROP TYPE "PodRole_old";
ALTER TABLE "Membership" ALTER COLUMN "role" SET DEFAULT 'VIEWER';
COMMIT;

-- AlterTable
ALTER TABLE "Membership" ALTER COLUMN "role" SET DEFAULT E'VIEWER';
