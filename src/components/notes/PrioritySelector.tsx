import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Flag } from 'lucide-react';

interface PrioritySelectorProps {
  value: 'low' | 'medium' | 'high';
  onChange: (value: 'low' | 'medium' | 'high') => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Flag className="h-4 w-4" />
        Priority
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <span className={`flex items-center gap-2 ${getPriorityColor(value)}`}>
              <Flag className="h-4 w-4" />
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">
            <span className="flex items-center gap-2 text-green-600">
              <Flag className="h-4 w-4" />
              Low
            </span>
          </SelectItem>
          <SelectItem value="medium">
            <span className="flex items-center gap-2 text-yellow-600">
              <Flag className="h-4 w-4" />
              Medium
            </span>
          </SelectItem>
          <SelectItem value="high">
            <span className="flex items-center gap-2 text-red-600">
              <Flag className="h-4 w-4" />
              High
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};