import { constants as StatusCodes } from "node:http2";
import type { FastifyReply, FastifyRequest } from "fastify";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/binary";
import type {
  DestroyProductRequest,
  IndexProductRequest,
  ShowProductRequest,
  StoreProductRequest,
  UpdateProductRequest,
} from "@app-types/products/index.js";

export class ProductsController {
  public static async index(
    request: FastifyRequest<IndexProductRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const {
      log,
      query: { cursor, limit },
    } = request;

    try {
      const products = await prismaClient.product.findMany({
        take: limit ?? 10,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      const nextCursor = products.slice(-1)[0]?.id ?? null;

      reply.send({
        data: products,
        nextCursor,
      });
    } catch (error) {
      log.error(error, `Could not get the product list`);

      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not get the product list",
      });
    }
  }

  public static async show(
    request: FastifyRequest<ShowProductRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const {
      params: { id },
      log,
    } = request;
    try {
      const product = await prismaClient.product.findFirst({
        where: {
          id,
        },
        include: {
          productRating: {
            select: {
              averageRating: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!product) {
        return reply.code(StatusCodes.HTTP_STATUS_NOT_FOUND).send({
          message: "Product not found",
        });
      }

      reply.send({
        data: {
          ...product,
          averageRating: product?.productRating[0]?.averageRating || 0,
          productRating: undefined,
        },
      });
    } catch (error) {
      log.error(error, `Could not get product with id: ${id} ${error}`);
      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not get product. Please try again later",
      });
    }
  }

  public static async update(
    request: FastifyRequest<UpdateProductRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const {
      log,
      body,
      params: { id },
    } = request;

    try {
      await prismaClient.product.update({
        where: {
          id,
        },
        data: body,
      });

      reply.send({
        message: "Product successfully updated",
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return reply.code(StatusCodes.HTTP_STATUS_NOT_FOUND).send({
          message: "Product not found",
        });
      }

      log.error(error, `Could not update product with id: ${id}`);
      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not update product. Please try again later",
      });
    }
  }

  public static async store(
    request: FastifyRequest<StoreProductRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const { name } = request.body;
    try {
      const product = await prismaClient.product.findFirst({
        where: {
          name,
        },
      });

      if (product) {
        request.log.info(`Duplicate product ${name}`);

        return reply.code(StatusCodes.HTTP_STATUS_CONFLICT).send({
          message: "This product already exists in database",
        });
      }

      await prismaClient.product.create({
        data: { ...request.body },
      });

      reply.code(StatusCodes.HTTP_STATUS_CREATED).send({
        message: "Product successfully created",
      });
    } catch (error) {
      request.log.error(error, "Unable to save product");
      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not create the product. Please try again later",
      });
    }
  }
  public static async destroy(
    request: FastifyRequest<DestroyProductRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const {
      log,
      params: { id },
    } = request;
    try {
      await prismaClient.product.delete({
        where: {
          id,
        },
      });

      reply.send({
        message: "Product successfully deleted",
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return reply.code(StatusCodes.HTTP_STATUS_NOT_FOUND).send({
          message: "Product not found",
        });
      }

      log.error(error, `Could not delete product with id: ${id}`);
      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not delete product. Please try again later",
      });
    }
  }
}
