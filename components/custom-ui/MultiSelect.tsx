'use client';

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
interface MultiSelectProps {
  placeholder: string;
  categories: string[];
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

export default function MultiSelect({
  placeholder,
  categories,
  value,
  onChange,
  onRemove,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  let selected: any;
  if (value.length === 0) {
    selected = [];
  } else {
    selected = value.map((id) =>
      categories.find((collection: any) => collection._id === id)
    );
  }

  const selectable = categories.filter(
    (collection) => !selected.includes(collection)
  );

  return (
    <Command className="overflow-visible bg-white">
      <div className="flex flex-wrap gap-1 rounded-md border border-gray-1/25">
        {selected.map((collection: any) => (
          <Badge key={collection?._id}>
            {collection?.name}
            <button
              type="button"
              className="ml-1 rounded-full transition-colors duration-200 hover:bg-red-1"
              onClick={() => onRemove(collection?._id)}
            >
              <X className="size-3 text-red-1 transition-colors duration-300 hover:text-white" />
            </button>
          </Badge>
        ))}

        <CommandInput
          placeholder={placeholder}
          value={inputValue}
          onValueChange={setInputValue}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
        />
      </div>

      <div className="relative mt-2">
        {open && (
          <CommandGroup className="absolute top-0 z-30 w-full overflow-auto rounded-md border border-gray-1/25 bg-white shadow-md">
            {selectable.map((collection: any) => (
              <CommandItem
                key={collection._id}
                onMouseDown={(e) => e.preventDefault()}
                onSelect={() => {
                  onChange(collection._id);
                  setInputValue('');
                }}
                className="cursor-pointer hover:bg-gray-2"
              >
                {collection.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </div>
    </Command>
  );
}
