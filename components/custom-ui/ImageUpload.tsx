import { CldUploadWidget } from 'next-cloudinary';
import { Plus, Trash } from 'lucide-react';

import { Button } from '../ui/button';
import Image from 'next/image';
import React from 'react';
import { FaT, FaTrash } from 'react-icons/fa6';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  onRemove,
  value,
}) => {
  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };
  console.log('Value', value, onUpload);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative size-[200px]">
            <div className="absolute right-0 top-0 z-10">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                size="sm"
                className="bg-red-1 text-white"
              >
                <FaTrash className="size-4" />
              </Button>
            </div>
            <Image
              src={url}
              alt="collections"
              className="rounded-lg object-cover"
              fill
              sizes="100%"
            />
          </div>
        ))}
      </div>

      <CldUploadWidget
        uploadPreset="ucxtkf5j"
        options={{ multiple: true }}
        onSuccess={onUpload}
      >
        {({ open }) => (
          <Button
            type="button"
            onClick={() => open()}
            className="bg-gray-1 text-white"
          >
            <Plus className="mr-2 size-4" />
            Upload Image
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
