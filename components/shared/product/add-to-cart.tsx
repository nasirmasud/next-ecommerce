"use client";

import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeFromCart } from "@/lib/actions/cart.actions";
import { Cart, CartItem } from "@/types";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();

  //Handle add item tom cart function
  const handleAddToCart = async () => {
    const res = await addItemToCart(item);
    if (!res.success) {
      toast({
        variant: "destructive",
        description: res.message,
      });
      return;
    }
    //handle success add to cart
    toast({
      description: res.message,
      action: (
        <ToastAction
          className='bg-primary text-white hover:bg-gray-800'
          altText='Go To cart'
          onClick={() => router.push("/cart")}
        >
          Go To Cart
        </ToastAction>
      ),
    });
  };

  //Handle remove from cart function
  const handleRemoveCart = async () => {
    const res = await removeFromCart(item.productId);
    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });

    return;
  };
  // Check if item is in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div>
      <Button type='button' variant='outline' onClick={handleRemoveCart}>
        <Minus className='h-4 w-4' />
      </Button>
      <span className='px-4'>{existItem.qty}</span>
      <Button type='button' variant='outline' onClick={handleAddToCart}>
        <Plus className='h-4 w-4' />
      </Button>
    </div>
  ) : (
    <Button className='w-full' type='button' onClick={handleAddToCart}>
      <Plus />
      Add To Cart
    </Button>
  );
};

export default AddToCart;
