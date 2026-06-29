import React, { useState } from 'react';
import {
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  MagnifyingGlass,
  Trash,
  Download,
  PencilSimple
} from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

// RTK Query Imports (adjust paths as needed)
import {
  useGetAllMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaMutation,
} from '../../services/api/mediaApi';

const MediaPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // RTK Queries & Mutations
  const { data: mediaData = [], isLoading, error } = useGetAllMediaQuery();
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [updateMedia] = useUpdateMediaMutation();

  const mediaItems = mediaData?.data || mediaData || [];

  // Filter media
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'images') return matchesSearch && item.type?.startsWith('image');
    if (activeTab === 'videos') return matchesSearch && item.type?.startsWith('video');
    if (activeTab === 'documents') return matchesSearch && !item.type?.startsWith('image') && !item.type?.startsWith('video');
    return matchesSearch;
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await uploadMedia(formData).unwrap();
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setIsUploadModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media file?')) return;
    try {
      await deleteMedia(id).unwrap();
      setSelectedMedia(null);
    } catch (err) {
      alert('Failed to delete media');
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image')) return <ImageIcon className="w-5 h-5" />;
    if (type?.startsWith('video')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        title="Media Library"
        subtitle="Upload and manage your images, videos, and documents"
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800"
            />
          </div>

          <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Upload Media
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 grid w-full grid-cols-4">
            <TabsTrigger value="all">All Media</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center py-10">Error loading media</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredMedia.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-zinc-900 border-zinc-800 overflow-hidden cursor-pointer hover:border-zinc-700 transition-all group"
                    onClick={() => setSelectedMedia(item)}
                  >
                    <div className="aspect-square bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                      {item.type?.startsWith('image') ? (
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl text-zinc-700">
                          {getFileIcon(item.type)}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{item.title || item.filename}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {(item.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredMedia.length === 0 && !isLoading && (
              <div className="text-center py-20 text-zinc-500">
                No media found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="cursor-pointer text-center">
              <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <p className="font-medium">Click to upload files</p>
              <p className="text-sm text-zinc-500 mt-1">PNG, JPG, MP4, PDF, etc.</p>
            </label>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Detail Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {getFileIcon(selectedMedia.type)}
                  {selectedMedia.title || selectedMedia.filename}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Preview */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-center min-h-[300px]">
                  {selectedMedia.type?.startsWith('image') ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.filename}
                      className="max-h-[400px] object-contain rounded-lg"
                    />
                  ) : selectedMedia.type?.startsWith('video') ? (
                    <video controls className="max-h-[400px] rounded-lg">
                      <source src={selectedMedia.url} type={selectedMedia.type} />
                    </video>
                  ) : (
                    <div className="text-8xl text-zinc-700">
                      {getFileIcon(selectedMedia.type)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">File Name</p>
                    <p>{selectedMedia.filename}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Type</p>
                    <p>{selectedMedia.type}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Size</p>
                    <p>{(selectedMedia.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Uploaded</p>
                    <p>{new Date(selectedMedia.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <DialogFooter className="flex-col sm:flex-row gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedMedia.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash className="mr-2 w-4 h-4" />
                    Delete
                  </Button>

                  <Button variant="outline" asChild>
                    <a href={selectedMedia.url} download target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 w-4 h-4" />
                      Download
                    </a>
                  </Button>

                  <Button onClick={() => alert('Edit metadata coming soon...')}>
                    <PencilSimple className="mr-2 w-4 h-4" />
                    Edit Info
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaPage;