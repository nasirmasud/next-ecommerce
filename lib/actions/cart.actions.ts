"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { formatError, prismaToJsObject, roundT } from "../utils";
import { cartItemSchema, insertCartSchema } from "../validitors";

//Calculate cart prices
const calculatePrice = (items: CartItem[]) => {
  const itemsPrice = roundT(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = roundT(itemsPrice > 100 ? 0 : 10),
    taxPrice = roundT(0.15 * itemsPrice),
    totalPrice = itemsPrice + shippingPrice + taxPrice;
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    //Check for the cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    //Get session & user id
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    //Get cart
    const cart = await getMyCart();
    //parse and validate item
    const item = cartItemSchema.parse(data);

    //Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    if (!cart) {
      //Create ne cart
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calculatePrice([item]),
      });

      //Add to database
      await prisma.cart.create({
        data: newCart,
      });
      //Revalidate product page
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: "Item added to cart",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  //Check for the cart cookie
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found");
  //Get session & user id
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  //Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;
  //Convert and return
  return prismaToJsObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}
