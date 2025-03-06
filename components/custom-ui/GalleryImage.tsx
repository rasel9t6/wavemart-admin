'use client';

import { FC, ReactNode } from 'react';
import Image from 'next/image';
import { FaCheck, FaTrash } from 'react-icons/fa';

interface GalleryItemProps {
  item: {
    url: string;
    type: 'image' | 'video';
  };
  onSelectClick: () => void;
  onDeleteClick: () => void;
  children?: ReactNode;
}

const GalleryItem: FC<GalleryItemProps> = ({
  item,
  onSelectClick,
  onDeleteClick,
  children,
}) => {
  return (
    <div className="group relative aspect-square overflow-hidden rounded border border-gray-300">
      {/* Media Content */}
      {children ||
        (item.type === 'image' ? (
          <Image
            src={item.url}
            alt="Gallery item"
            height={400}
            width={400}
            className="size-full object-cover"
          />
        ) : (
          <video
            src={item.url}
            className="size-full object-cover"
            controls={false}
            muted
            loop
            poster={`${item.url.split('.').slice(0, -1).join('.')}.jpg`}
          />
        ))}

      {/* Hover Controls */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onSelectClick}
          className="rounded-full bg-white p-2 text-green-600 hover:bg-green-600 hover:text-white"
        >
          <FaCheck size={16} />
        </button>
        <button
          onClick={onDeleteClick}
          className="rounded-full bg-white p-2 text-red-600 hover:bg-red-600 hover:text-white"
        >
          <FaTrash size={16} />
        </button>
      </div>
    </div>
  );
};

export default GalleryItem;
