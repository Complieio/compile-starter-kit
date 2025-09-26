import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, CheckSquare, Edit, Trash2, X, FolderPlus, Users, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  created_at: string;
}

interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  items: string[];
}

const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'project-management',
    title: 'Project Management',
    description: 'Comprehensive project tracking and milestone management',
    icon: FolderPlus,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    items: [
      'Define project scope and objectives',
      'Create project timeline and milestones',
      'Assign team roles and responsibilities',
      'Set up project communication channels',
      'Establish quality standards',
      'Review and approve final deliverables'
    ]
  },
  {
    id: 'client-onboarding',
    title: 'Client Onboarding',
    description: 'Streamlined process for welcoming new clients',
    icon: Users,
    color: 'bg-green-50 border-green-200 text-green-700',
    items: [
      'Initial client consultation and needs assessment',
      'Contract and agreement finalization',
      'Project kickoff meeting',
      'Access and credential setup',
      'Introduce team members and points of contact',
      'Deliver welcome package and next steps'
    ]
  },
  {
    id: 'quality-assurance',
    title: 'Quality Assurance',
    description: 'Thorough review and testing procedures',
    icon: ShieldCheck,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    items: [
      'Code review and standards compliance',
      'Functionality testing and validation',
      'Performance and optimization check',
      'Security assessment and vulnerability scan',
      'User experience and accessibility review',
      'Final approval and deployment clearance'
    ]
  }
];

