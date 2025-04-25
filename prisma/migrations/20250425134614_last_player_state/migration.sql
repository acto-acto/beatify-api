/*
  Warnings:

  - You are about to drop the column `last_played` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "last_played",
ADD COLUMN     "last_player_state" JSONB;
