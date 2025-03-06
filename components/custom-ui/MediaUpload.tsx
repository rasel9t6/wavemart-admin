'use client';

import { FC, useState } from 'react';
import { CiImageOn } from 'react-icons/ci';
import Image from 'next/image';
import { FaTrashAlt } from 'react-icons/fa';
import { IoVideocamOutline } from 'react-icons/io5';
import MediaGallery from './MediaGallery';

interface MediaUploadProps {
  value: { url: string; type: string }[];
  onChange: (url: string, type: 'image' | 'video') => void;
  onRemove: (url: string) => void;
  folderId?: string;
}

const MediaUpload: FC<MediaUploadProps> = ({
  value = [],
  onChange,
  onRemove,
  folderId = 'uploads',
}) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  console.log(value);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((item) => (
          <div
            key={item.url}
            className="group relative size-[200px] overflow-hidden rounded-md"
          >
            {item.type === 'image' ? (
              <Image
                fill
                className="object-cover"
                alt="Upload"
                src={item.url}
              />
            ) : (
              <div className="relative size-full">
                <video
                  className="size-full object-cover"
                  src={item.url}
                  muted
                  loop
                  controls={false}
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-black/70 p-1">
                  <IoVideocamOutline className="text-white" size={16} />
                </div>
              </div>
            )}
            <div
              onClick={() => onRemove(item.url)}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
            >
              <FaTrashAlt className="text-white" size={20} />
            </div>
          </div>
        ))}
        <div
          onClick={() => setGalleryOpen(true)}
          className="flex size-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-200/20 bg-white p-2 text-gray-800 transition hover:border-gray-800"
        >
          <CiImageOn size={40} />
          <p className="text-center text-sm font-medium">Upload media</p>
          <p className="text-center text-xs text-gray-500">Images & Videos</p>
        </div>
      </div>

      <MediaGallery
        visible={galleryOpen}
        folderId={folderId}
        onClose={() => setGalleryOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
};

export default MediaUpload;
