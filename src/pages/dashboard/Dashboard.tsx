import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    tasks: [],
    projects: [],
    complianceScore: 0,
    upcomingCount: 0,
    overdueCount: 0,
    storageUsed: 24,
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch real user data
        const [tasksResult, projectsResult] = await Promise.all([
          supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true })
            .limit(5),
          supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(5)
        ]);

        const tasks = tasksResult.data || [];
        const projects = projectsResult.data || [];

        // Calculate metrics
        const now = new Date();
        const upcoming = tasks.filter(task => 
          task.due_date && 
          new Date(task.due_date) > now && 
          task.status !== 'done'
        );
        const overdue = tasks.filter(task => 
          task.due_date && 
          new Date(task.due_date) < now && 
          task.status !== 'done'
        );

        // Simple compliance score calculation
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'done').length;
        const complianceScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

        setDashboardData({
          tasks: upcoming,
          projects,
          complianceScore,
          upcomingCount: upcoming.length,
          overdueCount: overdue.length,
          storageUsed: 24, // Mock storage for now
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, [user]);

  // Demo data for when user has no content
  const demoTasks = [
    { id: 'demo-1', title: 'Review compliance checklist', due_date: '2024-02-15', priority: 'high', status: 'todo' },
    { id: 'demo-2', title: 'Update client documentation', due_date: '2024-02-18', priority: 'medium', status: 'todo' },
  ];

  const demoProjects = [
    { id: 'demo-1', name: 'Website Compliance Audit', status: 'active', updated_at: new Date().toISOString() },
    { id: 'demo-2', name: 'GDPR Documentation Update', status: 'active', updated_at: new Date().toISOString() },
  ];

  const { tasks, projects, complianceScore, upcomingCount, overdueCount, storageUsed, loading } = dashboardData;
  
  // Use demo data when user has no content
  const displayTasks = tasks.length > 0 ? tasks : demoTasks;
  const displayProjects = projects.length > 0 ? projects : demoProjects;
  const isUsingDemoData = tasks.length === 0 && projects.length === 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="status-ok">Complete</Badge>;
      case 'attention':
        return <Badge className="status-attention">Attention</Badge>;
      case 'overdue':
        return <Badge className="status-overdue">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Active</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold text-complie-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>
        <Button onClick={() => navigate('/projects/new')} className="btn-complie-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-complie">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-complie-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {isUsingDemoData && <span className="text-orange-600 font-medium">[DEMO] </span>}
              {complianceScore >= 80 ? 'Great' : 'Needs attention'} — you have {upcomingCount} items due within 7 days.
            </p>
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {isUsingDemoData && <span className="text-orange-600 font-medium">[DEMO] </span>}
              Next due: {displayTasks[0]?.due_date ? new Date(displayTasks[0].due_date).toLocaleDateString() : 'None'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {isUsingDemoData && <span className="text-orange-600 font-medium">[DEMO] </span>}
              {overdueCount === 0 ? "You're all caught up!" : `${overdueCount} tasks overdue`}
            </p>
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary">{storageUsed}%</div>
            <Progress value={storageUsed} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {isUsingDemoData && <span className="text-orange-600 font-medium">[DEMO] </span>}
              {storageUsed}% of 10 GB plan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="card-complie">
          <CardHeader>
            <CardTitle>
              Upcoming Tasks
              {tasks.length === 0 && <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">DEMO</Badge>}
            </CardTitle>
            <CardDescription>Your next deadlines and priorities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming tasks — create a checklist to get started.</p>
                <Button variant="outline" onClick={() => navigate('/checklists')} className="mt-4">
                  Create Checklist
                </Button>
              </div>
            ) : (
              displayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority || 'medium')}`}>
                      {task.priority || 'medium'}
                    </span>
                    <Button size="sm" variant="outline">
                      Mark Done
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="card-complie">
          <CardHeader>
            <CardTitle>
              Recent Projects
              {projects.length === 0 && <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">DEMO</Badge>}
            </CardTitle>
            <CardDescription>Quick access to your active work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Welcome! Create your first client or project to start tracking compliance.</p>
                <Button onClick={() => navigate('/projects/new')} className="mt-4 btn-complie-primary">
                  Create Project
                </Button>
              </div>
            ) : (
              displayProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{project.name}</h4>
                      {getStatusBadge(project.status || 'active')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Updated: {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    Open
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;