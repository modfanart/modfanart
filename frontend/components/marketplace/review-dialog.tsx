'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  getApiErrorMessage,
  useCreateReviewMutation,
  type OrderItem,
} from '@/services/api/marketplaceApi';
import { cn } from '@/lib/utils';

// A review is tied to a purchased line item (the backend enforces one review
// per order item and that the order is fulfilled).
export function ReviewDialog({ item }: { item: OrderItem }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const isMerch = item.item_type === 'merch_variant';
  const targetId = isMerch ? item.merch_product_id : item.artwork_id;
  const name = item.product_title || item.artwork_title || item.description || 'this item';

  if (!targetId) return null;

  const submit = async () => {
    try {
      await createReview({
        target_type: isMerch ? 'merch_product' : 'artwork',
        target_id: targetId,
        order_item_id: item.id,
        rating,
        body: body.trim() || undefined,
      }).unwrap();
      toast({ title: 'Thanks for your review!' });
      setOpen(false);
    } catch (err) {
      toast({
        title: "Couldn't submit review",
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="mr-1 h-3.5 w-3.5" /> Write a review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {name}</DialogTitle>
          <DialogDescription>Tell other shoppers what you thought.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Your rating</Label>
            <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n === 1 ? '' : 's'}`}
                  onClick={() => setRating(n)}
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="review-body">Comments (optional)</Label>
            <Textarea
              id="review-body"
              className="mt-2"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <Button className="w-full" disabled={rating < 1 || isLoading} onClick={submit}>
            {isLoading ? 'Submitting…' : 'Submit review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
