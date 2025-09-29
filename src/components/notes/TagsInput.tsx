import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagsInput: React.FC<TagsInputProps> = ({ 
  tags, 
  onChange, 
  placeholder = "Add tags...",
  maxTags 
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (maxTags && tags.length >= maxTags) return;
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputValue && addTag(inputValue)}
        placeholder={placeholder}
        disabled={maxTags ? tags.length >= maxTags : false}
      />
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags} tags
        </p>
      )}
    </div>
  );
};