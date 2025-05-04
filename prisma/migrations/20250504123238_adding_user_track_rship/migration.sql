/*
  Warnings:

  - You are about to drop the `_userFavourites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_userFavourites" DROP CONSTRAINT "_userFavourites_A_fkey";

-- DropForeignKey
ALTER TABLE "_userFavourites" DROP CONSTRAINT "_userFavourites_B_fkey";

-- DropTable
DROP TABLE "_userFavourites";

-- CreateTable
CREATE TABLE "FavouriteTrack" (
    "profileId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavouriteTrack_pkey" PRIMARY KEY ("profileId","trackId")
);

-- AddForeignKey
ALTER TABLE "FavouriteTrack" ADD CONSTRAINT "FavouriteTrack_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteTrack" ADD CONSTRAINT "FavouriteTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
