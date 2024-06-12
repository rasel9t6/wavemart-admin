import { CldUploadWidget } from 'next-cloudinary';
import { Plus, Trash } from 'lucide-react';

import { Button } from '../ui/button';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}
export default function ImageUpload({
  value,
  onChange,
  onRemove,
}: ImageUploadProps) {
  function onUpload(result: any) {
    onChange(result.info.secure_url);
  }
  return (
    <div>
      <div className="mb-4 flex-wrap items-center gap-4">
        {value.map((url) => (
          <div className="relative h-[200px] w-[200px]">
            <div className="absolute right-0 top-0 z-10">
              <Button
                onClick={() => onRemove(url)}
                size="sm"
                className="bg-red-1 text-white"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              src={url}
              alt="image collections"
              className="rounded-lg object-cover"
              fill
              sizes="100%"
            />
          </div>
        ))}
      </div>
      <CldUploadWidget uploadPreset="ucxtkf5j" onSuccess={onUpload}>
        {({ open }) => {
          return (
            <Button className="bg-gray-1 text-white" onClick={() => open()}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
