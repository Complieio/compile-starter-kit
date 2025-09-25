import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Download, Archive, MoreHorizontal, Plus, FileText, CheckSquare, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TaskList } from '@/components/projects/TaskList';
import { DocumentManager } from '@/components/projects/DocumentManager';
import { ProjectNotes } from '@/components/projects/ProjectNotes';
import { ProjectChatbot } from '@/components/projects/ProjectChatbot';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: project, isLoading, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (id, name, contact_email),
          tasks (id, title, status, priority, due_date, completed_at),
          documents (id, name, file_size, file_type, uploaded_at),
          notes (id, content, created_at)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

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

  const calculateProgress = () => {
    if (!project?.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const handleArchiveProject = async () => {
    if (!project || !confirm('Archive this project? It will be hidden from active projects.')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', project.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Project archived",
        description: "The project has been archived successfully.",
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
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Card className="card-complie">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();
  const overdueTasks = project.tasks?.filter(task => 
    task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date()
  ).length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-complie-primary">{project.name}</h1>
              {getStatusBadge(project.status)}
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
              {project.clients && (
                <span>Client: {project.clients.name}</span>
              )}
              {project.due_date && (
                <span>Due: {format(new Date(project.due_date), 'MMM d, yyyy')}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(`/projects/${project.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/export`)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchiveProject}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-complie">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary mb-2">{progress}%</div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {project.tasks?.filter(t => t.status === 'done').length || 0} of {project.tasks?.length || 0} tasks complete
            </p>
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary">{project.tasks?.length || 0}</div>
            {overdueTasks > 0 && (
              <p className="text-xs text-red-600 mt-1">{overdueTasks} overdue</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary">{project.documents?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {project.documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0} bytes
            </p>
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary">{project.notes?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated {project.notes?.length ? 
                format(new Date(project.notes[0].created_at), 'MMM d') : 'Never'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Description */}
      {project.description && (
        <Card className="card-complie">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="card-complie">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates to this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.tasks?.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded border">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'done' ? 'bg-green-500' : 
                        task.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.status === 'done' && task.completed_at ? 
                            `Completed ${format(new Date(task.completed_at), 'MMM d')}` :
                            task.due_date ? `Due ${format(new Date(task.due_date), 'MMM d')}` : 'No due date'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!project.tasks || project.tasks.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tasks yet</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setActiveTab('tasks')}
                      >
                        Add First Task
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-complie">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('tasks')}
                  >
                    <Plus className="h-5 w-5" />
                    Add Task
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('documents')}
                  >
                    <FileText className="h-5 w-5" />
                    Upload Doc
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('notes')}
                  >
                    <MessageSquare className="h-5 w-5" />
                    Add Note
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => navigate(`/projects/${project.id}/export`)}
                  >
                    <Download className="h-5 w-5" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskList projectId={project.id} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentManager projectId={project.id} />
        </TabsContent>

        <TabsContent value="notes">
          <ProjectNotes projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;