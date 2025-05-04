/*
  Warnings:

  - The primary key for the `FavouriteTrack` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `profileId` on the `FavouriteTrack` table. All the data in the column will be lost.
  - Added the required column `userId` to the `FavouriteTrack` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FavouriteTrack" DROP CONSTRAINT "FavouriteTrack_profileId_fkey";

-- AlterTable
ALTER TABLE "FavouriteTrack" DROP CONSTRAINT "FavouriteTrack_pkey",
DROP COLUMN "profileId",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "FavouriteTrack_pkey" PRIMARY KEY ("userId", "trackId");

-- AddForeignKey
ALTER TABLE "FavouriteTrack" ADD CONSTRAINT "FavouriteTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
