import { auth } from "@/auth";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import PaymentMethodForm from "./payment-method-form";

export const metadata: Metadata = {
  title: "Payment Method",
  description: "Payment Method Page",
};

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("User not found");

  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </>
  );
};

export default PaymentMethodPage;
