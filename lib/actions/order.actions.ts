// "use server";

// import { auth } from "@/auth";
// import { prisma } from "@/db/prisma";
// import { CartItem, PaymentResult } from "@/types";
// import { Prisma } from "@prisma/client";
// import { revalidatePath } from "next/cache";
// import { isRedirectError } from "next/dist/client/components/redirect-error";
// import { PAGE_SIZE } from "../constants";
// import { paypal } from "../paypal";
// import { formatError, prismaToJsObject } from "../utils";
// import { insertOrderSchema } from "../validators";
// import { getMyCart } from "./cart.actions";
// import { getUserById } from "./user.actions";

// export async function createOrder() {
//   try {
//     const session = await auth();
//     if (!session) throw new Error("User is not Authenticated");

//     const cart = await getMyCart();
//     const userId = session?.user?.id ?? null;
//     if (userId === null) throw new Error("User not found");

//     const user = await getUserById(userId);

//     if (!cart || cart.items.length === 0) {
//       return {
//         success: false,
//         message: "Your cart is empty",
//         redirect: "/cart",
//       };
//     }
//     if (!user.address) {
//       return {
//         success: false,
//         message: "No shipping address found",
//         redirect: "/shipping-address",
//       };
//     }
//     if (!user.paymentMethod) {
//       return {
//         success: false,
//         message: "No payment method found",
//         redirect: "/payment-method",
//       };
//     }

//     //Create order object
//     const order = insertOrderSchema.parse({
//       userId: user.id,
//       shippingAddress: user.address,
//       paymentMethod: user.paymentMethod,
//       itemsPrice: cart.itemsPrice,
//       taxPrice: cart.taxPrice,
//       shippingPrice: cart.shippingPrice,
//       totalPrice: cart.totalPrice,
//     });
//     //Create a transaction to create order items in database
//     const insertedOrderId = await prisma.$transaction(async (tx) => {
//       //Create order
//       const insertedOrder = await tx.order.create({ data: order });
//       //Create order items from the cart items
//       for (const item of cart.items as CartItem[]) {
//         await tx.orderItem.create({
//           data: {
//             ...item,
//             price: item.price,
//             orderId: insertedOrder.id,
//           },
//         });
//       }
//       //Clear the cart
//       await tx.cart.update({
//         where: { id: cart.id },
//         data: {
//           items: [],
//           totalPrice: 0,
//           taxPrice: 0,
//           shippingPrice: 0,
//           itemsPrice: 0,
//         },
//       });
//       return insertedOrder.id;
//     });
//     if (!insertedOrderId) throw new Error("Order not created");

//     return {
//       success: true,
//       message: "Order created successfully",
//       redirectTo: `/order/${insertedOrderId}`,
//     };
//   } catch (error) {
//     if (isRedirectError(error)) throw error;
//     return { success: false, message: formatError(error) };
//   }
// }

// //Get order by id
// export async function getOrderById(orderId: string) {
//   const data = await prisma.order.findFirst({
//     where: { id: orderId },
//     include: {
//       orderItems: true,
//       user: { select: { name: true, email: true } },
//     },
//   });
//   return prismaToJsObject(data);
// }

// //Create new paypal order
// export async function createPayPalOrder(orderId: string) {
//   try {
//     //Get order fro database
//     const order = await prisma.order.findFirst({
//       where: {
//         id: orderId,
//       },
//     });
//     if (order) {
//       //Create paypal order
//       const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
//       //Update order with paypal id
//       await prisma.order.update({
//         where: { id: orderId },
//         data: {
//           paymentResult: {
//             id: paypalOrder.id,
//             email_address: "",
//             status: "",
//             pricePaid: 0,
//           },
//         },
//       });
//       return {
//         success: true,
//         message: "Item order created successfully",
//         data: paypalOrder.id,
//       };
//     } else {
//       throw new Error("Order not found");
//     }
//   } catch (error) {
//     return { success: false, message: formatError(error) };
//   }
// }

// //Approved paypal order and update order to paid
// export async function approvePayPalOrder(
//   orderId: string,
//   data: { orderId: string }
// ) {
//   try {
//     //Get order fro database
//     const order = await prisma.order.findFirst({
//       where: {
//         id: orderId,
//       },
//     });
//     if (!order) throw new Error("Order not found");

//     //Check for mismatch
//     const captureData = await paypal.capturePayment(data.orderId);
//     if (
//       !captureData ||
//       captureData.id !== (order.paymentResult as PaymentResult)?.id ||
//       captureData.status !== "COMPLETED"
//     ) {
//       throw new Error("Error in PayPal payment");
//     }
//     //Update order to paid
//     await updateOrderToPaid({
//       orderId,
//       paymentResult: {
//         id: captureData.id,
//         status: captureData.status,
//         email_address: captureData.payer.email_address,
//         pricePaid:
//           captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
//       },
//     });

