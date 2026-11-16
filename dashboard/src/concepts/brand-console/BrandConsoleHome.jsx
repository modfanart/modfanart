import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, CaretRight, Buildings, Trophy } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { useGetMyBrandsQuery } from '../../services/api/brandApi';

/**
 * Brand Console entry: pick a brand you own or manage, then act as that brand.
 */
export default function BrandConsoleHome() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetMyBrandsQuery();

  // getMyBrands returns a bare array from the API
  const brands = Array.isArray(data) ? data : data?.brands || [];

  return (
    <div className="min-h-screen" data-testid="brand-console-home">
      <Header
        title="Brand Console"
        subtitle="Act on behalf of a brand you own or manage"
      />

      <main className="mx-auto max-w-4xl p-4 sm:p-8 space-y-6">
        <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5">
          <div className="flex items-start gap-3">
            <Briefcase weight="duotone" className="w-8 h-8 text-fuchsia-400 shrink-0" />
            <div>
              <h2 className="text-lg font-medium text-white">Manager workspace</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Choose a brand to open its console. From there you can create and run contests,
                review participants, assign judges, and view leaderboards — the same actions a
                brand manager can take.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            Could not load your brands.
            <button
              type="button"
              className="ml-2 underline"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : brands.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <Buildings weight="duotone" className="mx-auto w-12 h-12 text-zinc-600 mb-3" />
            <p className="text-zinc-300 font-medium">No brands assigned to you</p>
            <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
              You need to own a brand or be added as an owner/manager before you can use Brand
              Console. Ask an admin to assign you, or create a brand from Directory.
            </p>
            <Link
              to="/brands"
              className="inline-flex mt-6 text-sm text-fuchsia-400 hover:text-fuchsia-300"
            >
              Go to Directory → Brands
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
              Your brands ({brands.length})
            </h3>
            <ul className="space-y-2">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/brand-console/${brand.id}`)}
                    className="w-full flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left hover:border-fuchsia-500/40 hover:bg-zinc-800/80 transition-colors"
                    data-testid={`brand-console-pick-${brand.id}`}
                  >
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center text-lg font-semibold">
                        {(brand.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate">{brand.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {brand.my_role ? (
                          <span className="capitalize text-fuchsia-300/90">{brand.my_role}</span>
                        ) : (
                          'Manager'
                        )}
                        {brand.slug ? ` · /${brand.slug}` : ''}
                        {brand.status ? ` · ${brand.status}` : ''}
                      </p>
                    </div>
                    <CaretRight className="w-5 h-5 text-zinc-500 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-zinc-500 pt-4">
          <Trophy className="w-4 h-4" />
          Contest management, judges, and leaderboards live inside each brand console.
        </div>
      </main>
    </div>
  );
}
