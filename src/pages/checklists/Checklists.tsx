import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, CheckSquare, Edit, Trash2, X } from 'lucide-react';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-complie-primary">Checklists</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable checklists for your projects
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-complie-primary" onClick={() => { resetForm(); setEditingChecklist(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Checklist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChecklist ? 'Edit Checklist' : 'Create New Checklist'}</DialogTitle>
              <DialogDescription>
                {editingChecklist ? 'Update the checklist below.' : 'Create a reusable checklist template.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Checklist title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Items</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addItem}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <Input
                        placeholder="Item description"
                        value={item.text}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        className="flex-1"
                      />
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingChecklist ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search checklists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Checklists Content */}
      {filteredChecklists.length === 0 ? (
        <Card className="card-complie">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No checklists yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create reusable checklists to standardize your processes and ensure nothing gets missed.
            </p>
            <Button className="btn-complie-primary" onClick={() => { resetForm(); setEditingChecklist(null); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Checklist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChecklists.map((checklist) => {
            const completionPercentage = getCompletionPercentage(checklist.items || []);
            const completedItems = checklist.items?.filter(item => item.completed).length || 0;
            const totalItems = checklist.items?.length || 0;

            return (
              <Card key={checklist.id} className="card-complie">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{checklist.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {completedItems}/{totalItems} items completed
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(checklist)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(checklist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={completionPercentage} className="mt-2" />
                  <div className="text-sm text-muted-foreground">
                    {completionPercentage}% complete
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {checklist.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) => 
                            toggleItemMutation.mutate({
                              checklistId: checklist.id,
                              itemId: item.id,
                              completed: !!checked
                            })
                          }
                        />
                        <span className={`text-sm flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    Created {format(new Date(checklist.created_at), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Checklists;