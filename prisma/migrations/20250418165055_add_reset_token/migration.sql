/*
  Warnings:

  - Made the column `full_name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "refresh_token" TEXT,
    "reset_token" TEXT,
    "reset_otp" TEXT,
    "reset_token_expiry" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar_url", "created_at", "email", "full_name", "id", "password", "refresh_token", "updated_at", "user_name") SELECT "avatar_url", "created_at", "email", "full_name", "id", "password", "refresh_token", "updated_at", "user_name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_user_name_key" ON "User"("user_name");
CREATE UNIQUE INDEX "User_avatar_url_key" ON "User"("avatar_url");
CREATE UNIQUE INDEX "User_refresh_token_key" ON "User"("refresh_token");
CREATE UNIQUE INDEX "User_reset_token_key" ON "User"("reset_token");
CREATE UNIQUE INDEX "User_reset_otp_key" ON "User"("reset_otp");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
