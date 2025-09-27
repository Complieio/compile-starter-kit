import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NoteEditor: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-complie-primary">New Note (Placeholder)</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Placeholder editor created to restore the /notes/new route. Lovable can later replace with the full rich editor.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/notes')}>Back to Notes</Button>
      </div>
    </div>
  );
};

export default NoteEditor;