//     //Refresh the url
//     revalidatePath(`/order/${orderId}`);

//     return {
//       success: true,
//       message: "Your order has been paid",
//     };
//   } catch (error) {
//     return { success: false, message: formatError(error) };
//   }
// }

// //Update order to paid
// async function updateOrderToPaid({
//   orderId,
//   paymentResult,
// }: {
//   orderId: string;
//   paymentResult?: PaymentResult;
// }) {
//   //Get order from database
//   const order = await prisma.order.findFirst({
//     where: {
//       id: orderId,
//     },
//     include: {
//       orderItems: true,
//     },
//   });
//   if (!order) throw new Error("Order not found");
//   if (order.isPaid) throw new Error("Order is already paid");

//   //Transaction to update and account for product stock
//   await prisma.$transaction(async (tx) => {
//     //Iterate over products and update stock
//     for (const item of order.orderItems) {
//       await tx.product.update({
//         where: { id: item.productId },
//         data: { stock: { increment: -item.qty } },
//       });
//     }
//     //Set the order to paid
//     await tx.order.update({
//       where: { id: orderId },
//       data: {
//         isPaid: true,
//         paidAt: new Date(),
//         paymentResult,
//       },
//     });
//   });

//   //get updated order after transaction
//   const updatedOrder = await prisma.order.findFirst({
//     where: { id: orderId },
//     include: {
//       orderItems: true,
//       user: { select: { name: true, email: true } },
//     },
//   });
//   if (!updatedOrder) throw new Error("Order not found");
// }

// //Get the user's Orders
// export async function getMyOrders({
//   limit = PAGE_SIZE,
//   page,
// }: {
//   limit?: number;
//   page: number;
// }) {
//   const session = await auth();
//   if (!session) throw new Error("User is not authorized");

//   const data = await prisma.order.findMany({
//     where: { userId: session?.user?.id ?? "" }, // Use nullish coalescing operator (`??`) to provide a fallback
//     orderBy: { createdAt: "desc" },
//     take: limit,
//     skip: (page - 1) * limit,
//   });

//   const dataCount = await prisma.order.count({
//     where: { userId: session?.user?.id ?? "" }, // Use nullish coalescing operator (`??`) to provide a fallback
//   });

//   return {
//     data,
//     totalPage: Math.ceil(dataCount / limit),
//   };
// }

// //Get sales data and order summary
// type SalesDataType = {
//   month: string;
//   totalSales: number;
// }[];
// export async function getOrderSummary() {
//   //Get count for each resource
//   const ordersCount = await prisma.order.count();
//   const productsCount = await prisma.product.count();
//   const usersCount = await prisma.user.count();
//   //Calculate the total sales
//   const totalSales = await prisma.order.aggregate({
//     _sum: { totalPrice: true },
//   });
//   //Get monthly sales
//   const salesDataRaw = await prisma.$queryRaw<
//     Array<{ month: string; totalSales: Prisma.Decimal }>
//   >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;
//   const salesData: SalesDataType = salesDataRaw.map((entry) => ({
//     month: entry.month,
//     totalSales: Number(entry.totalSales),
//   }));
//   //Get latest sales
//   const latestSales = await prisma.order.findMany({
//     orderBy: { createdAt: "desc" },
//     include: {
//       user: { select: { name: true } },
//     },
//     take: 6,
//   });

//   return {
//     ordersCount,
//     productsCount,
//     usersCount,
//     totalSales,
//     latestSales,
//     salesData,
//   };
// }

// //Get all orders
// export async function getAllOrders({
//   limit = PAGE_SIZE,
//   page,
//   query,
// }: {
//   limit?: number;
//   page: number;
//   query: string;
// }) {
//   const queryFilter: Prisma.OrderWhereInput =
//     query && query !== "all"
//       ? {
//           user: {
//             name: {
//               contains: query,
//               mode: "insensitive",
//             } as Prisma.StringFilter,
//           },
//         }
//       : {};

//   const data = await prisma.order.findMany({
//     where: { ...queryFilter },
//     orderBy: { createdAt: "desc" },
//     take: limit,
//     skip: (page - 1) * limit,
//     include: { user: { select: { name: true } } },
//   });
//   const dataCount = await prisma.order.count();

//   return {
//     data,
//     totalPages: Math.ceil(dataCount / limit),
//   };
// }

