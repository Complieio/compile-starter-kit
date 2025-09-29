-- Add new fields to notes table for enhanced template system
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'in_progress', 'completed')),
ADD COLUMN IF NOT EXISTS checklists JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS related_note_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add note_id to documents table to link attachments to notes
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_priority ON public.notes(priority);
CREATE INDEX IF NOT EXISTS idx_notes_status ON public.notes(status);
CREATE INDEX IF NOT EXISTS idx_documents_note_id ON public.documents(note_id);

-- Add RLS policy for documents linked to notes
CREATE POLICY "Users can view documents linked to their notes"
ON public.documents
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (note_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.notes 
    WHERE notes.id = documents.note_id 
    AND notes.user_id = auth.uid()
  ))
);