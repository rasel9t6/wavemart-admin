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
import { CollectionType } from '@/lib/types';

interface MultiSelectProps {
  placeholder: string;
  collections: CollectionType[];
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

export default function MultiSelect({
  placeholder,
  collections,
  value,
  onChange,
  onRemove,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  let selected: CollectionType[];

  if (value.length === 0) {
    selected = [];
  } else {
    selected = value.map((id) =>
      collections.find((collection) => collection._id === id)
    ) as CollectionType[];
  }

  const selectable = collections.filter(
    (collection) => !selected.includes(collection)
  );

  return (
    <Command className="overflow-visible bg-white">
      <div className="flex flex-wrap gap-1 rounded-md border border-gray-1/25">
        {selected.map((collection) => (
          <Badge key={collection._id}>
            {collection.title}
            <button
              type="button"
              className="ml-1 hover:text-red-1"
              onClick={() => onRemove(collection._id)}
            >
              <X className="size-3" />
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
          <CommandGroup className="absolute top-0 z-30 w-full overflow-auto rounded-md border border-gray-1/25 shadow-md">
            {selectable.map((collection) => (
              <CommandItem
                key={collection._id}
                onMouseDown={(e) => e.preventDefault()}
                onSelect={() => {
                  onChange(collection._id);
                  setInputValue('');
                }}
                className="cursor-pointer hover:bg-gray-2"
              >
                {collection.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </div>
    </Command>
  );
}
