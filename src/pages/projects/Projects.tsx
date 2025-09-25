import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Grid, List, FileText, Download, Eye, Edit, Trash2 } from 'lucide-react';
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

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
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
        description: error.message,
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-complie-primary">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client projects and track progress
          </p>
        </div>
        <Button onClick={() => navigate('/projects/new')} className="btn-complie-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
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
        <Card className="card-complie">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get started by creating your first project. You can organize work by client, 
              track deadlines, and manage compliance requirements.
            </p>
            <Button onClick={() => navigate('/projects/new')} className="btn-complie-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
          <TabsContent value="table">
            <Card className="card-complie">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => {
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
                          {project.due_date ? format(new Date(project.due_date), 'MMM d, yyyy') : '-'}
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
              {filteredProjects.map((project) => {
                const taskCounts = getTaskCounts(project.tasks || []);
                return (
                  <Card key={project.id} className="card-complie hover:shadow-lg transition-shadow cursor-pointer">
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
  );
};

export default Projects;