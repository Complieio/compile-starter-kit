import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data - in real app, this would come from API
  const complianceScore = 85;
  const upcomingTasks = [
    { id: 1, title: 'File quarterly taxes', project: 'Tax Compliance', due: '2024-01-15', priority: 'high' },
    { id: 2, title: 'Update client contracts', project: 'Legal Review', due: '2024-01-18', priority: 'medium' },
    { id: 3, title: 'Submit monthly reports', project: 'Reporting', due: '2024-01-20', priority: 'low' },
  ];

  const recentProjects = [
    { id: 1, name: 'Website Redesign', client: 'Acme Corp', status: 'active', progress: 75 },
    { id: 2, name: 'Brand Identity', client: 'Tech Startup', status: 'attention', progress: 45 },
    { id: 3, name: 'Marketing Campaign', client: 'Local Business', status: 'completed', progress: 100 },
  ];

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-complie-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your projects.
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
              Great — you have 2 items due within 7 days.
            </p>
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary">3</div>
            <p className="text-xs text-muted-foreground mt-2">
              Next due: Jan 15, 2024
            </p>
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-muted-foreground mt-2">
              You're all caught up!
            </p>
          </CardContent>
        </Card>

        <Card className="card-complie">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-complie-primary">2.4 GB</div>
            <Progress value={24} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              24% of 10 GB plan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="card-complie">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Your next deadlines and priorities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming tasks — create a checklist to get started.</p>
                <Button variant="outline" onClick={() => navigate('/checklists')} className="mt-4">
                  Create Checklist
                </Button>
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.project}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.due}
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
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Quick access to your active work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Welcome! Create your first client or project to start tracking compliance.</p>
                <Button onClick={() => navigate('/projects/new')} className="mt-4 btn-complie-primary">
                  Create Project
                </Button>
              </div>
            ) : (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{project.name}</h4>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{project.client}</p>
                    <Progress value={project.progress} className="mt-2 h-1" />
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