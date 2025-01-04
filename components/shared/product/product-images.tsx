"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className='space-y-4'>
      <Image
        src={images[current]}
        alt='product image'
        width={700}
        height={700}
        className='min-h-[300px] object-center object-cover'
      />
      <div className='flex'>
        {images.map((image, index) => (
          <div
            key={image}
            onClick={() => setCurrent(index)}
            className={cn(
              "border mr2 cursor-pointer hover:border-orange-500",
              current === index && "border-orange-300"
            )}
          >
            <Image src={image} alt='image' width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
