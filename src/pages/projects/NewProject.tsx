import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarIcon, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const NewProject = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'active',
    start_date: undefined as Date | undefined,
    due_date: undefined as Date | undefined,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing project data if editing
  const { data: existingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id && isEditing,
  });

  // Update form data when existing project loads
  useEffect(() => {
    if (existingProject && isEditing) {
      setFormData({
        name: existingProject.name || '',
        description: existingProject.description || '',
        client_id: existingProject.client_id || '',
        status: existingProject.status || 'active',
        start_date: existingProject.start_date ? new Date(existingProject.start_date) : undefined,
        due_date: existingProject.due_date ? new Date(existingProject.due_date) : undefined,
        tags: existingProject.tags || [],
      });
    }
  }, [existingProject, isEditing]);

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
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
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a project name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isEditing && id) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim(),
            client_id: formData.client_id || null,
            status: formData.status,
            start_date: formData.start_date?.toISOString().split('T')[0] || null,
            due_date: formData.due_date?.toISOString().split('T')[0] || null,
            tags: formData.tags.length > 0 ? formData.tags : null,
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Project updated!",
          description: `${formData.name} has been updated successfully.`,
        });

        // Invalidate queries to refresh the project list
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        navigate(`/projects/${data.id}`);
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim(),
            client_id: formData.client_id || null,
            user_id: user.id,
            status: formData.status,
            start_date: formData.start_date?.toISOString().split('T')[0] || null,
            due_date: formData.due_date?.toISOString().split('T')[0] || null,
            tags: formData.tags.length > 0 ? formData.tags : null,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Project created!",
          description: `${formData.name} has been created successfully.`,
        });

        // Invalidate queries to refresh the project list
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        navigate(`/projects/${data.id}`);
      }
    } catch (error: any) {
      toast({
        title: isEditing ? "Error updating project" : "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-complie-accent/5 via-background to-complie-primary/5">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-complie-primary">
            {isEditing ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Update your project information' : 'Create a new project to organize your work'}
          </p>
        </div>
      </div>

        <Card className="card-complie border-complie-accent/20 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-complie-accent/10 to-complie-primary/10 -m-6 mb-6 p-6 rounded-t-xl">
            <CardTitle className="text-complie-primary">Project Details</CardTitle>
            <CardDescription>
              {isEditing ? 'Update the project information below' : 'Fill in the information below to create your new project'}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project (optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Client</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => handleInputChange('client_id', value === "no-client" ? "" : value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-client">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/clients/new?return=/projects/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="attention">Needs Attention</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a start date (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => handleInputChange('start_date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "PPP") : "Pick a due date (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => handleInputChange('due_date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projects')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-complie-primary flex-1"
                disabled={loading}
              >
                {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Project" : "Create Project")}
              </Button>
            </div>
          </form>
        </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default NewProject;