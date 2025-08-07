-- CreateIndex
CREATE INDEX "product_ratings_product_id_idx" ON "public"."product_ratings"("product_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_idx" ON "public"."reviews"("product_id");
