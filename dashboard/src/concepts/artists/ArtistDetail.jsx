'use client';

import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserByIdQuery } from '@/services/api/userApi';
import { useGetContestEntriesQuery } from '@/services/api/contestsApi';

import { Header } from '../../components/layout/Header';
import { Badge } from '../../components/ui/badge';
import { Clock, Trophy, Palette } from '@phosphor-icons/react';

export const ArtistDetails = () => {
  const { id } = useParams();

  // 👤 Artist profile
  const { data: user, isLoading } = useGetUserByIdQuery(id);

  // 🏆 Contest entries (submitted works)
  const { data: entriesData } = useGetContestEntriesQuery({
    userId: id,
  });

  const artist = user?.user || user;
  const entries = entriesData?.entries || [];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-10 text-center text-zinc-400">
        Artist not found
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title={`@${artist.username}`}
        subtitle="Artist profile overview"
      />

      <div className="p-6 space-y-8">

        {/* ================= PROFILE ================= */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex gap-6">

          {/* Avatar */}
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold">
            {artist.username?.slice(0, 2).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-semibold text-white">
              @{artist.username}
            </h2>

            <p className="text-zinc-400">{artist.email}</p>

            <div className="flex gap-2 mt-2">
              <Badge>{artist.status}</Badge>

              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="w-4 h-4" />
                Joined {new Date(artist.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* ================= ARTWORKS ================= */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Artworks
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {(artist.artworks || []).map((art) => (
              <div key={art.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <img
                  src={art.thumbnail_url}
                  className="w-full h-40 object-cover rounded"
                />
                <p className="text-sm mt-2">{art.title}</p>
              </div>
            ))}
          </div>

          {(!artist.artworks || artist.artworks.length === 0) && (
            <p className="text-zinc-500 text-sm">No artworks found</p>
          )}
        </div>

        {/* ================= CONTEST ENTRIES ================= */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Contest Entries
          </h3>

          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex justify-between"
              >
                <div>
                  <p className="font-medium text-white">
                    {entry.artwork?.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Contest: {entry.contest?.title}
                  </p>
                </div>

                <Badge>{entry.status}</Badge>
              </div>
            ))}
          </div>

          {entries.length === 0 && (
            <p className="text-zinc-500 text-sm">
              No contest submissions
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ArtistDetails;