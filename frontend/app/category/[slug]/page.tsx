'use client';

import { useParams } from 'next/navigation';
import { useGetCategoryBySlugQuery } from '@/services/api/categoriesApi';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper';
export default function CategoryPage() {
  const params = useParams<{ slug: string }>();

  const slug = params.slug;
  // or even safer:
  // const slug = params.slug ? String(params.slug) : undefined;

  const { data, isLoading } = useGetCategoryBySlugQuery(slug, {
    // Optional: skip query if slug is missing/invalid
    skip: !slug,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!slug) return <div>Invalid category URL</div>;
  if (!data) return <div>Category not found</div>;

  return (
    <LayoutWrapper>
      <div className="container py-10">
        <h1 className="text-4xl font-bold">{data.name}</h1>

        {data.description && <p className="mt-4 text-muted-foreground">{data.description}</p>}

        {/* Later: show artworks/products under this category */}
      </div>
    </LayoutWrapper>
  );
}
