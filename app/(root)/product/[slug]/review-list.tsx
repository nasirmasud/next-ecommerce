"use client";

import Rating from "@/components/shared/product/rating";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getReviews } from "@/lib/actions/review.actions";
import { formatDateTime } from "@/lib/utils";
import { Review } from "@/types";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewForm from "./review-form";

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };
    loadReviews();
  }, [productId]);

  const reload = () => {
    console.log("Review Submitted");
  };

  return (
    <div className='space-y-4'>
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please{""}
          <Link
            className='text-blue-700 px-2'
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            Sign In
          </Link>
          {""}
          to leave a review
        </div>
      )}
      <div className='flex flex-col gap-3'>
        {/* Review */}
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className='flex-between'>
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex space-x-4 text-sm text-muted-foreground'>
                {/* Rating */}
                <Rating value={review.rating} />
                <div className='flex items-center'>
                  <User className='mr-1 h-3 w-3' />
                  {review.user ? review.user.name : "User"}
                </div>
                <div className='flex items-center'>
                  <Calendar className='mr-1 h-3 w-3' />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
