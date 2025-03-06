'use client';

import { type FC, useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FileUploader } from 'react-drag-drop-files';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { useMediaStore } from '@/hooks/useMediaStore';
import GalleryItem from './GalleryImage';

interface MediaGalleryProps {
  visible: boolean;
  folderId: string;
  onClose: () => void;
  onSelect?: (url: string, type: 'image' | 'video') => void;
}

const MediaGallery: FC<MediaGalleryProps> = ({
  visible,
  folderId,
  onSelect,
  onClose,
}) => {
  const { media, loading, uploadMedia, removeItem } = useMediaStore();
  const [localMedia, setLocalMedia] = useState(media);

  // Sync local state with global media store
  useEffect(() => {
    setLocalMedia(media);
  }, [media]);

  if (!visible) return null;

  const handleSelection = (item: { url: string; type: 'image' | 'video' }) => {
    console.log('Item URL', item.url);
    if (onSelect) onSelect(item.url, item.type);
    onClose();
  };

  const handleUpload = async (files: File[]) => {
    console.log('Files received:', files);
    console.log('Type of files:', Object.prototype.toString.call(files));

    try {
      await uploadMedia(files, folderId);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async (url: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await removeItem(url);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const fileTypes = ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov'];

  return (
    <div
      onKeyDown={({ key }) => {
        if (key === 'Escape') onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="relative size-4/5 max-w-[760px] overflow-y-auto rounded-md bg-white p-4">
        {/* Close Button */}
        <button
          className="absolute right-4 top-4 z-10 p-3 text-red-500"
          onClick={onClose}
        >
          <IoMdClose size={24} />
        </button>

        {/* Upload Section */}
        <FileUploader
          multiple
          handleChange={handleUpload}
          name="file"
          types={fileTypes}
        >
          <div className="flex w-full items-center justify-center">
            <label className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <IoCloudUploadOutline size={30} className="text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  Supported: Images (PNG, JPG, JPEG, WEBP) and Videos (MP4, MOV)
                </p>
              </div>
            </label>
          </div>
        </FileUploader>

        {/* No Media Message */}
        {!localMedia.length && !loading && (
          <p className="p-4 text-center text-2xl font-semibold opacity-45">
            No Media Available
          </p>
        )}

        {/* Media Grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {loading && (
            <div className="aspect-square w-full animate-pulse rounded bg-gray-200"></div>
          )}

          {localMedia.map((item) => (
            <GalleryItem
              key={item.url}
              item={item}
              onSelectClick={() => handleSelection(item)}
              onDeleteClick={() => handleDelete(item.url)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaGallery;
