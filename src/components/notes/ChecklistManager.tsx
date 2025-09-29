import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistManagerProps {
  checklists: ChecklistItem[];
  onChange: (checklists: ChecklistItem[]) => void;
  title?: string;
}

export const ChecklistManager: React.FC<ChecklistManagerProps> = ({ 
  checklists, 
  onChange,
  title = "Checklist" 
}) => {
  const [newItemText, setNewItemText] = useState('');

  const addItem = () => {
    if (newItemText.trim()) {
      onChange([
        ...checklists,
        { id: crypto.randomUUID(), text: newItemText.trim(), completed: false }
      ]);
      setNewItemText('');
    }
  };

  const removeItem = (id: string) => {
    onChange(checklists.filter(item => item.id !== id));
  };

  const toggleItem = (id: string) => {
    onChange(
      checklists.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const updateItemText = (id: string, text: string) => {
    onChange(
      checklists.map(item =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  return (
    <Card className="p-4 space-y-3 bg-muted/30">
      <h4 className="font-semibold text-sm text-foreground">{title}</h4>
      
      {/* Checklist Items */}
      <div className="space-y-2">
        {checklists.map((item) => (
          <div key={item.id} className="flex items-start gap-2 group">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggleItem(item.id)}
              className="mt-2"
            />
            <Input
              value={item.text}
              onChange={(e) => updateItemText(item.id, e.target.value)}
              className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
              placeholder="Item description..."
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex gap-2">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          placeholder="Add new item..."
          className="flex-1"
        />
        <Button type="button" onClick={addItem} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </Card>
  );
};