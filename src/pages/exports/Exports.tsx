import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Table, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExportConfig {
  format: 'pdf' | 'csv' | 'excel';
  dataType: 'projects' | 'tasks' | 'clients' | 'notes' | 'all';
  dateRange: '7days' | '30days' | '90days' | 'all';
  includeArchived: boolean;
}

const Exports = () => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'pdf',
    dataType: 'projects',
    dateRange: '30days',
    includeArchived: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: exportStats } = useQuery({
    queryKey: ['export-stats'],
    queryFn: async () => {
      if (!user) return null;

      const [projectsRes, tasksRes, clientsRes, notesRes] = await Promise.all([
        supabase.from('projects').select('id').eq('user_id', user.id),
        supabase.from('tasks').select('id').eq('user_id', user.id),
        supabase.from('clients').select('id').eq('user_id', user.id),
        supabase.from('notes').select('id').eq('user_id', user.id)
      ]);

      return {
        projects: projectsRes.data?.length || 0,
        tasks: tasksRes.data?.length || 0,
        clients: clientsRes.data?.length || 0,
        notes: notesRes.data?.length || 0
      };
    },
    enabled: !!user,
  });

  const { data: recentExports = [] } = useQuery({
    queryKey: ['recent-exports'],
    queryFn: async () => {
      // In a real app, this would fetch from an exports table
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'Projects Export',
          format: 'PDF',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
          size: '2.4 MB'
        },
        {
          id: '2',
          name: 'Tasks Export',
          format: 'CSV',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          status: 'completed',
          size: '156 KB'
        }
      ];
    },
  });

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real app, this would call a Supabase edge function
      await new Promise(resolve => setTimeout(resolve, 2000));

      setExportProgress(100);
      clearInterval(progressInterval);

      // Simulate file download
      const fileName = `${exportConfig.dataType}-export-${format(new Date(), 'yyyy-MM-dd')}.${exportConfig.format}`;
      
      toast({
        title: "Export completed",
        description: `Your ${exportConfig.dataType} export has been generated successfully.`,
      });

      // In a real implementation, you would generate and download the actual file here
      console.log('Export config:', exportConfig);

    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to generate export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'csv':
        return <Table className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getDataTypeCount = (dataType: string) => {
    if (!exportStats) return 0;
    switch (dataType) {
      case 'projects':
        return exportStats.projects;
      case 'tasks':
        return exportStats.tasks;
      case 'clients':
        return exportStats.clients;
      case 'notes':
        return exportStats.notes;
      case 'all':
        return exportStats.projects + exportStats.tasks + exportStats.clients + exportStats.notes;
      default:
        return 0;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-complie-primary">Data Exports</h1>
        <p className="text-muted-foreground mt-1">
          Export your data in various formats for backup or external analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2">
          <Card className="card-complie">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Configuration
              </CardTitle>
              <CardDescription>
                Configure your data export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'pdf', label: 'PDF Report', icon: FileText },
                    { value: 'csv', label: 'CSV File', icon: Table },
                    { value: 'excel', label: 'Excel File', icon: FileSpreadsheet }
                  ].map((format) => (
                    <Button
                      key={format.value}
                      variant={exportConfig.format === format.value ? 'default' : 'outline'}
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setExportConfig({ ...exportConfig, format: format.value as any })}
                    >
                      <format.icon className="h-5 w-5" />
                      <span className="text-xs">{format.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Data Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data to Export</label>
                <Select 
                  value={exportConfig.dataType} 
                  onValueChange={(value) => setExportConfig({ ...exportConfig, dataType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data ({getDataTypeCount('all')} items)</SelectItem>
                    <SelectItem value="projects">Projects ({getDataTypeCount('projects')} items)</SelectItem>
                    <SelectItem value="tasks">Tasks ({getDataTypeCount('tasks')} items)</SelectItem>
                    <SelectItem value="clients">Clients ({getDataTypeCount('clients')} items)</SelectItem>
                    <SelectItem value="notes">Notes ({getDataTypeCount('notes')} items)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select 
                  value={exportConfig.dateRange} 
                  onValueChange={(value) => setExportConfig({ ...exportConfig, dateRange: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeArchived"
                    checked={exportConfig.includeArchived}
                    onCheckedChange={(checked) => 
                      setExportConfig({ ...exportConfig, includeArchived: !!checked })
                    }
                  />
                  <label htmlFor="includeArchived" className="text-sm">
                    Include archived items
                  </label>
                </div>
              </div>

              {/* Export Progress */}
              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating export...</span>
                    <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              )}

              {/* Export Button */}
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="btn-complie-primary w-full"
              >
                {isExporting ? (
                  <>
                    <Download className="h-4 w-4 mr-2 animate-pulse" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Export
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Export Stats */}
          <Card className="card-complie">
            <CardHeader>
              <CardTitle className="text-lg">Data Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {exportStats && [
                { label: 'Projects', count: exportStats.projects, color: 'bg-blue-500' },
                { label: 'Tasks', count: exportStats.tasks, color: 'bg-green-500' },
                { label: 'Clients', count: exportStats.clients, color: 'bg-purple-500' },
                { label: 'Notes', count: exportStats.notes, color: 'bg-orange-500' }
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <span className="font-medium">{stat.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Exports */}
          <Card className="card-complie">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Exports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentExports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent exports</p>
              ) : (
                recentExports.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getFormatIcon(exp.format)}
                      <div>
                        <div className="text-sm font-medium">{exp.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(exp.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {exp.format}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {exp.size}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Exports;