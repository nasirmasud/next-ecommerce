"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  approvePayPalOrder,
  createPayPalOrder,
  deliverOrder,
  updateCODOrderToPaid,
} from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, shortenId } from "@/lib/utils";
import { Order } from "@/types";
import { OnApproveData } from "@paypal/paypal-js";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import StripePayment from "./stripe-payment";

// Reusable component for displaying payment status
const PaymentStatusBadge = ({
  isPaid,
  paidAt,
}: {
  isPaid: boolean;
  paidAt?: Date;
}) => {
  return isPaid ? (
    <Badge variant='secondary'>
      Paid at {paidAt ? formatDateTime(paidAt).dateTime : "unknown"}
    </Badge>
  ) : (
    <Badge variant='destructive'>Not paid</Badge>
  );
};

// Reusable component for displaying shipping address
const ShippingAddressCard = ({
  shippingAddress,
  isDelivered,
  deliveredAt,
}: {
  shippingAddress: Order["shippingAddress"];
  isDelivered: boolean;
  deliveredAt?: Date;
}) => {
  return (
    <Card className='my-2'>
      <CardContent className='p-4 gap-4'>
        <h2 className='text-xl pb-4'>Shipping Address</h2>
        <p>{shippingAddress.fullName}</p>
        <p className='mb-2'>
          {shippingAddress.streetAddress}, {shippingAddress.city},{" "}
          {shippingAddress.postalCode}, {shippingAddress.country}
        </p>
        {isDelivered ? (
          <Badge variant='secondary'>
            Delivered at{" "}
            {deliveredAt ? formatDateTime(deliveredAt).dateTime : "unknown"}
          </Badge>
        ) : (
          <Badge variant='destructive'>Not delivered</Badge>
        )}
      </CardContent>
    </Card>
  );
};

// Reusable component for displaying order items in a table
const OrderItemsTable = ({
  orderItems,
}: {
  orderItems: Order["orderItems"];
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderItems.map((item) => (
          <TableRow key={item.slug}>
            <TableCell>
              <Link
                href={`/product/${item.slug}`}
                passHref
                className='flex items-center'
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={50}
                  height={50}
                />
                <span className='px-2'>{item.name}</span>
              </Link>
            </TableCell>
            <TableCell>
              <span className='px-4'>{item.qty}</span>
            </TableCell>
            <TableCell>
              <span className='px-4'>${item.price}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Reusable component for PayPal loading state
const PayPalLoadingState = () => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  return (
    <div>
      {isPending && "Loading PayPal..."}
      {isRejected && "Error Loading PayPal"}
    </div>
  );
};

// Reusable component for PayPal payment buttons
const PayPalPayment = ({
  paypalClientId,
  onCreateOrder,
  onApproveOrder,
}: {
  paypalClientId: string;
  onCreateOrder: () => Promise<string>;
  onApproveOrder: (data: OnApproveData) => Promise<void>;
}) => {
  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId }}>
      <PayPalLoadingState />
      <PayPalButtons createOrder={onCreateOrder} onApprove={onApproveOrder} />
    </PayPalScriptProvider>
  );
};

// Reusable component for Mark as Paid button
const MarkAsPaidButton = ({ orderId }: { orderId: string }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleMarkAsPaid = async () => {
    const res = await updateCODOrderToPaid(orderId);
    toast({
      variant: res?.success ? "default" : "destructive",
      description: res?.message,
    });
  };

  return (
    <Button
      type='button'
      disabled={isPending}
      onClick={() => startTransition(handleMarkAsPaid)}
    >
      {isPending ? "Processing..." : "Mark As Paid"}
    </Button>
  );
};

// Reusable component for Mark as Delivered button
const MarkAsDeliveredButton = ({ orderId }: { orderId: string }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleMarkAsDelivered = async () => {
    const res = await deliverOrder(orderId);
    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  return (
    <Button
      type='button'
      disabled={isPending}
      onClick={() => startTransition(handleMarkAsDelivered)}
    >
      {isPending ? "Processing..." : "Mark As Delivered"}
    </Button>
  );
};

// Main component
const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
  stripeClientSecret,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string | null;
}) => {
  const {
    id,
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order;

  const { toast } = useToast();

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(id);
    if (!res.success) {
      toast({
        variant: "destructive",
        description: res.message,
      });
    }
    return res.data;
  };

  const handleApprovePayPalOrder = async (data: OnApproveData) => {
    const res = await approvePayPalOrder(id, { orderId: data.orderID });
    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  return (
    <>
      <h1 className='py-4 text-2xl'>Order {shortenId(id)}</h1>
      <div className='grid md:grid-cols-3 md:gap-5'>
        <div className='col-span-2 space-y-4 overflow-x-auto'>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Payment Method</h2>
              <p className='mb-2'>{paymentMethod}</p>
              <PaymentStatusBadge
                isPaid={!!isPaid}
                paidAt={isPaid ? (paidAt ?? undefined) : undefined}
              />
            </CardContent>
          </Card>
          <ShippingAddressCard
            shippingAddress={shippingAddress}
            isDelivered={!!isDelivered}
            deliveredAt={isDelivered ? (deliveredAt ?? undefined) : undefined}
          />
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Order Items</h2>
              <OrderItemsTable orderItems={orderItems} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className='p-4 gap-4 space-y-4'>
              <div className='flex justify-between'>
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Shipping Price</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {/* PayPal Payment */}
              {!isPaid && paymentMethod === "PayPal" && (
                <PayPalPayment
                  paypalClientId={paypalClientId}
                  onCreateOrder={handleCreatePayPalOrder}
                  onApproveOrder={handleApprovePayPalOrder}
                />
              )}

              {/* Stripe Payment */}
              {!isPaid && paymentMethod === "Stripe" && (
                <StripePayment
                  priceInCents={Number(order.totalPrice) * 100}
                  orderId={order.id}
                  clientSecret={stripeClientSecret ?? undefined}
                />
              )}

              {/* Cash on Delivery */}
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
                <MarkAsPaidButton orderId={id} />
              )}
              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton orderId={id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
