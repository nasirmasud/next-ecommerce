"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { shippingAddressSchema } from "@/lib/validitors";
import { ShippingAddress } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";

const ShippingAddressForm = ({ address }: { address: ShippingAddress }) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: shippingAddressDefaultValues || address,
  });

  const [isLoading, startTransition] = useTransition();

  const onSubmit = () => {
    return;
  };

  return (
    <>
      <div className='max-w-md mx-auto space-y-4'>
        <h1 className='h2-bold mt-4'>Shipping Address</h1>
        <p className='text-sm text-muted-foreground'>
          Please enter an address to ship
        </p>
        <Form {...form}>
          <form
            method='post'
            className="'space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className='flex flex-col gam-5 md:flex-row'>
              <FormField
                control={form.control}
                name='fullName'
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    z.infer<typeof shippingAddressSchema>,
                    "fullName"
                  >;
                }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter Full Name' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-col gam-5 md:flex-row'>
              <FormField
                control={form.control}
                name='streetAddress'
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    z.infer<typeof shippingAddressSchema>,
                    "streetAddress"
                  >;
                }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter Address' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ShippingAddressForm;
