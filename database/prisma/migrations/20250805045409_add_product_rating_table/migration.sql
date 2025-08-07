-- CreateTable
CREATE TABLE "public"."product_ratings" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "average_rating" DECIMAL(3,2) NOT NULL,
    "review_count" INTEGER NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_ratings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."product_ratings" ADD CONSTRAINT "product_ratings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
