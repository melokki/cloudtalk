import { ProductsController } from "@controllers/products.controller.js";
import {
  destroyProductSchema,
  indexProductSchema,
  showProductSchema,
  storeProductSchema,
  updateProductSchema,
} from "@validators/products/index.js";
import type { FastifyPluginAsync } from "fastify";
import type {
  DestroyProductRequest,
  IndexProductRequest,
  ShowProductRequest,
  StoreProductRequest,
  UpdateProductRequest,
} from "@app-types/products/index.js";

const products: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<IndexProductRequest>(
    "/",
    { schema: indexProductSchema.schema },
    ProductsController.index,
  );
  fastify.get<ShowProductRequest>(
    "/:id",
    { schema: showProductSchema.schema },
    ProductsController.show,
  );
  fastify.patch<UpdateProductRequest>(
    "/:id",
    { schema: updateProductSchema.schema },
    ProductsController.update,
  );
  fastify.post<StoreProductRequest>(
    "/",
    { schema: storeProductSchema.schema },
    ProductsController.store,
  );
  fastify.delete<DestroyProductRequest>(
    "/:id",
    { schema: destroyProductSchema.schema },
    ProductsController.destroy,
  );
};

export default products;

export const autoPrefix = "/products";
