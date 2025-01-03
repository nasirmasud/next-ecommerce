"use server";

import { PrismaClient } from "@prisma/client";
import { prismaToJsObject } from "../utils";

//get latest products
export async function getLatestProducts() {
  const prisma = new PrismaClient();

  const data = await prisma.product.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  });
  return prismaToJsObject(data);
}
