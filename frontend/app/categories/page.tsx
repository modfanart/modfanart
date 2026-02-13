'use client';

import Link from 'next/link';
import { useGetAllCategoriesQuery } from '@/services/api/categoriesApi';
import { LayoutWrapper } from '@/components/layout-wrapper';
export default function CategoriesPage() {
  const { data, isLoading } = useGetAllCategoriesQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <LayoutWrapper>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data?.categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="p-4 border rounded-lg hover:shadow-md transition"
            >
              <h2 className="font-semibold">{cat.name}</h2>
              {cat.description && (
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
}
