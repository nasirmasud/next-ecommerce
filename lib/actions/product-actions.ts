"use server";

import { PrismaClient } from "@prisma/client";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import { prismaToJsObject } from "../utils";

//get latest products
export async function getLatestProducts() {
  const prisma = new PrismaClient();

  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });
  return prismaToJsObject(data);
}
