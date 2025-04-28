/*
  Warnings:

  - You are about to drop the column `album_id` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `album_name` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `artist_id` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `artist_name` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `release_date` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_player_state` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `playlists` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reset_otp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reset_otp_expiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reset_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `user_name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refreshToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetOtp]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `artistId` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artistName` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_avatar_url_key";

-- DropIndex
DROP INDEX "User_refresh_token_key";

-- DropIndex
DROP INDEX "User_reset_otp_key";

-- DropIndex
DROP INDEX "User_reset_token_key";

-- DropIndex
DROP INDEX "User_user_name_key";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "album_id",
DROP COLUMN "album_name",
DROP COLUMN "artist_id",
DROP COLUMN "artist_name",
DROP COLUMN "created_at",
DROP COLUMN "release_date",
DROP COLUMN "updated_at",
ADD COLUMN     "albumId" TEXT,
ADD COLUMN     "albumName" TEXT,
ADD COLUMN     "artistId" TEXT NOT NULL,
ADD COLUMN     "artistName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "releaseDate" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar_url",
DROP COLUMN "created_at",
DROP COLUMN "full_name",
DROP COLUMN "last_player_state",
DROP COLUMN "playlists",
DROP COLUMN "refresh_token",
DROP COLUMN "reset_otp",
DROP COLUMN "reset_otp_expiry",
DROP COLUMN "reset_token",
DROP COLUMN "updated_at",
DROP COLUMN "user_name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "resetOtp" TEXT,
ADD COLUMN     "resetOtpExpiry" TIMESTAMP(3),
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "lastPlayerState" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userName_key" ON "Profile"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_avatarUrl_key" ON "Profile"("avatarUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_refreshToken_key" ON "User"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetOtp_key" ON "User"("resetOtp");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
