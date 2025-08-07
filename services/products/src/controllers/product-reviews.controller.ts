import { constants as StatusCodes } from "node:http2";
import type { FastifyReply, FastifyRequest } from "fastify";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

import { EventPublisher } from "@services/EventPublisher.js";
import { DateTime } from "luxon";
import type {
  DestroyReviewRequest,
  IndexReviewRequest,
  StoreReviewRequest,
  UpdateReviewRequest,
} from "@app-types/reviews/index.js";

export class ProductReviewsController {
  public static async index(
    request: FastifyRequest<IndexReviewRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const {
      log,
      query: { cursor, limit },
      params: { productId },
    } = request;

    try {
      const reviews = await prismaClient.review.findMany({
        where: {
          productId,
        },
        take: limit ?? 10,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      const nextCursor = reviews.slice(-1)[0]?.id ?? null;

      reply.send({
        data: reviews,
        nextCursor,
      });
    } catch (error) {
      log.error(
        error,
        `Could not get the review list for product ${productId}`,
      );

      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not get the review list",
      });
    }
  }
  public static async update(
    request: FastifyRequest<UpdateReviewRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const {
      log,
      body,
      params: { id },
    } = request;

    try {
      const oldReview = await prismaClient.review.findFirst({
        where: { id },
      });

      if (!oldReview) {
        return reply.code(StatusCodes.HTTP_STATUS_NOT_FOUND).send({
          message: "Review not found",
        });
      }
      const updatedReview = await prismaClient.review.update({
        where: {
          id,
        },
        data: body,
      });

      await EventPublisher.publishReviewEvent({
        type: "review.updated",
        productId: oldReview.productId,
        reviewId: id,
        rating: updatedReview.rating,
        oldRating: oldReview.rating,
        timestamp: DateTime.now().toISODate(),
      });

      reply.send({
        message: "Review successfully updated",
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return reply.code(StatusCodes.HTTP_STATUS_NOT_FOUND).send({
          message: "Review not found",
        });
      }

      log.error(error, `Could not update review with id: ${id}`);
      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not update review. Please try again later",
      });
    }
  }

  public static async store(
    request: FastifyRequest<StoreReviewRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const {
      log,
      body,
      params: { productId },
    } = request;
    try {
      const product = await prismaClient.product.findFirst({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return reply.code(StatusCodes.HTTP_STATUS_NOT_FOUND).send({
          message: "This product does not exist",
        });
      }

      const review = await prismaClient.review.create({
        data: { ...body, productId },
      });

      await EventPublisher.publishReviewEvent({
        type: "review.created",
        productId,
        reviewId: review.id,
        rating: review.rating,
        timestamp: DateTime.now().toISODate(),
      });

      reply.code(StatusCodes.HTTP_STATUS_CREATED).send({
        message: "Review successfully created",
      });
    } catch (error) {
      log.error(
        error,
        `Could not save review for product with id: ${productId}`,
      );
      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not save the review. Please try again later",
      });
    }
  }

  public static async destroy(
    request: FastifyRequest<DestroyReviewRequest>,
    reply: FastifyReply,
  ) {
    const { prismaClient } = request.server.diContainer.cradle;
    const {
      log,
      params: { id },
    } = request;
    try {
      const review = await prismaClient.review.findFirst({
        where: { id },
      });

      if (!review) {
        return reply.code(StatusCodes.HTTP_STATUS_NOT_FOUND).send({
          message: "Review not found",
        });
      }
      await prismaClient.review.delete({
        where: {
          id,
        },
      });

      await EventPublisher.publishReviewEvent({
        type: "review.deleted",
        productId: review.productId,
        reviewId: id,
        rating: review.rating,
        timestamp: new Date().toISOString(),
      });

      reply.send({
        message: "Review successfully deleted",
      });
    } catch (error) {
      log.error(error, `Could not delete review with id: ${id}`);
      reply.code(StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: "Could not delete review. Please try again later",
      });
    }
  }
}
