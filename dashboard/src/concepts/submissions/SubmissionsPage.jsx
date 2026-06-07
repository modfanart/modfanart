'use client';

import React, { useState } from 'react';
import { Image, Eye } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

import { useGetArtworksQuery } from '@/services/api/artworkApi';

// ────────────────────────────────────────────────
// Status Badge
// ────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const statusClasses = {
    draft: 'status-pending',
    published: 'status-completed',
    rejected: 'status-dispatched',
  };

  return (
    <span className={`badge ${statusClasses[status] || 'border-zinc-700 text-zinc-400'}`}>
      {status}
    </span>
  );
};

// ────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────
export const SubmissionsPage = () => {
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const { data, isLoading } = useGetArtworksQuery({
    page: 1,
    limit: 50,
  });

  const artworks = data?.artworks || [];

  return (
    <div className="min-h-screen" data-testid="submissions-page">
      <Header 
        title="Submissions" 
        subtitle={`${artworks.length} submissions`} 
      />

      <div className="p-4 sm:p-6 space-y-6">

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : artworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Image weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No submissions found</p>
              <p className="text-xs text-zinc-500 mt-2">
                Submissions are artworks uploaded by users
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Creator</th>
                    <th>Status</th>
                    <th>Categories</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {artworks.map((artwork) => (
                    <tr key={artwork.id}>
                      
                      <td className="text-white font-medium">
                        {artwork.title}
                      </td>

                      <td className="text-zinc-400">
                        {artwork.creator_name || '—'}
                      </td>

                      <td>
                        <StatusBadge status={artwork.status} />
                      </td>

                      <td>
                        {artwork.categories?.length || 0}
                      </td>

                      <td className="text-zinc-500 text-sm">
                        {new Date(artwork.created_at).toLocaleDateString()}
                      </td>

                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                          onClick={() => setSelectedArtwork(artwork)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>

      {/* Artwork Detail Modal */}
      <Dialog 
        open={!!selectedArtwork} 
        onOpenChange={(open) => !open && setSelectedArtwork(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedArtwork?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedArtwork && (
            <div className="space-y-4">

              {/* Preview */}
              {selectedArtwork.image_url && (
                <img
                  src={selectedArtwork.image_url}
                  alt={selectedArtwork.title}
                  className="w-full h-64 object-cover rounded-md"
                />
              )}

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Creator</p>
                  <p className="text-white">{selectedArtwork.creator_name}</p>
                </div>

                <div>
                  <p className="text-zinc-500">Status</p>
                  <p className="text-white">{selectedArtwork.status}</p>
                </div>

                <div>
                  <p className="text-zinc-500">Created</p>
                  <p className="text-white">
                    {new Date(selectedArtwork.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500">Categories</p>
                  <p className="text-white">
                    {selectedArtwork.categories?.map(c => c.name).join(', ') || '—'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedArtwork.description && (
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Description</p>
                  <p className="text-white text-sm">
                    {selectedArtwork.description}
                  </p>
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionsPage;