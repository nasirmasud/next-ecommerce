import { z } from "zod";
import { PAYMENT_METHODS } from "./constants";
import { formatNumberWithDecimal } from "./utils";

const currencyFixed = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must be a valid number with 2 decimal places"
  );

//Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category: z.string().min(3, "Category must be at least 3 characters"),
  brand: z.string().min(3, "Brand must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  stock: z.coerce.number(),
  // images: z.array(z.string()).min(1, "At least one image is required"),
  // isFeatured: z.boolean(),
  // banner: z.string().nullable(),
  price: currencyFixed,
});

//Schema for updating products
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, "Id is required"),
});

//Schema for signIn users in
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

//Schema for signup user form
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password should be matched with previous password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ["confirmedPassword"],
  });

// Cart Schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  qty: z.number().int().nonnegative("Quantity must be positive number"),
  image: z.string().min(1, "Image is required"),
  price: currencyFixed,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currencyFixed,
  totalPrice: currencyFixed,
  shippingPrice: currencyFixed,
  taxPrice: currencyFixed,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});

//Schema for shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 character"),
  streetAddress: z
    .string()
    .min(3, "Street address must be at least 3 character"),
  city: z.string().min(3, "City name must be at least 3 character"),
  postalCode: z.string().min(3, "Postal Code must be at least 3 character"),
  country: z.string().min(3, "Country name must be at least 3 character"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

//Schema for payment methods
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

//Schema for inserting order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  itemsPrice: currencyFixed,
  shippingPrice: currencyFixed,
  taxPrice: currencyFixed,
  totalPrice: currencyFixed,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddress: shippingAddressSchema,
});

//Schema for inserting an order item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currencyFixed,
  qty: z.number(),
});

//Schema for payment result
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

//Schema for update profile
export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().min(3, "Email must be at least 3 characters"),
});
