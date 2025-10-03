import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Grid, List, FileText, Download, Eye, Edit, Trash2, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (name),
          tasks (id, status),
          documents (id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Defensive filtering: guard against missing fields so we don't crash the page
  let filteredProjects = [];
  try {
    filteredProjects = (projects || []).filter((project: any) => {
      const q = (searchQuery || '').toLowerCase();
      const name = (project?.name || '').toString().toLowerCase();
      const clientName = (project?.clients?.name || '').toString().toLowerCase();
      const tagsMatch = Array.isArray(project?.tags)
        ? project.tags.some((tag: any) => ('' + (tag || '')).toLowerCase().includes(q))
        : false;

      return (
        name.includes(q) ||
        clientName.includes(q) ||
        tagsMatch
      );
    });
  } catch (err) {
    // In case of unexpected data shape, fall back to full list (safe)
    filteredProjects = projects || [];
    // optional: log to console for debugging
    // console.error('Error filtering projects:', err);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="status-ok">Complete</Badge>;
      case 'attention':
        return <Badge className="status-attention">Attention</Badge>;
      case 'overdue':
        return <Badge className="status-overdue">Overdue</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">Active</Badge>;
    }
  };

  const getTaskCounts = (tasks: any[]) => {
    const list = Array.isArray(tasks) ? tasks : [];
    const total = list.length;
    const completed = list.filter(t => t?.status === 'done').length;
    const overdue = list.filter(t => t?.status === 'overdue').length;
    return { total, completed, overdue };
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || 'Unknown error',
        variant: "destructive",
      });
    }
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
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const projectTemplates = [
    {
      id: 'simple-project',
      name: 'Simple Project',
      description: 'Perfect for small, straightforward projects with basic requirements',
      icon: FileText,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      editorType: 'simple',
      estimatedDays: 14
    },
    {
      id: 'standard-project',
      name: 'Standard Project',
      description: 'Ideal for medium-sized projects with detailed planning and tracking needs',
      icon: TrendingUp,
      color: 'bg-green-50 border-green-200 text-green-700',
      editorType: 'standard',
      estimatedDays: 30
    },
    {
      id: 'enterprise-project',
      name: 'Enterprise Project',
      description: 'Comprehensive project management for large, complex initiatives',
      icon: Shield,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      editorType: 'enterprise',
      estimatedDays: 60
    }
  ];

  const navigateToTemplateEditor = (template: typeof projectTemplates[0]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a project.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to the NewProject page with the editor type as a query parameter
    // Use absolute path to avoid relative-routing problems
    navigate(`/projects/new?editor=${template.editorType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-complie-primary mb-2 flex items-center gap-3">
                <FileText className="h-10 w-10 text-complie-accent" />
                Projects
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your client projects and track progress with comprehensive templates
              </p>
            </div>
            <Button onClick={() => navigate('/projects/new')} size="lg" className="btn-complie-primary">
              <Plus className="h-5 w-5 mr-2" />
              Create Custom Project
            </Button>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-complie-accent" />
            <h2 className="text-2xl font-bold text-complie-primary">Quick Start Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card 
                  key={template.id} 
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${template.color} hover:scale-105 h-full flex flex-col`}
                  onClick={() => navigateToTemplateEditor(template)}
                >
                  <CardHeader className="pb-4 flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-white shadow-sm">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="group-hover:bg-white/80 transition-colors w-full"
                      onClick={() => navigateToTemplateEditor(template)}
                    >
                      Use Template
                      <Plus className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* My Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-complie-primary">My Projects</h2>
            {filteredProjects.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Search and View Controls */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search your projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-base border-2 focus:border-complie-accent transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Projects Content */}
          {filteredProjects.length === 0 ? (
            <Card className="text-center py-16 bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-200">
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-slate-100 rounded-full">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-complie-primary mb-3">No projects created yet</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  Get started by using one of our professional templates above, or create a custom project from scratch.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="btn-complie-primary" 
                    onClick={() => navigate('/projects/new')}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Custom Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
              <TabsContent value="table">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project: any) => {
                        const taskCounts = getTaskCounts(project.tasks || []);
                        return (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>{project.clients?.name || 'No Client'}</TableCell>
                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {taskCounts.completed}/{taskCounts.total}
                                {taskCounts.overdue > 0 && (
                                  <span className="text-red-600 ml-1">({taskCounts.overdue} overdue)</span>
                                )}
                              </span>
                            </TableCell>
                            <TableCell>{project.documents?.length || 0}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {project.start_date && (
                                  <div className="text-xs text-muted-foreground">
                                    Started: {format(new Date(project.start_date), 'MMM d, yyyy')}
                                  </div>
                                )}
                                <div>
                                  {project.due_date ? format(new Date(project.due_date), 'MMM d, yyyy') : '-'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteProject(project.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
              
              <TabsContent value="cards">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project: any) => {
                    const taskCounts = getTaskCounts(project.tasks || []);
                    return (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{project.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {project.clients?.name || 'No Client'}
                              </CardDescription>
                            </div>
                            {getStatusBadge(project.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Tasks:</span>
                              <span>{taskCounts.completed}/{taskCounts.total} complete</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Documents:</span>
                              <span>{project.documents?.length || 0}</span>
                            </div>
                            {project.start_date && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Started:</span>
                                <span>{format(new Date(project.start_date), 'MMM d')}</span>
                              </div>
                            )}
                            {project.due_date && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Due:</span>
                                <span>{format(new Date(project.due_date), 'MMM d')}</span>
                              </div>
                            )}
                            <div className="flex gap-2 pt-4">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/projects/${project.id}/export`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
