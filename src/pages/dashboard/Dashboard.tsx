import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp, AlertTriangle, CheckSquare, Clock, Users, FileText, BarChart3, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    checklists: [],
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
        const [checklistsResult, projectsResult, notesResult, clientsResult] = await Promise.all([
          supabase
            .from('checklists')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(3),
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

        const checklists = checklistsResult.data || [];
        const projects = projectsResult.data || [];
        const notes = notesResult.data || [];
        const clients = clientsResult.data || [];

        // Calculate checklist metrics
        const totalChecklists = checklists.length;
        const completedChecklists = checklists.filter(checklist => {
          const items = Array.isArray(checklist.items) ? checklist.items : [];
          return items.length > 0 && items.every((item: any) => item.completed);
        }).length;
        
        const upcomingChecklists = checklists.filter(checklist => {
          const items = Array.isArray(checklist.items) ? checklist.items : [];
          return items.length > 0 && !items.every((item: any) => item.completed);
        });

        // Simple compliance score calculation
        const complianceScore = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 100;

        setDashboardData({
          checklists: upcomingChecklists.slice(0, 3),
          projects,
          notes,
          clients,
          complianceScore,
          upcomingCount: upcomingChecklists.length,
          overdueCount: 0, // We'll implement overdue logic later if needed
          storageUsed: 24, // Mock storage for now
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Demo data for when user has no content
  const demoChecklists = [
    { id: 'demo-1', title: 'Website Compliance Checklist', items: [{ text: 'Review privacy policy', completed: false }] },
    { id: 'demo-2', title: 'Client Onboarding Checklist', items: [{ text: 'Collect contact information', completed: false }] },
  ];

  const demoProjects = [
    { id: 'demo-1', name: 'Website Compliance Audit', status: 'active', updated_at: new Date().toISOString() },
    { id: 'demo-2', name: 'GDPR Documentation Update', status: 'active', updated_at: new Date().toISOString() },
  ];

  const { checklists, projects, notes, clients, complianceScore, upcomingCount, overdueCount, storageUsed, loading } = dashboardData;
  
  // Use demo data when user has no content
  const displayChecklists = checklists.length > 0 ? checklists : demoChecklists;
  const displayProjects = projects.length > 0 ? projects : demoProjects;
  const isUsingDemoData = checklists.length === 0 && projects.length === 0;

  // Chart data
  const projectStatusData = [
    { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: 'hsl(var(--complie-accent))' },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'hsl(var(--complie-success))' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, color: 'hsl(var(--complie-warning))' }
  ];

  const activityData = [
    { name: 'Mon', projects: 2, checklists: 4 },
    { name: 'Tue', projects: 1, checklists: 6 },
    { name: 'Wed', projects: 3, checklists: 3 },
    { name: 'Thu', projects: 2, checklists: 8 },
    { name: 'Fri', projects: 4, checklists: 5 },
    { name: 'Sat', projects: 1, checklists: 2 },
    { name: 'Sun', projects: 0, checklists: 1 }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="status-ok">Complete</Badge>;
      case 'on_hold':
        return <Badge className="status-attention">On Hold</Badge>;
      case 'overdue':
        return <Badge className="status-overdue">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Active</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard
            </h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-complie-accent/5 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Health</CardTitle>
              <div className="p-2 bg-gradient-to-r from-complie-accent to-complie-primary rounded-md shadow-sm">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {complianceScore}%
              </div>
              <Progress value={complianceScore} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {isUsingDemoData && <span className="text-complie-warning font-medium">[DEMO] </span>}
                {complianceScore >= 80 ? 'Great progress' : 'Needs attention'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-green-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Checklists</CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-sm">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {upcomingCount}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {isUsingDemoData && <span className="text-complie-warning font-medium">[DEMO] </span>}
                Pending completion
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-purple-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md shadow-sm">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {projects.length}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {isUsingDemoData && <span className="text-complie-warning font-medium">[DEMO] </span>}
                {projects.filter(p => p.status === 'active').length} in progress
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Notes</CardTitle>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md shadow-sm">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {notes.length}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {isUsingDemoData && <span className="text-complie-warning font-medium">[DEMO] </span>}
                Saved notes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Checklists */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-blue-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-complie-accent" />
                  <CardTitle className="text-lg text-foreground">
                    Upcoming Checklists
                    {checklists.length === 0 && <Badge variant="outline" className="ml-2 text-complie-warning">DEMO</Badge>}
                  </CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/checklists')}
                  className="text-complie-accent hover:text-complie-accent hover:bg-accent"
                >
                  See All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-muted-foreground">Your pending checklists</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayChecklists.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No checklists yet</p>
                  <Button variant="outline" onClick={() => navigate('/checklists')} className="mt-3" size="sm">
                    Create Checklist
                  </Button>
                </div>
              ) : (
                displayChecklists.map((checklist) => (
                  <div key={checklist.id} className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                    <h4 className="font-medium text-foreground text-sm">{checklist.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Array.isArray(checklist.items) ? checklist.items.length : 0} items
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-indigo-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-complie-accent" />
                  <CardTitle className="text-lg text-foreground">
                    Recent Projects
                    {projects.length === 0 && <Badge variant="outline" className="ml-2 text-complie-warning">DEMO</Badge>}
                  </CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/projects')}
                  className="text-complie-accent hover:text-complie-accent hover:bg-accent"
                >
                  See All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-muted-foreground">Your active projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayProjects.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Plus className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No projects yet</p>
                  <Button onClick={() => navigate('/projects/new')} className="mt-3 btn-complie-primary" size="sm">
                    Create Project
                  </Button>
                </div>
              ) : (
                displayProjects.map((project) => (
                  <div key={project.id} className="p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground text-sm">{project.name}</h4>
                          {getStatusBadge(project.status || 'active')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-slate-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-complie-accent" />
                  <CardTitle className="text-lg text-foreground">Activity Overview</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/analytics')}
                  className="text-complie-accent hover:text-complie-accent hover:bg-accent"
                >
                  Full Report <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-muted-foreground">Progress insights and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Status Chart */}
              <div>
                <h4 className="font-medium text-foreground mb-2 text-sm">Project Status</h4>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
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
                <h4 className="font-medium text-foreground mb-2 text-sm">Weekly Activity</h4>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={activityData}>
                       <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false}
                         tickLine={false}
                         className="text-xs text-muted-foreground"
                       />
                       <YAxis 
                         axisLine={false}
                         tickLine={false}
                         className="text-xs text-muted-foreground"
                       />
                       <Tooltip 
                         contentStyle={{
                           background: 'hsl(var(--background))',
                           border: '1px solid hsl(var(--border))',
                           borderRadius: '8px'
                         }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="projects" 
                         stackId="1"
                         stroke="hsl(217.2 91.2% 59.8%)" 
                         fill="hsl(217.2 91.2% 59.8%)"
                         fillOpacity={0.6}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="checklists" 
                         stackId="1"
                         stroke="hsl(142.1 76.2% 36.3%)" 
                         fill="hsl(142.1 76.2% 36.3%)"
                         fillOpacity={0.6}
                       />
                     </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-accent rounded-md border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-3 w-3 text-complie-accent" />
                    <span className="text-xs font-medium text-muted-foreground">Clients</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">{clients.length}</div>
                </div>
                <div className="p-2 bg-accent rounded-md border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-3 w-3 text-complie-accent" />
                    <span className="text-xs font-medium text-muted-foreground">Notes</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">{notes.length}</div>
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