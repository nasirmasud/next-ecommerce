"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { Prisma } from "@prisma/client";
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
        message: `${product.name} added to cart`,
      };
    } else {
      // Check if item is already in the cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );
      if (existItem) {
        //Check Stock
        if (product.stock < 1) {
          throw new Error("Not enough stock");
        }
        //Increase the quantity
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1;
      } else {
        //Item does not exists
        if (product.stock < 1) throw new Error("Not enough stock");
        cart.items.push(item);
      }
      //Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calculatePrice(cart.items as CartItem[]),
        },
      });
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart`,
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

export async function removeFromCart(productId: string) {
  try {
    // Check for the cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    // Get the product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart is empty");

    // Check for item
    const existItem = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );

    if (!existItem) throw new Error("Item not found");

    // Check for the Qty
    if (existItem.qty === 1) {
      // Remove from cart
      cart.items = (cart.items as CartItem[]).filter(
        (i) => i.productId !== existItem.productId
      );
    } else {
      // Decrease Qty
      (cart.items as CartItem[]).find((i) => i.productId === productId)!.qty =
        existItem.qty - 1;
    }

    // Check if the cart is empty after removal
    if ((cart.items as CartItem[]).length === 0) {
      // If the cart is empty, reset the cart or delete it
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          shippingPrice: 0,
          totalPrice: 0,
        },
      });
    } else {
      // Update cart in database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calculatePrice(cart.items as CartItem[]),
        },
      });
    }

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} was removed from cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
