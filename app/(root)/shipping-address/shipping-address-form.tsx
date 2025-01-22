"use client";

import { useToast } from "@/hooks/use-toast";
import { ShippingAddress } from "@/types";
import { useRouter } from "next/navigation";

const ShippingAddressForm = ({ address }: { address: ShippingAddress }) => {
  const router = useRouter();
  const { toast } = useToast();

  return <>Shipping Address From</>;
};

export default ShippingAddressForm;
