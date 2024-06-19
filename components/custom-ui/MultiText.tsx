'use client';
import { useState } from 'react';
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
    onChange(item);
    setInputValue('');
  };
  console.log(value);
  return (
    <>
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addValue(inputValue);
          }
        }}
      />

      <div className="mt-4 flex flex-wrap gap-1">
        {value.map((item, index) => (
          <Badge key={index} className="bg-gray-1 text-white">
            {item}
            <button
              className="ml-1 rounded-full outline-none hover:bg-red-1"
              onClick={() => onRemove(item)}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </>
  );
}
