"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formatError } from "../utils";
import { insertReviewSchema } from "../validitors";

//create & update reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    //Validate & store review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });
    //Get the product of being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });
    if (!product) throw new Error("Product not found");
    //Check if user has already reviewed the product
    const reviewExists = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        //Update review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        //Create review
        await tx.review.create({ data: review });
      }
      //Get the average rating
      const averageRating = tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });
      const numReviews = tx.review.count({
        where: { productId: review.productId },
      });
      //Update product rating and numReviews in product table
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: (await averageRating)._avg.rating || 0,
          numReviews: await numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: "Review updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId: productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return { data };
}
