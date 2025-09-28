import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ArrowLeft, Save, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const NoteEditor = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditing = !!id;
  const template = location.state?.template;
  
  const [formData, setFormData] = useState({
    title: '',
    content: template?.content || '',
    project_id: '',
    client_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch existing note data if editing
  const { data: existingNote } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id && isEditing,
  });

  // Update form data when existing note loads
  useEffect(() => {
    if (existingNote && isEditing) {
      setFormData({
        title: existingNote.title || '',
        content: existingNote.content || '',
        project_id: existingNote.project_id || '',
        client_id: existingNote.client_id || ''
      });
    }
  }, [existingNote, isEditing]);

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-for-notes'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-for-notes'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleInputChange = (field: string, value: any) => {
    // Handle "none" value for client_id to allow unlinking
    if (field === 'client_id' && value === 'none') {
      setFormData(prev => ({ ...prev, [field]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Trigger autosave for content changes
    if (field === 'content' && isEditing) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        autoSave();
      }, 5000);
      
      setAutoSaveTimer(timer);
    }
  };

  const autoSave = async () => {
    if (!user || !id || !formData.content.trim()) return;

    try {
      await supabase
        .from('notes')
        .update({
          title: formData.title || null,
          content: formData.content.trim(),
          project_id: formData.project_id || null,
          client_id: formData.client_id || null
        })
        .eq('id', id)
        .eq('user_id', user.id);

      setLastSaved(new Date());
      toast({
        title: "Draft saved",
        description: "Your note has been automatically saved.",
      });
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save notes.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter some content for your note.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title: formData.title || null,
            content: formData.content.trim(),
            project_id: formData.project_id || null,
            client_id: formData.client_id === 'none' ? null : formData.client_id || null
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Note updated!",
          description: "Your note has been successfully updated.",
        });

        navigate(`/notes`);
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert({
            title: formData.title || null,
            content: formData.content.trim(),
            project_id: formData.project_id || null,
            client_id: formData.client_id === 'none' ? null : formData.client_id || null,
            user_id: user.id,
            private: true
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Note created!",
          description: "Your note has been successfully created.",
        });

        navigate(`/notes`);
      }
    } catch (error: any) {
      toast({
        title: "Error saving note",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup autosave timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="container mx-auto max-w-6xl">
            <p className="text-blue-800 text-center">
              <strong>Preview Mode:</strong> You're viewing the note editor demo. <a href="/auth" className="underline hover:no-underline">Sign in</a> to save your notes.
            </p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/notes')}
            className="hover:bg-complie-accent hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-complie-primary flex items-center gap-3">
              <FileText className="h-8 w-8 text-complie-accent" />
              {isEditing ? 'Edit Note' : (template ? `New ${template.title}` : 'New Note')}
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              {isEditing ? 'Update your note content with rich formatting' : 'Create a professional note with rich text formatting'}
            </p>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Draft saved {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        <Card className="card-complie border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-complie-primary/5 to-complie-accent/5">
            <CardTitle className="text-xl text-complie-primary">Rich Text Editor</CardTitle>
            <CardDescription>
              {isEditing ? 'Update your note with full formatting capabilities' : 'Create your note with rich text formatting, links, images, and more'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div className="space-y-4">
                <Label htmlFor="title" className="text-base font-semibold text-complie-primary">
                  Note Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a title for your note..."
                  className="h-12 border-2 focus:border-complie-accent text-lg"
                />
              </div>

              {/* Content */}
              <div className="space-y-4">
                <Label htmlFor="content" className="text-base font-semibold text-complie-primary">
                  Content *
                </Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  placeholder="Start writing your note..."
                  className="w-full"
                />
              </div>

              {/* Project and Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-complie-primary">Project</Label>
                  <Select
                    value={formData.project_id}
                    onValueChange={(value) => handleInputChange('project_id', value)}
                  >
                    <SelectTrigger className="h-12 border-2 focus:border-complie-accent">
                      <SelectValue placeholder="Link to a project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-complie-primary">Client</Label>
                  <Select
                    value={formData.client_id || 'none'}
                    onValueChange={(value) => handleInputChange('client_id', value)}
                  >
                    <SelectTrigger className="h-12 border-2 focus:border-complie-accent">
                      <SelectValue placeholder="Link to a client (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-8 border-t-2 border-muted-foreground/10">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/notes')}
                  disabled={loading}
                  className="border-2 hover:border-complie-accent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="btn-complie-primary flex-1 h-12"
                  disabled={loading}
                >
                  <Save className="h-5 w-5 mr-2" />
                  {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Note" : "Save Note")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoteEditor;