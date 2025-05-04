-- CreateTable
CREATE TABLE "_userFavourites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_userFavourites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_userFavourites_B_index" ON "_userFavourites"("B");

-- AddForeignKey
ALTER TABLE "_userFavourites" ADD CONSTRAINT "_userFavourites_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFavourites" ADD CONSTRAINT "_userFavourites_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
