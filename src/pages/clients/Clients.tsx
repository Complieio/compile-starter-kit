import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Building2, Edit, Trash2, Phone, Mail, MapPin, Grid, List, Sparkles, Users, Store, Hospital } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
  projects: { id: string }[];
}

const Clients = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    description: '',
    status: 'active',
    contact_person: '',
    industry: '',
    company_size: '',
    website: '',
    tax_id: '',
    billing_address: '',
    notes: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-open dialog when navigating to /clients/new
  useEffect(() => {
    if (location.pathname === '/clients/new') {
      resetForm();
      setEditingClient(null);
      setIsDialogOpen(true);
    }
  }, [location.pathname]);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          projects (id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Client created",
        description: "The client has been successfully created.",
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
    mutationFn: async ({ id, ...clientData }: any) => {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDialogOpen(false);
      setEditingClient(null);
      resetForm();
      toast({
        title: "Client updated",
        description: "The client has been successfully updated.",
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
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client deleted",
        description: "The client has been successfully deleted.",
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

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      description: '',
      status: 'active',
      contact_person: '',
      industry: '',
      company_size: '',
      website: '',
      tax_id: '',
      billing_address: '',
      notes: ''
    });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      contact_email: client.contact_email || '',
      contact_phone: client.contact_phone || '',
      address: client.address || '',
      description: client.description || '',
      status: client.status || 'active',
      contact_person: '',
      industry: '',
      company_size: '',
      website: '',
      tax_id: '',
      billing_address: '',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create clients.",
        variant: "destructive",
      });
      return;
    }

    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      deleteMutation.mutate(clientId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-ok">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const clientTemplates = [
    {
      id: 'tech-company',
      name: 'Technology Company',
      description: 'Tech startup or established technology company with development and innovation focus',
      icon: Building2,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      contact_email: 'contact@techcompany.com',
      contact_phone: '+1 (555) 123-4567',
      address: '123 Innovation Drive, Tech City, TC 12345',
      companyDescription: 'Leading technology company focused on innovation and digital solutions'
    },
    {
      id: 'retail-business',
      name: 'Retail Business',
      description: 'Retail store or e-commerce business with focus on customer experience and sales',
      icon: Store,
      color: 'bg-green-50 border-green-200 text-green-700',
      contact_email: 'info@retailbusiness.com',
      contact_phone: '+1 (555) 987-6543',
      address: '456 Commerce Street, Retail City, RC 67890',
      companyDescription: 'Customer-focused retail business specializing in quality products and service'
    },
    {
      id: 'healthcare-provider',
      name: 'Healthcare Provider',
      description: 'Medical practice, clinic, or healthcare organization with patient care focus',
      icon: Hospital,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      contact_email: 'admin@healthcareprovider.com',
      contact_phone: '+1 (555) 555-0123',
      address: '789 Medical Center Blvd, Health City, HC 13579',
      companyDescription: 'Dedicated healthcare provider committed to patient care and medical excellence'
    }
  ];

  const createClientFromTemplate = async (template: typeof clientTemplates[0]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a client.",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      name: template.name,
      contact_email: template.contact_email,
      contact_phone: template.contact_phone,
      address: template.address,
      description: template.companyDescription,
      status: 'active',
      contact_person: '',
      industry: '',
      company_size: '',
      website: '',
      tax_id: '',
      billing_address: '',
      notes: ''
    });
    setEditingClient(null);
    setIsDialogOpen(true);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-complie-primary mb-2 flex items-center gap-3">
                <Users className="h-10 w-10 text-complie-accent" />
                Clients
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your client relationships and contact information with professional templates
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="btn-complie-primary" onClick={() => { resetForm(); setEditingClient(null); }}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Custom Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <Card className="card-complie border-complie-accent/20 shadow-lg bg-white/70 backdrop-blur-sm border-0">
                  <CardHeader className="bg-gradient-to-r from-complie-accent/10 to-complie-primary/10 -m-6 mb-6 p-6 rounded-t-xl">
                    <CardTitle className="text-complie-primary">
                      {editingClient ? 'Edit Client' : 'Client Details'}
                    </CardTitle>
                    <CardDescription>
                      {editingClient ? 'Update the client information below' : 'Fill in the information below to create your new client'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                      {/* Client Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Client Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter client name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your client (optional)"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      {/* Contact Person */}
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input
                          id="contact_person"
                          placeholder="Primary contact name"
                          value={formData.contact_person || ''}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        />
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact_email">Email</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            placeholder="client@example.com"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact_phone">Phone</Label>
                          <Input
                            id="contact_phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Industry and Company Size */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Industry</Label>
                          <Select
                            value={formData.industry || ''}
                            onValueChange={(value) => setFormData({ ...formData, industry: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="consulting">Consulting</SelectItem>
                              <SelectItem value="real-estate">Real Estate</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Company Size</Label>
                          <Select
                            value={formData.company_size || ''}
                            onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 employees</SelectItem>
                              <SelectItem value="11-50">11-50 employees</SelectItem>
                              <SelectItem value="51-200">51-200 employees</SelectItem>
                              <SelectItem value="201-500">201-500 employees</SelectItem>
                              <SelectItem value="500+">500+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Status and Website */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="prospect">Prospect</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            placeholder="https://example.com"
                            value={formData.website || ''}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Tax ID */}
                      <div className="space-y-2">
                        <Label htmlFor="tax_id">Tax ID / Business Number</Label>
                        <Input
                          id="tax_id"
                          placeholder="Enter tax ID or business registration number"
                          value={formData.tax_id || ''}
                          onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                        />
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Textarea
                          id="address"
                          placeholder="123 Main St, City, State 12345"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          rows={2}
                        />
                      </div>

                      {/* Billing Address */}
                      <div className="space-y-2">
                        <Label htmlFor="billing_address">Billing Address</Label>
                        <Textarea
                          id="billing_address"
                          placeholder="Leave blank if same as business address"
                          value={formData.billing_address || ''}
                          onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                          rows={2}
                        />
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Internal notes, special requirements, preferences, etc..."
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                        />
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="btn-complie-primary flex-1"
                          disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
                        >
                          {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingClient ? 'Update Client' : 'Create Client')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-complie-accent" />
            <h2 className="text-2xl font-bold text-complie-primary">Quick Start Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clientTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card 
                  key={template.id} 
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${template.color} hover:scale-105 h-full flex flex-col`}
                  onClick={() => createClientFromTemplate(template)}
                >
                  <CardHeader className="pb-4 flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-white shadow-sm">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="group-hover:bg-white/80 transition-colors w-full"
                    >
                      Use Template
                      <Plus className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* My Clients Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-complie-primary">My Clients</h2>
            {filteredClients.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Search and View Controls */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search your clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-base border-2 focus:border-complie-accent transition-colors"
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

          {/* Clients Content */}
          {filteredClients.length === 0 ? (
            <Card className="text-center py-16 bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-200">
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-slate-100 rounded-full">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-complie-primary mb-3">No clients created yet</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  Get started by using one of our professional templates above, or create a custom client from scratch.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="btn-complie-primary" 
                    onClick={() => { resetForm(); setEditingClient(null); setIsDialogOpen(true); }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Custom Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
              <TabsContent value="table">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              {client.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {client.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {client.contact_email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {client.contact_email}
                                </div>
                              )}
                              {client.contact_phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {client.contact_phone}
                                </div>
                              )}
                              {client.address && (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-xs">{client.address}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(client.status)}</TableCell>
                          <TableCell>{client.projects?.length || 0}</TableCell>
                          <TableCell>
                            {format(new Date(client.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(client.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
              <TabsContent value="cards">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClients.map((client) => (
                    <Card key={client.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-complie-accent/10 rounded-lg">
                              <Building2 className="h-5 w-5 text-complie-accent" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{client.name}</CardTitle>
                              {getStatusBadge(client.status)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {client.description && (
                            <p className="text-sm text-muted-foreground">{client.description}</p>
                          )}
                          <div className="space-y-2">
                            {client.contact_email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {client.contact_email}
                              </div>
                            )}
                            {client.contact_phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {client.contact_phone}
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate">{client.address}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                              {client.projects?.length || 0} projects
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(client.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;