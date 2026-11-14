// Marketplace → Reviews: find and remove abusive or fake product reviews.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatCircleText, MagnifyingGlass, Star } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { useGetReviewsQuery, useRemoveReviewMutation } from '../../services/api/opsApi';
import {
  PageShell,
  Panel,
  QueryState,
  Empty,
  Pager,
  DataTable,
  ConfirmDialog,
  inputClass,
  selectClass,
  timeAgo,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';

const LIMIT = 50;

const Stars = ({ n }) => (
  <span className="inline-flex" aria-label={`${n} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} weight={i <= n ? 'fill' : 'regular'} className={`h-3.5 w-3.5 ${i <= n ? 'text-amber-300' : 'text-zinc-600'}`} />
    ))}
  </span>
);

export const ReviewsPage = () => {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [offset, setOffset] = useState(0);
  const [removing, setRemoving] = useState(null);

  const reviews = useGetReviewsQuery({ search, rating, limit: LIMIT, offset });
  const [removeReview, { isLoading }] = useRemoveReviewMutation();
  const rows = reviews.data ?? [];

  const confirm = async () => {
    try {
      await removeReview(removing.id).unwrap();
      toast.success('Review removed');
      setRemoving(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove the review'));
    }
  };

  return (
    <PageShell title="Reviews" subtitle="Product reviews from verified buyers" testId="reviews-page">
      <Panel>
        <form
          className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
            setOffset(0);
          }}
        >
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              aria-label="Search reviews"
              className={`${inputClass} pl-9`}
              placeholder="Search text, product or reviewer…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            aria-label="Rating"
            className={selectClass}
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">Any rating</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} star{r > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" className="h-9 bg-white text-black hover:bg-zinc-200">
            Search
          </Button>
        </form>

        <QueryState query={reviews} isEmpty={rows.length === 0} empty={<Empty icon={ChatCircleText} title="No reviews match" />}>
          <DataTable
            rows={rows}
            columns={[
              { key: 'rating', header: 'Rating', cell: (r) => <Stars n={r.rating} /> },
              {
                key: 'body',
                header: 'Review',
                cell: (r) => <p className="max-w-xl whitespace-pre-line text-zinc-200">{r.body || <span className="text-zinc-500">No text</span>}</p>,
              },
              {
                key: 'product',
                header: 'Product',
                cell: (r) =>
                  r.target_type === 'merch_product' || r.product_title ? (
                    <Link to={`/storefront/product/${r.target_id}`} className="text-zinc-300 hover:underline">
                      {r.product_title || 'Product'}
                    </Link>
                  ) : (
                    <span className="text-zinc-500">{r.target_type}</span>
                  ),
              },
              { key: 'by', header: 'By', cell: (r) => <span className="text-zinc-400">{r.reviewer_username || '–'}</span> },
              { key: 'when', header: 'When', className: 'whitespace-nowrap text-xs text-zinc-500', cell: (r) => timeAgo(r.created_at) },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                cell: (r) => (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-red-900 text-red-300 hover:bg-red-950"
                    onClick={() => setRemoving(r)}
                  >
                    Remove
                  </Button>
                ),
              },
            ]}
          />
          <Pager offset={offset} limit={LIMIT} count={rows.length} onChange={setOffset} />
        </QueryState>
      </Panel>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Remove this review?"
        description="It disappears from the product page and the product's rating is recalculated. The removal is logged."
        tone="danger"
        confirmLabel="Remove"
        busy={isLoading}
        onConfirm={confirm}
      />
    </PageShell>
  );
};

export default ReviewsPage;
