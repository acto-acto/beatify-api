-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "audio" TEXT,
    "image" TEXT,
    "artist_id" TEXT NOT NULL,
    "artist_name" TEXT NOT NULL,
    "album_name" TEXT,
    "album_id" TEXT,
    "release_date" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
