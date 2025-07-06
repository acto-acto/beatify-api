-- CreateTable
CREATE TABLE "SearchItem" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SearchItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchItem_query_key" ON "SearchItem"("query");

-- CreateIndex
CREATE UNIQUE INDEX "SearchItem_userId_key" ON "SearchItem"("userId");

-- AddForeignKey
ALTER TABLE "SearchItem" ADD CONSTRAINT "SearchItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
