import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, FileText, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

interface ProjectNotesProps {
  projectId: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  user_id: string;
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', projectId],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!projectId,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          content: content.trim(),
          project_id: projectId,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      toast({
        title: "Note created",
        description: "Your note has been saved successfully.",
      });
      setShowNewNoteDialog(false);
      setNewNoteContent('');
    },
    onError: (error: any) => {
      toast({
        title: "Error creating note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
      setEditingNote(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter some content for your note.",
        variant: "destructive",
      });
      return;
    }
    createNoteMutation.mutate(newNoteContent);
  };

  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter some content for your note.",
        variant: "destructive",
      });
      return;
    }
    updateNoteMutation.mutate({
      noteId: editingNote.id,
      content: editingNote.content,
    });
  };

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="card-complie">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-complie">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Keep project notes and important information</CardDescription>
            </div>
            <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
              <DialogTrigger asChild>
                <Button className="btn-complie-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                  <DialogDescription>
                    Add a note to capture important project information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Write your note here..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewNoteDialog(false)}
                      disabled={createNoteMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateNote}
                      disabled={createNoteMutation.isPending}
                      className="btn-complie-primary flex-1"
                    >
                      {createNoteMutation.isPending ? "Saving..." : "Save Note"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          {notes.length > 0 && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Notes List */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {notes.length === 0 ? "No notes yet" : "No matching notes found"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {notes.length === 0 
                  ? "Start by creating your first note for this project"
                  : "Try adjusting your search terms"
                }
              </p>
              {notes.length === 0 && (
                <Button onClick={() => setShowNewNoteDialog(true)} className="btn-complie-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Note
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm whitespace-pre-wrap break-words mb-3">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Created {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                        </div>
                        {note.updated_at !== note.created_at && (
                          <span>Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingNote(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this note?')) {
                            deleteNoteMutation.mutate(note.id);
                          }
                        }}
                        disabled={deleteNoteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Make changes to your note
            </DialogDescription>
          </DialogHeader>
          {editingNote && (
            <div className="space-y-4">
              <Textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                rows={6}
                className="resize-none"
              />
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingNote(null)}
                  disabled={updateNoteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateNote}
                  disabled={updateNoteMutation.isPending}
                  className="btn-complie-primary flex-1"
                >
                  {updateNoteMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}