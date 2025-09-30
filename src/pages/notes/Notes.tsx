import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileText, Edit, Trash2, Sparkles, BookOpen, Users, Briefcase, Pin, FileSignature, FileCheck, Receipt, Mail, UserCheck, MessageSquare, Presentation, Share2, ClipboardCheck, Award, Palette, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Note {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
  project_id: string | null;
  client_id: string | null;
  user_id: string;
  private: boolean;
  pinned: boolean;
}

interface NoteTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: 'entrepreneur' | 'freelancer' | 'both';
  content: string;
}

const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'client-proposal',
    title: 'Client Proposal',
    description: 'Outline your project, deliverables, timeline, and pricing for potential clients.',
    icon: FileSignature,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    category: 'entrepreneur',
    content: '<h1>Client Proposal</h1><p><br></p><h2>Project Overview</h2><p>Brief description of the project...</p><p><br></p><h2>Deliverables</h2><ul><li>Deliverable 1</li><li>Deliverable 2</li><li>Deliverable 3</li></ul><p><br></p><h2>Timeline</h2><p>Project duration and key milestones...</p><p><br></p><h2>Pricing</h2><p>Investment details...</p>'
  },
  {
    id: 'service-agreement',
    title: 'Service Agreement / Contract',
    description: 'Set clear terms for scope of work, payment, and revisions.',
    icon: FileCheck,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    category: 'entrepreneur',
    content: '<h1>Service Agreement</h1><p><br></p><h2>Scope of Work</h2><p>Define the services to be provided...</p><p><br></p><h2>Payment Terms</h2><p>Payment schedule and amounts...</p><p><br></p><h2>Revision Policy</h2><p>Number of revisions included...</p><p><br></p><h2>Terms & Conditions</h2><p>Additional terms...</p>'
  },
  {
    id: 'invoice',
    title: 'Invoice',
    description: 'Itemized billing template for smooth client payments.',
    icon: Receipt,
    color: 'bg-green-50 border-green-200 text-green-700',
    category: 'both',
    content: '<h1>Invoice</h1><p><br></p><h2>Invoice Details</h2><p>Invoice #: </p><p>Date: </p><p>Due Date: </p><p><br></p><h2>Itemized Services</h2><table><tbody><tr><td>Service</td><td>Quantity</td><td>Rate</td><td>Amount</td></tr><tr><td></td><td></td><td></td><td></td></tr></tbody></table><p><br></p><h2>Total Amount Due</h2><p>$0.00</p>'
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter',
    description: 'Pitch yourself to clients with credibility and value.',
    icon: Mail,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    category: 'freelancer',
    content: '<h1>Cover Letter</h1><p><br></p><p>Dear [Client Name],</p><p><br></p><p>I am writing to express my interest in [project/position]...</p><p><br></p><h2>Why I\'m a Great Fit</h2><p>Highlight relevant skills and experience...</p><p><br></p><h2>What I Can Deliver</h2><p>Specific value you bring...</p><p><br></p><p>Best regards,<br>[Your Name]</p>'
  },
  {
    id: 'freelancer-resume',
    title: 'Freelancer Resume / CV',
    description: 'Show your skills, experience, and portfolio professionally.',
    icon: UserCheck,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    category: 'freelancer',
    content: '<h1>[Your Name]</h1><p>[Your Title/Specialty]</p><p><br></p><h2>Professional Summary</h2><p>Brief overview of your expertise...</p><p><br></p><h2>Skills</h2><ul><li>Skill 1</li><li>Skill 2</li><li>Skill 3</li></ul><p><br></p><h2>Experience</h2><p><strong>Role | Company | Dates</strong></p><p>Description of responsibilities...</p><p><br></p><h2>Portfolio</h2><p>Links to your best work...</p>'
  },
  {
    id: 'cold-email',
    title: 'Cold Email / Outreach',
    description: 'Script to grab attention and land new clients.',
    icon: MessageSquare,
    color: 'bg-green-50 border-green-200 text-green-700',
    category: 'both',
    content: '<h1>Cold Email Template</h1><p><br></p><p><strong>Subject Line:</strong> [Attention-grabbing subject]</p><p><br></p><p>Hi [Name],</p><p><br></p><p>I noticed [specific observation about their business]...</p><p><br></p><p>I specialize in [your service] and have helped [similar results].</p><p><br></p><p>Would you be open to a quick call to discuss [specific benefit]?</p><p><br></p><p>Best,<br>[Your Name]</p>'
  },
  {
    id: 'pitch-deck',
    title: 'Pitch Deck',
    description: 'Present your project or business professionally to investors or clients.',
    icon: Presentation,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    category: 'entrepreneur',
    content: '<h1>Pitch Deck</h1><p><br></p><h2>Problem</h2><p>What problem are you solving?</p><p><br></p><h2>Solution</h2><p>Your unique solution...</p><p><br></p><h2>Market Opportunity</h2><p>Target market and size...</p><p><br></p><h2>Business Model</h2><p>How you make money...</p><p><br></p><h2>Traction</h2><p>Key metrics and achievements...</p><p><br></p><h2>Ask</h2><p>What you\'re seeking...</p>'
  },
  {
    id: 'social-media-proposal',
    title: 'Social Media Proposal',
    description: 'Suggest strategy and deliverables for social media clients.',
    icon: Share2,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    category: 'entrepreneur',
    content: '<h1>Social Media Proposal</h1><p><br></p><h2>Current Situation Analysis</h2><p>Overview of client\'s current social presence...</p><p><br></p><h2>Proposed Strategy</h2><p>Content themes, posting frequency, platforms...</p><p><br></p><h2>Deliverables</h2><ul><li>Posts per week</li><li>Stories/Reels</li><li>Engagement management</li></ul><p><br></p><h2>Investment & Timeline</h2><p>Package details...</p>'
  },
  {
    id: 'project-report',
    title: 'Project Report / Progress Update',
    description: 'Track work done, next steps, and blockers for clients or yourself.',
    icon: ClipboardCheck,
    color: 'bg-green-50 border-green-200 text-green-700',
    category: 'both',
    content: '<h1>Project Progress Update</h1><p><br></p><h2>Completed This Period</h2><ul><li>Task 1</li><li>Task 2</li><li>Task 3</li></ul><p><br></p><h2>In Progress</h2><ul><li>Current work items...</li></ul><p><br></p><h2>Next Steps</h2><ul><li>Upcoming tasks...</li></ul><p><br></p><h2>Blockers/Issues</h2><p>Any challenges or dependencies...</p>'
  },
  {
    id: 'testimonial-case-study',
    title: 'Testimonial / Case Study',
    description: 'Document results and showcase your impact for credibility.',
    icon: Award,
    color: 'bg-green-50 border-green-200 text-green-700',
    category: 'both',
    content: '<h1>Case Study: [Client Name]</h1><p><br></p><h2>The Challenge</h2><p>What problem did the client face?</p><p><br></p><h2>The Solution</h2><p>How you addressed it...</p><p><br></p><h2>The Results</h2><ul><li>Metric 1: [improvement]</li><li>Metric 2: [improvement]</li><li>Metric 3: [improvement]</li></ul><p><br></p><h2>Client Testimonial</h2><blockquote>"[Client quote]" - [Name, Title]</blockquote>'
  },
  {
    id: 'design-brief',
    title: 'Graphic Design Project Brief',
    description: 'Define client goals, deliverables, timeline, and usage rights.',
    icon: Palette,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    category: 'freelancer',
    content: '<h1>Design Project Brief</h1><p><br></p><h2>Project Goals</h2><p>What should this design achieve?</p><p><br></p><h2>Target Audience</h2><p>Who is this for?</p><p><br></p><h2>Deliverables</h2><ul><li>File formats needed</li><li>Sizes/dimensions</li><li>Number of concepts</li></ul><p><br></p><h2>Brand Guidelines</h2><p>Colors, fonts, style references...</p><p><br></p><h2>Timeline & Usage Rights</h2><p>Delivery date and licensing terms...</p>'
  },
  {
    id: 'business-plan',
    title: 'Service-Based Business Plan',
    description: 'Outline services, target audience, pricing, marketing, and KPIs.',
    icon: Target,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    category: 'entrepreneur',
    content: '<h1>Service-Based Business Plan</h1><p><br></p><h2>Executive Summary</h2><p>Brief overview of your business...</p><p><br></p><h2>Services Offered</h2><ul><li>Service 1</li><li>Service 2</li><li>Service 3</li></ul><p><br></p><h2>Target Audience</h2><p>Ideal client profile...</p><p><br></p><h2>Pricing Strategy</h2><p>Package tiers and rates...</p><p><br></p><h2>Marketing Plan</h2><p>How you\'ll attract clients...</p><p><br></p><h2>Key Performance Indicators</h2><p>Metrics to track success...</p>'
  }
];

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user && !loading, // Only run when user is loaded and authenticated
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user) {
        throw new Error("Please sign in to delete notes");
      }
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: "Note deleted",
        description: "The note has been successfully deleted.",
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

  const togglePinMutation = useMutation({
    mutationFn: async ({ noteId, pinned }: { noteId: string; pinned: boolean }) => {
      if (!user) {
        throw new Error("Please sign in to pin notes");
      }
      
      const { error } = await supabase
        .from('notes')
        .update({ pinned: !pinned })
        .eq('id', noteId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredNotes = notes.filter(note => {
    const titleMatch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const contentMatch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  const handleDelete = (noteId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to delete notes.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteMutation.mutate(noteId);
    }
  };

  const handleTogglePin = (noteId: string, pinned: boolean) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to pin notes.",
        variant: "destructive",
      });
      return;
    }
    
    togglePinMutation.mutate({ noteId, pinned });
  };

  const getPreview = (content: string) => {
    // Strip HTML tags for preview
    const strippedContent = content.replace(/<[^>]*>/g, '');
    return strippedContent.length > 150 ? strippedContent.substring(0, 150) + '...' : strippedContent;
  };

  const createFromTemplate = (template: NoteTemplate) => {
    navigate('/notes/new', { state: { 
      templateContent: template.content, 
      templateTitle: template.title,
      templateId: template.id 
    } });
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
      {!user && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="container mx-auto max-w-7xl">
            <p className="text-blue-800 text-center">
              <strong>Preview Mode:</strong> You're viewing a demo. <a href="/auth" className="underline hover:no-underline">Sign in</a> to create and manage your own notes.
            </p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-complie-primary mb-2 flex items-center gap-3">
                <FileText className="h-10 w-10 text-complie-accent" />
                Notes
              </h1>
              <p className="text-lg text-muted-foreground">
                Capture ideas, meeting notes, and important information with rich formatting
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="border-2 hover:border-complie-accent">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Use Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Sparkles className="h-7 w-7 text-complie-accent" />
                      Choose a Template to Get Started
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-sm">Entrepreneur</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-sm">Freelancer</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-sm">Both</span>
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-4 gap-4 py-6">
                    {NOTE_TEMPLATES.map((template) => {
                      const IconComponent = template.icon;
                      return (
                        <Card 
                          key={template.id}
                          className={`group cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${template.color} hover:scale-105`}
                          onClick={() => {
                            createFromTemplate(template);
                            setIsTemplateDialogOpen(false);
                          }}
                        >
                          <CardHeader className="pb-3 pt-4 px-4">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-white shadow-sm">
                                  <IconComponent className="h-5 w-5" />
                                </div>
                              </div>
                              <div>
                                <CardTitle className="text-sm font-bold mb-2">{template.title}</CardTitle>
                                <CardDescription className="text-xs leading-relaxed line-clamp-3">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="lg" className="btn-complie-primary" onClick={() => navigate('/notes/new')}>
                <Plus className="h-5 w-5 mr-2" />
                New Note
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-base border-2 focus:border-complie-accent transition-colors"
            />
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-10">
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 bg-blue-200/40 border-blue-300/40 hover:bg-blue-300/50"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="h-7 w-7 text-white" />
                <h2 className="text-2xl font-bold text-white">Choose a Template to Get Started</h2>
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Content */}
        {filteredNotes.length === 0 ? (
          <Card className="card-complie border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-complie-primary">No notes yet</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
                Start capturing your thoughts and important information with rich text formatting. 
                Use templates to get started quickly or create from scratch.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTemplateDialogOpen(true)}
                  className="border-2 hover:border-complie-accent"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button className="btn-complie-primary" onClick={() => navigate('/notes/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Write Your First Note
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className="card-complie group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-complie-accent/30"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center gap-2">
                      {note.pinned && (
                        <Pin className="h-4 w-4 text-complie-accent fill-complie-accent" />
                      )}
                      <CardDescription className="text-sm font-medium text-complie-primary">
                        {format(new Date(note.updated_at), 'MMM d, yyyy at h:mm a')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePin(note.id, note.pinned)}
                        className={`hover:bg-complie-accent hover:text-white ${note.pinned ? 'opacity-100' : ''}`}
                        title={note.pinned ? "Unpin note" : "Pin note"}
                      >
                        <Pin className={`h-4 w-4 ${note.pinned ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/notes/${note.id}/edit`)}
                        className="hover:bg-complie-accent hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(note.id)}
                        className="hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {note.title && (
                    <h3 className="text-lg font-semibold text-complie-primary mb-2 line-clamp-2">
                      {note.title}
                    </h3>
                  )}
                  <div className="text-sm text-foreground leading-relaxed">
                    {getPreview(note.content)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;