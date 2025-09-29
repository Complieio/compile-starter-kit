-- Add pinned column to notes table
ALTER TABLE public.notes
ADD COLUMN pinned boolean DEFAULT false;

-- Create index for better query performance on pinned notes
CREATE INDEX idx_notes_pinned ON public.notes(user_id, pinned, updated_at DESC);