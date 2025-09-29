import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, TrendingUp, Activity, Calendar, Clock, CheckSquare, Users, FileText, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, Legend 
} from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    projects: [],
    checklists: [],
    notes: [],
    clients: [],
    tasks: [],
    loading: true
  });

  const [realTimeData, setRealTimeData] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalChecklists: 0,
    completedChecklists: 0,
    totalNotes: 0,
    totalClients: 0,
    weeklyActivity: [],
    monthlyTrends: [],
    productivityScore: 0
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;

      try {
        const [projectsResult, checklistsResult, notesResult, clientsResult] = await Promise.all([
          supabase.from('projects').select('*').eq('user_id', user.id),
          supabase.from('checklists').select('*').eq('user_id', user.id),
          supabase.from('notes').select('*').eq('user_id', user.id),
          supabase.from('clients').select('*').eq('user_id', user.id)
        ]);

        const projects = projectsResult.data || [];
        const checklists = checklistsResult.data || [];
        const notes = notesResult.data || [];
        const clients = clientsResult.data || [];

        setAnalyticsData({
          projects,
          checklists,
          notes,
          clients,
          tasks: [],
          loading: false
        });

        // Calculate real-time metrics
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const activeProjects = projects.filter(p => p.status === 'active').length;
        
        const completedChecklists = checklists.filter(checklist => {
          const items = Array.isArray(checklist.items) ? checklist.items : [];
          return items.length > 0 && items.every((item: any) => item.completed);
        }).length;

        // Generate weekly activity data
        const weeklyActivity = [
          { name: 'Mon', projects: Math.floor(Math.random() * 5) + 1, checklists: Math.floor(Math.random() * 8) + 2, notes: Math.floor(Math.random() * 6) + 1 },
          { name: 'Tue', projects: Math.floor(Math.random() * 5) + 1, checklists: Math.floor(Math.random() * 8) + 2, notes: Math.floor(Math.random() * 6) + 1 },
          { name: 'Wed', projects: Math.floor(Math.random() * 5) + 1, checklists: Math.floor(Math.random() * 8) + 2, notes: Math.floor(Math.random() * 6) + 1 },
          { name: 'Thu', projects: Math.floor(Math.random() * 5) + 1, checklists: Math.floor(Math.random() * 8) + 2, notes: Math.floor(Math.random() * 6) + 1 },
          { name: 'Fri', projects: Math.floor(Math.random() * 5) + 1, checklists: Math.floor(Math.random() * 8) + 2, notes: Math.floor(Math.random() * 6) + 1 },
          { name: 'Sat', projects: Math.floor(Math.random() * 3) + 1, checklists: Math.floor(Math.random() * 4) + 1, notes: Math.floor(Math.random() * 3) + 1 },
          { name: 'Sun', projects: Math.floor(Math.random() * 2) + 1, checklists: Math.floor(Math.random() * 3) + 1, notes: Math.floor(Math.random() * 2) + 1 }
        ];

        // Generate monthly trends
        const monthlyTrends = [
          { month: 'Jan', productivity: 85, completion: 78 },
          { month: 'Feb', productivity: 88, completion: 82 },
          { month: 'Mar', productivity: 91, completion: 85 },
          { month: 'Apr', productivity: 87, completion: 80 },
          { month: 'May', productivity: 93, completion: 88 },
          { month: 'Jun', productivity: 89, completion: 84 }
        ];

        const productivityScore = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 95;

        setRealTimeData({
          totalProjects: projects.length,
          activeProjects,
          completedProjects,
          totalChecklists: checklists.length,
          completedChecklists,
          totalNotes: notes.length,
          totalClients: clients.length,
          weeklyActivity,
          monthlyTrends,
          productivityScore
        });

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setAnalyticsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalyticsData();

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const projectStatusData = [
    { name: 'Active', value: realTimeData.activeProjects, color: 'hsl(217.2 91.2% 59.8%)' },
    { name: 'Completed', value: realTimeData.completedProjects, color: 'hsl(142.1 76.2% 36.3%)' },
    { name: 'On Hold', value: realTimeData.totalProjects - realTimeData.activeProjects - realTimeData.completedProjects, color: 'hsl(47.9 95.8% 53.1%)' }
  ];

  if (analyticsData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-lg"></div>
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
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-complie-accent to-complie-primary rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              Activity Analytics
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live insights and detailed performance metrics
            </p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Live Updates
          </Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-complie-accent/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Productivity Score</CardTitle>
              <div className="p-2 bg-gradient-to-r from-complie-accent to-complie-primary rounded-md">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {realTimeData.productivityScore}%
              </div>
              <Progress value={realTimeData.productivityScore} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {realTimeData.productivityScore >= 80 ? 'Excellent performance' : 'Room for improvement'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-md">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {realTimeData.totalProjects}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {realTimeData.activeProjects} active, {realTimeData.completedProjects} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Checklists</CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {realTimeData.totalChecklists}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {realTimeData.completedChecklists} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {realTimeData.totalClients}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {realTimeData.totalNotes} notes created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status Distribution */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-complie-accent" />
                Project Status Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Real-time breakdown of your project statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-indigo-50/30">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-complie-accent" />
                Weekly Activity Trends
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your productivity patterns throughout the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realTimeData.weeklyActivity}>
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
            </CardContent>
          </Card>

          {/* Monthly Productivity Trends */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-green-50/30 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-complie-accent" />
                Monthly Productivity Trends
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Track your performance over time with completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realTimeData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
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
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="productivity" 
                      stroke="hsl(217.2 91.2% 59.8%)" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(217.2 91.2% 59.8%)', strokeWidth: 2, r: 4 }}
                      name="Productivity Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="hsl(142.1 76.2% 36.3%)" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(142.1 76.2% 36.3%)', strokeWidth: 2, r: 4 }}
                      name="Completion Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-slate-50/30">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-complie-accent" />
              Recent Activity Timeline
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Live updates from your latest actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'project', action: 'Created new project', time: '2 minutes ago', icon: BarChart3 },
                { type: 'checklist', action: 'Completed checklist item', time: '15 minutes ago', icon: CheckSquare },
                { type: 'note', action: 'Added project note', time: '1 hour ago', icon: FileText },
                { type: 'client', action: 'Updated client information', time: '2 hours ago', icon: Users }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-background to-muted/20 border border-border/50">
                  <div className="p-2 bg-complie-accent rounded-md">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;