'use client';

import { Star, ThumbsUp, Flag } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toaster';

import type React from 'react';
interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  rating: number;
  title: string;
  content: string;
  date: string; // ← Required string
  helpful: number;
  verified: boolean;
}
// Mock review data
const mockReviews: Review[] = [
  {
    id: 'review-1',
    user: {
      name: 'Alex Johnson',
      avatar: '/placeholder.svg?height=40&width=40&text=AJ',
      initials: 'AJ',
    },
    rating: 5,
    title: 'Excellent quality and design',
    content:
      "I'm extremely impressed with the quality of this product. The design is exactly as pictured and the materials are top-notch. Shipping was fast and the packaging was secure. Would definitely recommend!",
    date: '2023-11-15',
    helpful: 24,
    verified: true,
  },
  {
    id: 'review-2',
    user: {
      name: 'Sam Rivera',
      avatar: '/placeholder.svg?height=40&width=40&text=SR',
      initials: 'SR',
    },
    rating: 4,
    title: 'Great product, minor sizing issue',
    content:
      "The product is fantastic overall. The design is beautiful and the quality is great. My only issue was that it ran slightly smaller than expected, so I'd recommend sizing up if you're between sizes. Otherwise, very happy with my purchase!",
    date: '2023-10-28',
    helpful: 18,
    verified: true,
  },
  {
    id: 'review-3',
    user: {
      name: 'Taylor Kim',
      avatar: '/placeholder.svg?height=40&width=40&text=TK',
      initials: 'TK',
    },
    rating: 5,
    title: 'Exceeded expectations',
    content:
      'This product exceeded all my expectations. The attention to detail is incredible and it looks even better in person than in the photos. Shipping was quick and customer service was excellent when I had a question. Highly recommen  Shipping was quick and customer service was excellent when I had a question. Highly recommend to any fan of the franchise!',
    date: '2023-11-02',
    helpful: 12,
    verified: true,
  },
  {
    id: 'review-4',
    user: {
      name: 'Jordan Smith',
      avatar: '/placeholder.svg?height=40&width=40&text=JS',
      initials: 'JS',
    },
    rating: 3,
    title: 'Good but not great',
    content:
      "The product is decent quality and the design is nice, but I was expecting something a bit more premium for the price point. It's still a good item, but there are a few areas where the quality could be improved. Shipping was fast though.",
    date: '2023-10-15',
    helpful: 8,
    verified: true,
  },
  {
    id: 'review-5',
    user: {
      name: 'Casey Morgan',
      avatar: '/placeholder.svg?height=40&width=40&text=CM',
      initials: 'CM',
    },
    rating: 5,
    title: 'Perfect gift for fans',
    content:
      'I bought this as a gift for my partner who is a huge fan, and they absolutely loved it! The quality is excellent and the design is spot on. It arrived quickly and was well packaged. Will definitely be purchasing more items in the future.',
    date: '2023-11-10',
    helpful: 15,
    verified: true,
  },
];

interface ProductReviewsProps {
  productId: string;
  rating: number;
  reviewCount: number;
}

export function ProductReviews({ productId, rating, reviewCount }: ProductReviewsProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Calculate rating distribution
  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    return review.rating === Number.parseInt(filter);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sort === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sort === 'highest') {
      return b.rating - a.rating;
    } else if (sort === 'lowest') {
      return a.rating - b.rating;
    } else if (sort === 'helpful') {
      return b.helpful - a.helpful;
    }
    return 0;
  });

  const handleHelpful = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review
      )
    );
    toast({
      title: 'Thanks for your feedback',
      description: 'You marked this review as helpful.',
    });
  };

  const handleReport = (reviewId: string) => {
    toast({
      title: 'Review reported',
      description: 'Thank you for helping us maintain quality reviews.',
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newReviewObj: Review = {
        id: `review-${Date.now()}`,
        user: {
          name: 'You',
          avatar: '/placeholder.svg?height=40&width=40&text=You',
          initials: 'YO',
        },
        rating: newReview.rating,
        title: newReview.title,
        content: newReview.content,
        date: new Date().toLocaleDateString('en-CA'), // ← Best solution
        helpful: 0,
        verified: true,
      };

      setReviews([newReviewObj, ...reviews]);
      setNewReview({ rating: 5, title: '', content: '' });
      setIsSubmitting(false);
      setShowReviewForm(false);

      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your feedback!',
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Rating Summary */}
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-6 text-center">
            <div className="text-4xl font-bold">{rating.toFixed(1)}</div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">Based on {reviewCount} reviews</div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <div className="flex w-12 items-center justify-end">
                  <span className="text-sm">{star} star</span>
                </div>
                <div className="h-2 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-400"
                    style={{
                      width: `${
                        (ratingCounts[star as keyof typeof ratingCounts] / reviews.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="w-8 text-right text-sm text-muted-foreground">
                  {ratingCounts[star as keyof typeof ratingCounts]}
                </div>
              </div>
            ))}
          </div>

          {/* Write a Review Button */}
          <Button className="w-full" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </Button>
        </div>

        {/* Review Form or Filters */}
        <div className="md:col-span-2">
          {showReviewForm ? (
            <div className="rounded-lg border p-6">
              <h3 className="mb-4 text-lg font-medium">Write Your Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="review-title" className="mb-2 block text-sm font-medium">
                    Review Title
                  </label>
                  <input
                    id="review-title"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Summarize your experience"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="review-content" className="mb-2 block text-sm font-medium">
                    Review
                  </label>
                  <Textarea
                    id="review-content"
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    placeholder="Share your experience with this product"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <label htmlFor="filter-reviews" className="text-sm font-medium">
                  Filter:
                </label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger id="filter-reviews" className="w-[140px]">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-reviews" className="text-sm font-medium">
                  Sort by:
                </label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger id="sort-reviews" className="w-[140px]">
                    <SelectValue placeholder="Newest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {!showReviewForm && (
        <div className="space-y-6">
          {sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.user.avatar} alt={review.user.name} />
                      <AvatarFallback>{review.user.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user.name}</span>
                        {review.verified && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium">{review.title}</h4>
                  <p className="mt-2 text-muted-foreground">{review.content}</p>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-sm"
                    onClick={() => handleHelpful(review.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpful})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-sm"
                    onClick={() => handleReport(review.id)}
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No reviews match your current filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
