import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileText, Edit, Trash2, Sparkles, BookOpen, Users, Briefcase, Pin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Note {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
  project_id: string | null;
  client_id: string | null;
  user_id: string;
  private: boolean;
  pinned: boolean;
}

interface NoteTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  content: string;
}

const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'simple',
    title: 'Simple Note',
    description: 'Basic note template for quick thoughts and casual notes',
    icon: FileText,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    content: '<h1>Quick thoughts</h1><p><br></p><p>Start writing your note here...</p>'
  },
  {
    id: 'structured',
    title: 'Structured Note',
    description: 'Organized note with predefined sections for better clarity',
    icon: Users,
    color: 'bg-green-50 border-green-200 text-green-700',
    content: `<h1><strong>Title / Subject</strong></h1><p><br></p><h2><strong>Main Points / Key Ideas</strong></h2><ul><li>Key point 1</li><li>Key point 2</li><li>Key point 3</li></ul><p><br></p><h2><strong>Checklist</strong></h2><ul><li>Task item 1</li><li>Task item 2</li><li>Task item 3</li></ul><p><br></p><h2><strong>Notes / Description</strong></h2><p>Additional details and information go here...</p>`
  },
  {
    id: 'advanced',
    title: 'Advanced Note',
    description: 'Comprehensive note template with full documentation framework',
    icon: Briefcase,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    content: `<h1><strong>Title / Subject</strong></h1><p><br></p><h2><strong>Summary / Overview</strong></h2><blockquote>Brief overview of what this note covers...</blockquote><p><br></p><h2><strong>Detailed Description</strong></h2><p>Write your detailed content here. Include all necessary information, context, and explanations.</p><p><br></p><h2><strong>Checklists / Tasks / Action Items</strong></h2><table><thead><tr><th><strong>Task</strong></th><th><strong>Status</strong></th><th><strong>Due Date</strong></th><th><strong>Assigned To</strong></th></tr></thead><tbody><tr><td>Task 1</td><td>Pending</td><td></td><td></td></tr><tr><td>Task 2</td><td>Pending</td><td></td><td></td></tr><tr><td>Task 3</td><td>Pending</td><td></td><td></td></tr></tbody></table><p><br></p><h2><strong>References / Links</strong></h2><ul><li><a href="#" rel="noopener noreferrer" target="_blank">Reference link 1</a></li><li><a href="#" rel="noopener noreferrer" target="_blank">Reference link 2</a></li></ul><p><br></p><h2><strong>Attachments</strong></h2><p>List any related documents, files, or resources here...</p><p><br></p><h2><strong>Tags / Categories</strong></h2><p><code>#tag1</code> <code>#tag2</code> <code>#tag3</code></p><p><br></p><p><em>Created on ${new Date().toLocaleDateString()}</em></p>`
  }
];

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user && !loading, // Only run when user is loaded and authenticated
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user) {
        throw new Error("Please sign in to delete notes");
      }
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: "Note deleted",
        description: "The note has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ noteId, pinned }: { noteId: string; pinned: boolean }) => {
      if (!user) {
        throw new Error("Please sign in to pin notes");
      }
      
      const { error } = await supabase
        .from('notes')
        .update({ pinned: !pinned })
        .eq('id', noteId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredNotes = notes.filter(note => {
    const titleMatch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const contentMatch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  const handleDelete = (noteId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to delete notes.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteMutation.mutate(noteId);
    }
  };

  const handleTogglePin = (noteId: string, pinned: boolean) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to pin notes.",
        variant: "destructive",
      });
      return;
    }
    
    togglePinMutation.mutate({ noteId, pinned });
  };

  const getPreview = (content: string) => {
    // Strip HTML tags for preview
    const strippedContent = content.replace(/<[^>]*>/g, '');
    return strippedContent.length > 150 ? strippedContent.substring(0, 150) + '...' : strippedContent;
  };

  const createFromTemplate = (template: NoteTemplate) => {
    navigate('/notes/new', { state: { 
      templateContent: template.content, 
      templateTitle: template.title,
      templateId: template.id 
    } });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="container mx-auto max-w-7xl">
            <p className="text-blue-800 text-center">
              <strong>Preview Mode:</strong> You're viewing a demo. <a href="/auth" className="underline hover:no-underline">Sign in</a> to create and manage your own notes.
            </p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-complie-primary mb-2 flex items-center gap-3">
                <FileText className="h-10 w-10 text-complie-accent" />
                Notes
              </h1>
              <p className="text-lg text-muted-foreground">
                Capture ideas, meeting notes, and important information with rich formatting
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="border-2 hover:border-complie-accent">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Use Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-complie-accent" />
                      Choose a Note Template
                    </DialogTitle>
                    <DialogDescription>
                      Select a template based on the level of structure you need for your note.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {NOTE_TEMPLATES.map((template) => {
                      const IconComponent = template.icon;
                      return (
                        <Card 
                          key={template.id}
                          className={`group cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${template.color} hover:scale-105`}
                          onClick={() => {
                            createFromTemplate(template);
                            setIsTemplateDialogOpen(false);
                          }}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white shadow-sm">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-bold">{template.title}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="lg" className="btn-complie-primary" onClick={() => navigate('/notes/new')}>
                <Plus className="h-5 w-5 mr-2" />
                New Note
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-base border-2 focus:border-complie-accent transition-colors"
            />
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-complie-accent" />
            <h2 className="text-2xl font-bold text-complie-primary">Choose Your Note Type</h2>
            <span className="text-sm text-muted-foreground ml-2">Simple • Structured • Advanced</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NOTE_TEMPLATES.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card 
                  key={template.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${template.color} hover:scale-105`}
                  onClick={() => createFromTemplate(template)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-white shadow-sm">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg font-bold">{template.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-complie-primary">Click to start</span>
                      <Plus className="h-4 w-4 text-complie-accent group-hover:scale-110 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Notes Content */}
        {filteredNotes.length === 0 ? (
          <Card className="card-complie border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-complie-primary">No notes yet</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
                Start capturing your thoughts and important information with rich text formatting. 
                Use templates to get started quickly or create from scratch.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTemplateDialogOpen(true)}
                  className="border-2 hover:border-complie-accent"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button className="btn-complie-primary" onClick={() => navigate('/notes/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Write Your First Note
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className="card-complie group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-complie-accent/30"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center gap-2">
                      {note.pinned && (
                        <Pin className="h-4 w-4 text-complie-accent fill-complie-accent" />
                      )}
                      <CardDescription className="text-sm font-medium text-complie-primary">
                        {format(new Date(note.updated_at), 'MMM d, yyyy at h:mm a')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePin(note.id, note.pinned)}
                        className={`hover:bg-complie-accent hover:text-white ${note.pinned ? 'opacity-100' : ''}`}
                        title={note.pinned ? "Unpin note" : "Pin note"}
                      >
                        <Pin className={`h-4 w-4 ${note.pinned ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/notes/${note.id}/edit`)}
                        className="hover:bg-complie-accent hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(note.id)}
                        className="hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {note.title && (
                    <h3 className="text-lg font-semibold text-complie-primary mb-2 line-clamp-2">
                      {note.title}
                    </h3>
                  )}
                  <div className="text-sm text-foreground leading-relaxed">
                    {getPreview(note.content)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;