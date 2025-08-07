import { ProductReviewsController } from "@controllers/product-reviews.controller.js";

import type { FastifyPluginAsync } from "fastify";
import type {
  DestroyReviewRequest,
  IndexReviewRequest,
  StoreReviewRequest,
  UpdateReviewRequest,
} from "@app-types/reviews/index.js";
import {
  destroyProductReviewSchema,
  indexProductReviewsSchema,
  storeProductReviewSchema,
  updateProductReviewSchema,
} from "@validators/reviews/index.js";

const products: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<IndexReviewRequest>(
    "/",
    { schema: indexProductReviewsSchema.schema },
    ProductReviewsController.index,
  );
  fastify.patch<UpdateReviewRequest>(
    "/:id",
    { schema: updateProductReviewSchema.schema },
    ProductReviewsController.update,
  );
  fastify.post<StoreReviewRequest>(
    "/",
    { schema: storeProductReviewSchema.schema },
    ProductReviewsController.store,
  );
  fastify.delete<DestroyReviewRequest>(
    "/:id",
    { schema: destroyProductReviewSchema.schema },
    ProductReviewsController.destroy,
  );
};

export default products;

export const autoPrefix = "/products/:productId/reviews";
