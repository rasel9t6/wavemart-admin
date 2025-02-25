import { CldUploadWidget } from 'next-cloudinary';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';
import React from 'react';
import { FaTrash } from 'react-icons/fa6';

interface ImageUploadProps {
  value: string[];
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  onRemove,
}) => {
  // Handle Cloudinary Upload Success
  const onUpload = (result: any) => {
    const uploadedUrl = result.info.secure_url;
    onChange(uploadedUrl); // Pass the new URL to onChange
  };

  // Remove Image
  const handleRemove = (url: string) => {
    onRemove(url);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Image Previews */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {value.map((url) => (
            <div key={url} className="relative size-40 rounded-lg shadow-md">
              <button
                onClick={() => handleRemove(url)}
                className="absolute right-1 top-1 z-10 rounded bg-red-500 p-1 text-white hover:bg-red-600"
                aria-label="Remove image"
              >
                <FaTrash className="size-5" />
              </button>

              <Image
                src={url}
                alt="Uploaded Image"
                className="size-full rounded-lg object-cover"
                fill
                sizes="100%"
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <CldUploadWidget
        uploadPreset="ucxtkf5j"
        options={{ multiple: true }}
        onSuccess={onUpload}
      >
        {({ open }) => (
          <Button
            type="button"
            onClick={() => open()}
            className="flex items-center justify-center rounded-lg bg-gray-600 px-6 py-2 text-white transition hover:bg-gray-700"
          >
            <Plus className="mr-2 size-5" />
            Upload Images
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
