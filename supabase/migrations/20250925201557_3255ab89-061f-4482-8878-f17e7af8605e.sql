-- Add private column with default true to all user content tables
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS private BOOLEAN DEFAULT true;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS private BOOLEAN DEFAULT true;  
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS private BOOLEAN DEFAULT true;
ALTER TABLE public.checklists ADD COLUMN IF NOT EXISTS private BOOLEAN DEFAULT true;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS private BOOLEAN DEFAULT true;