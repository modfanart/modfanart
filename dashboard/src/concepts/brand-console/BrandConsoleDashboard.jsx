import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Users,
  UserPlus,
  Plus,
  ChartBar,
  Buildings,
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { useGetMyBrandsQuery, useGetBrandQuery } from '../../services/api/brandApi';
import { useGetContestsQuery } from '../../services/api/contestsApi';

const statusTone = {
  draft: 'bg-zinc-500/20 text-zinc-300',
  live: 'bg-emerald-500/20 text-emerald-300',
  judging: 'bg-amber-500/20 text-amber-300',
  completed: 'bg-sky-500/20 text-sky-300',
};

export default function BrandConsoleDashboard() {
  const { brandId } = useParams();
  const navigate = useNavigate();

  const { data: brandFromDetail, isLoading: brandLoading } = useGetBrandQuery(brandId, {
    skip: !brandId,
  });
  const { data: myBrandsData } = useGetMyBrandsQuery();
  const myBrands = Array.isArray(myBrandsData) ? myBrandsData : myBrandsData?.brands || [];
  const myBrand = myBrands.find((b) => b.id === brandId);

  // Brand detail endpoint may return the object directly or nested
  const brand = brandFromDetail?.id
    ? brandFromDetail
    : brandFromDetail?.brand || myBrand || null;

  const { data: contestsData, isLoading: contestsLoading } = useGetContestsQuery(
    { brandId, limit: 50 },
    { skip: !brandId }
  );
  const contests = contestsData?.contests || [];

  const counts = {
    total: contests.length,
    live: contests.filter((c) => c.status === 'live').length,
    draft: contests.filter((c) => c.status === 'draft').length,
    judging: contests.filter((c) => c.status === 'judging').length,
    completed: contests.filter((c) => c.status === 'completed').length,
  };

  return (
    <div className="min-h-screen" data-testid="brand-console-dashboard">
      <Header
        title={brand?.name || 'Brand console'}
        subtitle={
          myBrand?.my_role
            ? `Acting as ${myBrand.my_role}`
            : 'Brand manager workspace'
        }
      />

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white"
            onClick={() => navigate('/brand-console')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Switch brand
          </Button>
          {brand?.slug && (
            <span className="text-xs font-mono text-zinc-500">/{brand.slug}</span>
          )}
        </div>

        {brandLoading && !brand ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <section className="flex flex-col sm:flex-row gap-4 items-start rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              {brand?.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-fuchsia-500/15 flex items-center justify-center">
                  <Buildings className="w-8 h-8 text-fuchsia-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-white">{brand?.name}</h2>
                {brand?.description && (
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{brand.description}</p>
                )}
              </div>
              <Button
                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white shrink-0"
                onClick={() => navigate(`/brand-console/${brandId}/contests/new`)}
                data-testid="brand-console-create-contest"
              >
                <Plus className="w-4 h-4 mr-2" />
                New contest
              </Button>
            </section>

            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Contests', value: counts.total, icon: Trophy },
                { label: 'Live', value: counts.live, icon: ChartBar },
                { label: 'Judging', value: counts.judging, icon: UserPlus },
                { label: 'Drafts', value: counts.draft, icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4"
                >
                  <div className="flex items-center justify-between text-zinc-500 text-xs uppercase tracking-wide">
                    {label}
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {contestsLoading ? '—' : value}
                  </p>
                </div>
              ))}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Contests</h3>
                <Link
                  to={`/brand-console/${brandId}/contests`}
                  className="text-sm text-fuchsia-400 hover:text-fuchsia-300"
                >
                  View all
                </Link>
              </div>

              {contestsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : contests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center">
                  <Trophy weight="duotone" className="mx-auto w-10 h-10 text-zinc-600 mb-3" />
                  <p className="text-zinc-400">No contests for this brand yet</p>
                  <Button
                    className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
                    onClick={() => navigate(`/brand-console/${brandId}/contests/new`)}
                  >
                    Create first contest
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {contests.slice(0, 8).map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/brand-console/${brandId}/contests/${c.id}`)
                        }
                        className="w-full flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-left hover:border-zinc-600 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">{c.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {c.visibility} · {c.status}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusTone[c.status] || 'bg-zinc-700 text-zinc-300'
                            }`}
                        >
                          {c.status}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="grid sm:grid-cols-3 gap-3">
              <QuickLink
                to={`/brand-console/${brandId}/contests`}
                title="Manage contests"
                desc="List, edit status, open details"
                icon={Trophy}
              />
              <QuickLink
                to={`/brand-console/${brandId}/contests/new`}
                title="Create contest"
                desc="Draft a new opportunity for this brand"
                icon={Plus}
              />
              <QuickLink
                to={`/brand/${brandId}`}
                title="Brand profile"
                desc="Public brand page in Directory"
                icon={Buildings}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function QuickLink({ to, title, desc, icon: Icon }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-fuchsia-500/30 transition-colors"
    >
      <Icon weight="duotone" className="w-6 h-6 text-fuchsia-400 mb-2" />
      <p className="font-medium text-white">{title}</p>
      <p className="text-xs text-zinc-500 mt-1">{desc}</p>
    </Link>
  );
}
