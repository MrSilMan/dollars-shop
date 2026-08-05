-- CreateTable
CREATE TABLE "_ProductExtraCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductExtraCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductExtraCategories_B_index" ON "_ProductExtraCategories"("B");

-- AddForeignKey
ALTER TABLE "_ProductExtraCategories" ADD CONSTRAINT "_ProductExtraCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductExtraCategories" ADD CONSTRAINT "_ProductExtraCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

