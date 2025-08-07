/*
  Warnings:

  - You are about to drop the column `last_updated` on the `product_ratings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."product_ratings" DROP COLUMN "last_updated",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