// export async function deleteOrder(id: string) {
//   try {
//     await prisma.order.delete({ where: { id } });
//     revalidatePath("/admin/orders");
//     return {
//       success: true,
//       message: "Order deleted successfully",
//     };
//   } catch (error) {
//     return { success: false, message: formatError(error) };
//   }
// }

// //Update COD orders to paid
// export async function updateCODOrderToPaid(orderId: string) {
//   try {
//     await updateOrderToPaid({ orderId });
//     revalidatePath(`/order/${orderId}`);
//   } catch (error) {
//     return { success: false, message: formatError(error) };
//   }
// }

// //Update COD orders to delivered
// export async function deliverOrder(orderId: string) {
//   try {
//     const order = await prisma.order.findFirst({
//       where: { id: orderId },
//     });
//     if (!order) throw new Error("Order not found");
//     if (!order.isPaid) throw new Error("Order is not paid");

//     await prisma.order.update({
//       where: { id: orderId },
//       data: { isDelivered: true, deliveredAt: new Date() },
//     });

//     revalidatePath(`/order/${orderId}`);

//     return { success: true, message: "Order has been marked as delivered" };
//   } catch (error) {
//     return { success: false, message: formatError(error) };
//   }
// }

"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { PAGE_SIZE } from "../constants";
import { paypal } from "../paypal";
import { formatError, prismaToJsObject } from "../utils";
import { insertOrderSchema } from "../validators";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";

// Helper function to validate user session
const validateSession = async () => {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");
  return session;
};

// Helper function to validate user ID
const validateUserId = (userId: string | null) => {
  if (!userId) throw new Error("User not found");
  return userId;
};

// Helper function to validate cart
const validateCart = (cart: any) => {
  if (!cart || cart.items.length === 0) {
    return {
      success: false,
      message: "Your cart is empty",
      redirect: "/cart",
    };
  }
  return null;
};

// Helper function to validate user address and payment method
const validateUserDetails = (user: any) => {
  if (!user.address) {
    return {
      success: false,
      message: "No shipping address found",
      redirect: "/shipping-address",
    };
  }
  if (!user.paymentMethod) {
    return {
      success: false,
      message: "No payment method found",
      redirect: "/payment-method",
    };
  }
  return null;
};

// Create a new order
export async function createOrder() {
  try {
    const session = await validateSession();
    const userId = validateUserId(session.user?.id ?? null);
    const user = await getUserById(userId);
    const cart = await getMyCart();

    const cartValidation = validateCart(cart);
    if (cartValidation) return cartValidation;

    const userValidation = validateUserDetails(user);
    if (userValidation) return userValidation;

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      taxPrice: cart.taxPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });

      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// Get order by ID
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  return prismaToJsObject(data);
}

// Create a new PayPal order
export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          email_address: "",
          status: "",
          pricePaid: 0,
        },
      },
    });

    return {
      success: true,
      message: "PayPal order created successfully",
      data: paypalOrder.id,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Approve PayPal order and update order to paid
export async function approvePayPalOrder(
  orderId: string,
  data: { orderId: string }
) {
  try {
    const order = await prisma.order.findFirst({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderId);
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Error in PayPal payment");
    }

    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been paid",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update order to paid
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order is already paid");

  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!updatedOrder) throw new Error("Order not found");
}

// Get the user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await validateSession();
  const userId = validateUserId(session.user?.id ?? null);

  const data = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({ where: { userId } });

  return {
    data,
    totalPage: Math.ceil(dataCount / limit),
  };
}

// Get sales data and order summary
type SalesDataType = { month: string; totalSales: number }[];
export async function getOrderSummary() {
  const [
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesDataRaw,
    latestSales,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { totalPrice: true } }),
    prisma.$queryRaw<Array<{ month: string; totalSales: Prisma.Decimal }>>`
      SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales"
      FROM "Order"
      GROUP BY to_char("createdAt", 'MM/YY')
    `,
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
      take: 6,
    }),
  ]);

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales: totalSales._sum.totalPrice || 0,
    latestSales,
    salesData,
  };
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            } as Prisma.StringFilter,
          },
        }
      : {};

  const [data, dataCount] = await Promise.all([
    prisma.order.findMany({
      where: { ...queryFilter },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: { user: { select: { name: true } } },
    }),
    prisma.order.count(),
  ]);

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update COD order to paid
export async function updateCODOrderToPaid(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update order to delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");

    await prisma.order.update({
      where: { id: orderId },
      data: { isDelivered: true, deliveredAt: new Date() },
    });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order has been marked as delivered" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
