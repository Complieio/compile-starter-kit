import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const NoteEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [formData, setFormData] = useState({
    content: '',
    project_id: '',
    client_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
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
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
    if (!user) return;

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
            content: formData.content.trim(),
            project_id: formData.project_id || null,
            client_id: formData.client_id || null
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
            content: formData.content.trim(),
            project_id: formData.project_id || null,
            client_id: formData.client_id || null,
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/notes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-complie-primary">
            {isEditing ? 'Edit Note' : 'New Note'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Update your note content' : 'Capture your thoughts and important information'}
          </p>
        </div>
        {lastSaved && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Draft saved {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      <Card className="card-complie">
        <CardHeader>
          <CardTitle>Note Content</CardTitle>
          <CardDescription>
            {isEditing ? 'Update your note below' : 'Write your note content below'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your note here..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={12}
                className="resize-none"
                required
              />
            </div>

            {/* Project Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) => handleInputChange('project_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Client Selection */}
              <div className="space-y-2">
                <Label>Client</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => handleInputChange('client_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No client</SelectItem>
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
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/notes')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-complie-primary flex-1"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Note" : "Save Note")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteEditor;