'use client';
import { useState, KeyboardEvent } from 'react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

interface MultiTextProps {
  placeholder: string;
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

export default function MultiText({
  placeholder,
  value,
  onChange,
  onRemove,
}: MultiTextProps) {
  const [inputValue, setInputValue] = useState('');

  const addValue = (item: string) => {
    // Trim the input and convert to lowercase/uppercase as needed
    const processedItem = item.trim();

    // Prevent adding empty or duplicate values
    if (processedItem && !value.includes(processedItem)) {
      onChange(processedItem);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue(inputValue);
    }

    // Optional: Allow adding with comma
    if (e.key === ',') {
      e.preventDefault();
      addValue(inputValue.replace(',', ''));
    }
  };

  return (
    <div>
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {value.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge
              key={`${item}-${index}`}
              variant="secondary"
              className="flex items-center"
            >
              {item}
              <button
                className="ml-2 hover:text-red-1"
                onClick={() => onRemove(item)}
                type="button"
                aria-label={`Remove ${item}`}
              >
                <X className="size-4" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
