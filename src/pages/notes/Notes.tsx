import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileText, Edit, Trash2, Sparkles, BookOpen, Users, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  project_id: string | null;
  client_id: string | null;
  user_id: string;
  private: boolean;
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
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Structured template for capturing meeting discussions and action items',
    icon: Users,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    content: `<h2><strong>Meeting Notes</strong></h2><p><br></p><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><p><strong>Attendees:</strong> </p><p><strong>Meeting Purpose:</strong> </p><p><br></p><h3><strong>Agenda Items</strong></h3><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul><p><br></p><h3><strong>Key Discussion Points</strong></h3><p>• </p><p>• </p><p>• </p><p><br></p><h3><strong>Action Items</strong></h3><p>☐ Task 1 - Assigned to: [Name] - Due: [Date]</p><p>☐ Task 2 - Assigned to: [Name] - Due: [Date]</p><p>☐ Task 3 - Assigned to: [Name] - Due: [Date]</p><p><br></p><h3><strong>Next Steps</strong></h3><p>• </p><p>• </p><p><br></p><p><strong>Next Meeting:</strong> </p>`
  },
  {
    id: 'project-plan',
    title: 'Project Planning',
    description: 'Comprehensive template for project planning and milestone tracking',
    icon: Briefcase,
    color: 'bg-green-50 border-green-200 text-green-700',
    content: `<h2><strong>Project Plan</strong></h2><p><br></p><p><strong>Project Name:</strong> </p><p><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</p><p><strong>Target Completion:</strong> </p><p><strong>Project Manager:</strong> </p><p><br></p><h3><strong>Project Overview</strong></h3><p><strong>Objective:</strong> </p><p><strong>Scope:</strong> </p><p><strong>Success Criteria:</strong> </p><p><br></p><h3><strong>Key Milestones</strong></h3><p>🎯 <strong>Phase 1:</strong> [Title] - Due: [Date]</p><p>🎯 <strong>Phase 2:</strong> [Title] - Due: [Date]</p><p>🎯 <strong>Phase 3:</strong> [Title] - Due: [Date]</p><p><br></p><h3><strong>Team & Responsibilities</strong></h3><ul><li><strong>[Role]:</strong> [Name] - [Responsibilities]</li><li><strong>[Role]:</strong> [Name] - [Responsibilities]</li></ul><p><br></p><h3><strong>Risk Assessment</strong></h3><p>⚠️ <strong>Risk 1:</strong> [Description] - Mitigation: [Strategy]</p><p>⚠️ <strong>Risk 2:</strong> [Description] - Mitigation: [Strategy]</p><p><br></p><h3><strong>Resources Needed</strong></h3><ul><li>Budget: </li><li>Tools: </li><li>External Support: </li></ul>`
  },
  {
    id: 'knowledge-base',
    title: 'Knowledge Base',
    description: 'Organized template for documenting processes and information',
    icon: BookOpen,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    content: `<h2><strong>Knowledge Base Entry</strong></h2><p><br></p><p><strong>Topic:</strong> </p><p><strong>Category:</strong> </p><p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p><p><strong>Author:</strong> </p><p><br></p><h3><strong>Overview</strong></h3><p>Brief description of the topic or process...</p><p><br></p><h3><strong>Step-by-Step Instructions</strong></h3><ol><li><strong>Step 1:</strong> Description</li><li><strong>Step 2:</strong> Description</li><li><strong>Step 3:</strong> Description</li></ol><p><br></p><h3><strong>Important Notes</strong></h3><blockquote><strong>💡 Tip:</strong> [Helpful tip or best practice]</blockquote><blockquote><strong>⚠️ Warning:</strong> [Important warning or caution]</blockquote><p><br></p><h3><strong>Common Issues & Solutions</strong></h3><p><strong>Issue:</strong> [Problem description]</p><p><strong>Solution:</strong> [How to resolve]</p><p><br></p><p><strong>Issue:</strong> [Problem description]</p><p><strong>Solution:</strong> [How to resolve]</p><p><br></p><h3><strong>Related Resources</strong></h3><ul><li>Link 1: [Description]</li><li>Link 2: [Description]</li></ul><p><br></p><h3><strong>Tags</strong></h3><p>#tag1 #tag2 #tag3</p>`
  }
];

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user?.id);
      
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

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteMutation.mutate(noteId);
    }
  };

  const getPreview = (content: string) => {
    // Strip HTML tags for preview
    const strippedContent = content.replace(/<[^>]*>/g, '');
    return strippedContent.length > 150 ? strippedContent.substring(0, 150) + '...' : strippedContent;
  };

  const createFromTemplate = (template: NoteTemplate) => {
    navigate('/notes/new', { state: { template } });
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
                      Choose a Template
                    </DialogTitle>
                    <DialogDescription>
                      Start with a professional template to save time and ensure consistency.
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
            <h2 className="text-2xl font-bold text-complie-primary">Quick Start Templates</h2>
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
                    <div className="flex-1">
                      <CardDescription className="text-sm font-medium text-complie-primary">
                        {format(new Date(note.updated_at), 'MMM d, yyyy at h:mm a')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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