import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Circle, CircleDashed, Loader2, CheckCircle2 } from 'lucide-react';

interface StatusSelectorProps {
  value: 'draft' | 'active' | 'in_progress' | 'completed';
  onChange: (value: 'draft' | 'active' | 'in_progress' | 'completed') => void;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({ value, onChange }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <CircleDashed className="h-4 w-4" />;
      case 'active': return <Circle className="h-4 w-4" />;
      case 'in_progress': return <Loader2 className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        {getStatusIcon(value)}
        Status
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <span className="flex items-center gap-2">
              {getStatusIcon(value)}
              {getStatusLabel(value)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">
            <span className="flex items-center gap-2">
              <CircleDashed className="h-4 w-4" />
              Draft
            </span>
          </SelectItem>
          <SelectItem value="active">
            <span className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              Active
            </span>
          </SelectItem>
          <SelectItem value="in_progress">
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4" />
              In Progress
            </span>
          </SelectItem>
          <SelectItem value="completed">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};