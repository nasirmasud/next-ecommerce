import { DollarSign, Headset, ShoppingBag, WalletCards } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const IconBoxes = () => {
  return (
    <div className='w-full px-4'>
      <Card className='w-full'>
        <CardContent className='grid md:grid-cols-4 gap-8 p-6 justify-between'>
          <div className='space-y-2 flex flex-col items-center'>
            <ShoppingBag />
            <div className='text-sm font-bold'>Free Shipping</div>
            <div className='text-sm text-muted-foreground'>
              Free Shipping on orders over $100
            </div>
          </div>
          <div className='space-y-2 flex flex-col items-center'>
            <DollarSign />
            <div className='text-sm font-bold'>Money Back Guarantee</div>
            <div className='text-sm text-muted-foreground'>
              Within 30 days after delivery
            </div>
          </div>
          <div className='space-y-2 flex flex-col items-center'>
            <WalletCards />
            <div className='text-sm font-bold'>Flexible Payment</div>
            <div className='text-sm text-muted-foreground'>
              Pay with credit card, PayPal or COD
            </div>
          </div>
          <div className='space-y-2 flex flex-col items-center'>
            <Headset />
            <div className='text-sm font-bold'>24/7 Support</div>
            <div className='text-sm text-muted-foreground'>
              Get Support at any time
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconBoxes;
