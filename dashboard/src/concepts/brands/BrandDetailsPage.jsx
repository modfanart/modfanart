import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Users, Image, Trophy, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { useGetBrandQuery, useGetBrandArtworksQuery, useGetBrandManagersQuery } from '../../services/api/brandApi';
import { useGetContestsQuery } from '../../services/api/contestsApi';

export const BrandDetailsPage = () => {
  const { id } = useParams();

  /* ================= BRAND ================= */
  const { data: brandRes, isLoading: brandLoading } = useGetBrandQuery(id);
  const brand = brandRes;

  /* ================= ARTWORKS ================= */
  const { data: artworksRes, isLoading: artworksLoading } =
    useGetBrandArtworksQuery(id);

  const artworks = artworksRes || [];

  /* ================= MANAGERS ================= */
  const { data: managersRes, isLoading: managersLoading } =
    useGetBrandManagersQuery(id);

  const managers = managersRes || [];

  /* ================= CONTESTS ================= */
  const { data: contestsRes, isLoading: contestsLoading } =
    useGetContestsQuery({ brand_id: id });

  const contests = contestsRes?.contests || [];

  /* ================= LOADING ================= */
  if (brandLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center text-zinc-400 mt-20">
        Brand not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      <Header
        title={brand.name}
        subtitle={`@${brand.slug}`}
      />

      <div className="max-w-6xl mx-auto p-6 space-y-10">

        {/* ================= BRAND INFO ================= */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
              {brand.logo_url ? (
                <img src={brand.logo_url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold">
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold">{brand.name}</h2>
              <p className="text-sm text-zinc-400">{brand.description}</p>

              <div className="flex gap-2 mt-2">
                <Badge>{brand.status}</Badge>
                {brand.verification_request_id && (
                  <Badge className="bg-blue-600">Verified</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right text-sm text-zinc-400">
            <p>Followers: {brand.followers_count || 0}</p>
            <p>Views: {brand.views_count || 0}</p>
          </div>

        </section>

        {/* ================= CONTESTS ================= */}
        <section>
          <div className="flex items-center gap-2 text-zinc-400 mb-3">
            <Trophy size={18} />
            <h2 className="uppercase text-sm">Contests</h2>
          </div>

          {contestsLoading ? (
            <p className="text-zinc-500">Loading contests...</p>
          ) : contests.length === 0 ? (
            <p className="text-zinc-500">No contests found</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {contests.map((c) => (
                <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-sm text-zinc-400">{c.description}</p>

                  <div className="flex gap-2 mt-2">
                    <Badge>{c.status}</Badge>
                    <Badge variant="outline">{c.visibility}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= ARTWORKS ================= */}
        <section>
          <div className="flex items-center gap-2 text-zinc-400 mb-3">
            <Image size={18} />
            <h2 className="uppercase text-sm">Licensed Artworks</h2>
          </div>

          {artworksLoading ? (
            <p className="text-zinc-500">Loading artworks...</p>
          ) : artworks.length === 0 ? (
            <p className="text-zinc-500">No artworks licensed</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {artworks.map((a) => (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <div className="h-40 bg-zinc-800 rounded-lg mb-3 overflow-hidden">
                    {a.image_url && (
                      <img src={a.image_url} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-zinc-500">{a.creator_name}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= MANAGERS ================= */}
        <section>
          <div className="flex items-center gap-2 text-zinc-400 mb-3">
            <Users size={18} />
            <h2 className="uppercase text-sm">Brand Team</h2>
          </div>

          {managersLoading ? (
            <p className="text-zinc-500">Loading team...</p>
          ) : managers.length === 0 ? (
            <p className="text-zinc-500">No team members assigned</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {managers.map((m) => (
                <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">

                  <div>
                    <p className="font-medium">{m.user?.username}</p>
                    <p className="text-sm text-zinc-500">{m.role}</p>
                  </div>

                  <ShieldCheck className="text-green-400" size={20} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= QUICK STATS ================= */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 grid grid-cols-3 text-center">
          <div>
            <p className="text-2xl font-bold">{artworks.length}</p>
            <p className="text-zinc-500 text-sm">Artworks</p>
          </div>

          <div>
            <p className="text-2xl font-bold">{contests.length}</p>
            <p className="text-zinc-500 text-sm">Contests</p>
          </div>

          <div>
            <p className="text-2xl font-bold">{managers.length}</p>
            <p className="text-zinc-500 text-sm">Team Members</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BrandDetailsPage;