import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, FileText, BarChart3, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    tasks: [],
    projects: [],
    notes: [],
    clients: [],
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
        const [tasksResult, projectsResult, notesResult, clientsResult] = await Promise.all([
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
            .limit(5),
          supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(3),
          supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(3)
        ]);

        const tasks = tasksResult.data || [];
        const projects = projectsResult.data || [];
        const notes = notesResult.data || [];
        const clients = clientsResult.data || [];

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
          notes,
          clients,
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

  const { tasks, projects, notes, clients, complianceScore, upcomingCount, overdueCount, storageUsed, loading } = dashboardData;
  
  // Use demo data when user has no content
  const displayTasks = tasks.length > 0 ? tasks : demoTasks;
  const displayProjects = projects.length > 0 ? projects : demoProjects;
  const isUsingDemoData = tasks.length === 0 && projects.length === 0;

  // Chart data
  const taskStatusData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'done').length, color: '#10b981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: '#6b7280' }
  ];

  const activityData = [
    { name: 'Mon', projects: 4, tasks: 8 },
    { name: 'Tue', projects: 3, tasks: 12 },
    { name: 'Wed', projects: 2, tasks: 6 },
    { name: 'Thu', projects: 5, tasks: 15 },
    { name: 'Fri', projects: 7, tasks: 10 },
    { name: 'Sat', projects: 2, tasks: 4 },
    { name: 'Sun', projects: 1, tasks: 2 }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-complie-primary to-complie-accent bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Welcome back! Here&apos;s what&apos;s happening with your projects.
            </p>
          </div>
          <Button onClick={() => navigate('/projects/new')} className="btn-complie-primary shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Compliance Health</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {complianceScore}%
              </div>
              <Progress value={complianceScore} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-3">
                {isUsingDemoData && <span className="text-orange-600 font-medium">[DEMO] </span>}
                {complianceScore >= 80 ? 'Great' : 'Needs attention'} — {upcomingCount} items due soon
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-amber-50 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Upcoming Deadlines</CardTitle>
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {upcomingCount}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {isUsingDemoData && <span className="text-orange-600 font-medium">[DEMO] </span>}
                Next: {displayTasks[0]?.due_date ? new Date(displayTasks[0].due_date).toLocaleDateString() : 'None'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-red-50 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Overdue Tasks</CardTitle>
              <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {overdueCount}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {isUsingDemoData && <span className="text-orange-600 font-medium">[DEMO] </span>}
                {overdueCount === 0 ? "All caught up!" : `${overdueCount} overdue`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Projects</CardTitle>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {projects.length}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {isUsingDemoData && <span className="text-orange-600 font-medium">[DEMO] </span>}
                {projects.filter(p => p.status === 'active').length} in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Tasks */}
          <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <CardTitle className="text-lg">
                    Upcoming Tasks
                    {tasks.length === 0 && <Badge variant="outline" className="ml-2 text-orange-200 border-orange-200">DEMO</Badge>}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="text-blue-100 mt-1">Your next deadlines and priorities</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
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
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100 hover:border-blue-200 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority || 'medium'}
                      </span>
                      <Button size="sm" variant="outline" className="hover:bg-blue-50">
                        Mark Done
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  <CardTitle className="text-lg">
                    Recent Projects
                    {projects.length === 0 && <Badge variant="outline" className="ml-2 text-orange-200 border-orange-200">DEMO</Badge>}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="text-purple-100 mt-1">Quick access to your active work</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {displayProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Welcome! Create your first project to start tracking compliance.</p>
                  <Button onClick={() => navigate('/projects/new')} className="mt-4 btn-complie-primary">
                    Create Project
                  </Button>
                </div>
              ) : (
                displayProjects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-purple-50 border border-purple-100 hover:border-purple-200 cursor-pointer transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-slate-900">{project.name}</h4>
                          {getStatusBadge(project.status || 'active')}
                        </div>
                        <p className="text-sm text-slate-600">
                          Updated: {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="hover:bg-purple-50">
                        Open
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Analytics & Quick Stats */}
          <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5" />
                <CardTitle className="text-lg">Activity Overview</CardTitle>
              </div>
              <CardDescription className="text-emerald-100 mt-1">Progress insights and trends</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Task Status Chart */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Task Progress</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Activity */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Weekly Activity</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="tasks" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="projects" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Clients</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">{clients.length}</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Notes</span>
                  </div>
                  <div className="text-xl font-bold text-amber-600">{notes.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;