const Checklists = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    items: [{ id: '1', text: '', completed: false }]
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        items: (item.items as any) || []
      })) as Checklist[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (checklistData: any) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert([{ 
          title: checklistData.title,
          items: checklistData.items as any,
          user_id: user?.id 
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Checklist created",
        description: "The checklist has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...checklistData }: any) => {
      const { data, error } = await supabase
        .from('checklists')
        .update({
          title: checklistData.title,
          items: checklistData.items
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      setIsDialogOpen(false);
      setEditingChecklist(null);
      resetForm();
      toast({
        title: "Checklist updated",
        description: "The checklist has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (checklistId: string) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', checklistId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast({
        title: "Checklist deleted",
        description: "The checklist has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ checklistId, itemId, completed }: { checklistId: string, itemId: string, completed: boolean }) => {
      const checklist = checklists.find(c => c.id === checklistId);
      if (!checklist) throw new Error('Checklist not found');

      const updatedItems = checklist.items.map(item => 
        item.id === itemId ? { ...item, completed } : item
      );

      const { error } = await supabase
        .from('checklists')
        .update({ items: updatedItems as any })
        .eq('id', checklistId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createFromTemplate = (template: ChecklistTemplate) => {
    const templateItems = template.items.map((text, index) => ({
      id: (index + 1).toString(),
      text,
      completed: false
    }));

    setFormData({
      title: template.title,
      items: templateItems
    });
    setEditingChecklist(null);
    setIsDialogOpen(true);
  };

  const filteredChecklists = checklists.filter(checklist =>
    checklist.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      items: [{ id: '1', text: '', completed: false }]
    });
  };

  const handleEdit = (checklist: Checklist) => {
    setEditingChecklist(checklist);
    setFormData({
      title: checklist.title || '',
      items: checklist.items || [{ id: '1', text: '', completed: false }]
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const validItems = formData.items.filter(item => item.text.trim() !== '');
    if (!formData.title.trim() || validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a title and at least one item.",
        variant: "destructive",
      });
      return;
    }

    const dataToSubmit = {
      title: formData.title,
      items: validItems
    };

    if (editingChecklist) {
      updateMutation.mutate({ id: editingChecklist.id, ...dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleDelete = (checklistId: string) => {
    if (confirm('Are you sure you want to delete this checklist? This action cannot be undone.')) {
      deleteMutation.mutate(checklistId);
    }
  };

  const addItem = () => {
    const newId = Math.max(...formData.items.map(item => parseInt(item.id)), 0) + 1;
    setFormData({
      ...formData,
      items: [...formData.items, { id: newId.toString(), text: '', completed: false }]
    });
  };

  const removeItem = (itemId: string) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter(item => item.id !== itemId)
      });
    }
  };

  const updateItem = (itemId: string, text: string) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => 
        item.id === itemId ? { ...item, text } : item
      )
    });
  };

  const getCompletionPercentage = (items: ChecklistItem[]) => {
    if (!items || items.length === 0) return 0;
    const completed = items.filter(item => item.completed).length;
    return Math.round((completed / items.length) * 100);
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
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-complie-primary mb-2 flex items-center gap-3">
                <CheckSquare className="h-10 w-10 text-complie-accent" />
                Checklists
              </h1>
              <p className="text-lg text-muted-foreground">
                Create and manage professional checklists to streamline your workflow
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="btn-complie-primary" onClick={() => { resetForm(); setEditingChecklist(null); }}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Custom Checklist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {editingChecklist ? 'Edit Checklist' : 'Create New Checklist'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingChecklist ? 'Update your checklist below.' : 'Create a custom checklist tailored to your needs.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-complie-primary">Checklist Title *</label>
                    <Input
                      placeholder="e.g., Website Launch Checklist"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-complie-primary">Checklist Items</label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addItem}
                        className="hover:bg-complie-accent hover:text-white transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto bg-slate-50 p-4 rounded-lg border">
                      {formData.items.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-sm">
                          <div className="flex items-center justify-center w-8 h-8 bg-complie-accent text-white rounded-full text-sm font-semibold">
                            {index + 1}
                          </div>
                          <Input
                            placeholder="Enter item description..."
                            value={item.text}
                            onChange={(e) => updateItem(item.id, e.target.value)}
                            className="flex-1 border-0 shadow-none focus:ring-2 focus:ring-complie-accent"
                          />
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-complie-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingChecklist ? 'Update Checklist' : 'Create Checklist')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search your checklists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-base border-2 focus:border-complie-accent transition-colors"
            />
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-complie-accent" />
            <h2 className="text-2xl font-bold text-complie-primary">Quick Start Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHECKLIST_TEMPLATES.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card 
                  key={template.id} 
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${template.color} hover:scale-105`}
                  onClick={() => createFromTemplate(template)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-white shadow-sm">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg font-bold">{template.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/80">
                        {template.items.length} items
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="group-hover:bg-white/80 transition-colors"
                      >
                        Use Template
                        <Plus className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* My Checklists Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-complie-primary">My Checklists</h2>
            {filteredChecklists.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {filteredChecklists.length} checklist{filteredChecklists.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {filteredChecklists.length === 0 ? (
            <Card className="text-center py-16 bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-200">
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-slate-100 rounded-full">
                    <CheckSquare className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-complie-primary mb-3">No checklists created yet</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  Get started by using one of our professional templates above, or create a custom checklist from scratch.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="btn-complie-primary" 
                    onClick={() => { resetForm(); setEditingChecklist(null); setIsDialogOpen(true); }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Custom Checklist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredChecklists.map((checklist) => {
                const completionPercentage = getCompletionPercentage(checklist.items || []);
                const completedItems = checklist.items?.filter(item => item.completed).length || 0;
                const totalItems = checklist.items?.length || 0;

                return (
                  <Card key={checklist.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-complie-accent/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-complie-primary line-clamp-2 mb-2">
                            {checklist.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge 
                              variant={completionPercentage === 100 ? "default" : "secondary"}
                              className={completionPercentage === 100 ? "bg-complie-success text-white" : ""}
                            >
                              {completedItems}/{totalItems} completed
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {completionPercentage}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(checklist)}
                            className="hover:bg-complie-accent hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(checklist.id)}
                            className="hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Progress 
                        value={completionPercentage} 
                        className="h-3 bg-slate-100"
                        style={{
                          background: completionPercentage === 100 ? 'hsl(var(--complie-success))' : undefined
                        }}
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                        {checklist.items?.map((item, index) => (
                          <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={(checked) => 
                                toggleItemMutation.mutate({
                                  checklistId: checklist.id,
                                  itemId: item.id,
                                  completed: !!checked
                                })
                              }
                              className="mt-0.5 data-[state=checked]:bg-complie-success data-[state=checked]:border-complie-success"
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm leading-relaxed ${
                                item.completed 
                                  ? 'line-through text-muted-foreground' 
                                  : 'text-foreground'
                              }`}>
                                {item.text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created {format(new Date(checklist.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checklists;