import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileText, Edit, Trash2, Sparkles, BookOpen, Users, Briefcase } from 'lucide-react';
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
}

interface NoteTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  content: string;
}

const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Structured template for capturing meeting discussions and action items',
    icon: Users,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    content: `<h1><strong>📅 Meeting Notes</strong></h1><hr><p><strong>📍 Meeting Details</strong></p><ul><li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li><li><strong>Time:</strong> ${new Date().toLocaleTimeString()}</li><li><strong>Duration:</strong> </li><li><strong>Location/Platform:</strong> </li></ul><p><br></p><h2><strong>👥 Attendees</strong></h2><ul><li>Name - Role</li><li>Name - Role</li><li>Name - Role</li></ul><p><br></p><h2><strong>🎯 Meeting Objectives</strong></h2><blockquote><strong>Primary Goal:</strong> What we aim to achieve today</blockquote><p><br></p><h2><strong>📋 Agenda</strong></h2><ol><li><strong>Opening & Welcome</strong> - 5 mins</li><li><strong>Topic 1:</strong> [Brief description] - 15 mins</li><li><strong>Topic 2:</strong> [Brief description] - 20 mins</li><li><strong>Action Items & Next Steps</strong> - 10 mins</li></ol><p><br></p><h2><strong>💬 Discussion Points</strong></h2><p>🔸 <strong>Key Point 1:</strong> </p><p>🔸 <strong>Key Point 2:</strong> </p><p>🔸 <strong>Key Point 3:</strong> </p><p><br></p><h2><strong>✅ Action Items</strong></h2><table><thead><tr><th><strong>Task</strong></th><th><strong>Assigned To</strong></th><th><strong>Due Date</strong></th><th><strong>Status</strong></th></tr></thead><tbody><tr><td>Task description</td><td>Name</td><td>Date</td><td>🔄 In Progress</td></tr><tr><td>Task description</td><td>Name</td><td>Date</td><td>⏳ Pending</td></tr></tbody></table><p><br></p><h2><strong>🔄 Follow-up</strong></h2><p><strong>Next Meeting:</strong> Date & Time</p><p><strong>Key Decisions Made:</strong> </p><ul><li>Decision 1</li><li>Decision 2</li></ul><p><br></p><p><em>Meeting notes compiled by: [Your Name] on ${new Date().toLocaleDateString()}</em></p>`
  },
  {
    id: 'project-plan',
    title: 'Project Blueprint',
    description: 'Comprehensive project planning with timelines, resources, and risk management',
    icon: Briefcase,
    color: 'bg-green-50 border-green-200 text-green-700',
    content: `<h1><strong>🚀 Project Blueprint</strong></h1><hr><p><strong>📊 Project Overview</strong></p><table><tbody><tr><td><strong>Project Name</strong></td><td>[Project Title]</td></tr><tr><td><strong>Project Manager</strong></td><td>[Your Name]</td></tr><tr><td><strong>Start Date</strong></td><td>${new Date().toLocaleDateString()}</td></tr><tr><td><strong>Target Completion</strong></td><td>[End Date]</td></tr><tr><td><strong>Budget</strong></td><td>$[Amount]</td></tr><tr><td><strong>Priority</strong></td><td>🔴 High / 🟡 Medium / 🟢 Low</td></tr></tbody></table><p><br></p><h2><strong>🎯 Project Vision & Scope</strong></h2><blockquote><strong>Vision Statement:</strong> What success looks like...</blockquote><p><strong>📝 Project Description:</strong></p><p>[Detailed description of what the project will accomplish]</p><p><br></p><p><strong>✅ In Scope:</strong></p><ul><li>Deliverable 1</li><li>Deliverable 2</li><li>Deliverable 3</li></ul><p><strong>❌ Out of Scope:</strong></p><ul><li>What we will NOT include</li><li>Future considerations</li></ul><p><br></p><h2><strong>📈 Success Metrics</strong></h2><ol><li><strong>Primary KPI:</strong> [Metric] - Target: [Value]</li><li><strong>Secondary KPI:</strong> [Metric] - Target: [Value]</li><li><strong>Quality Measure:</strong> [Standard] - Target: [Level]</li></ol><p><br></p><h2><strong>🗓️ Project Timeline</strong></h2><h3><strong>Phase 1: Planning & Setup</strong> 📋</h3><ul><li><strong>Week 1-2:</strong> Requirements gathering</li><li><strong>Week 3:</strong> Resource allocation</li><li><strong>Milestone:</strong> 🎯 Project kickoff complete</li></ul><h3><strong>Phase 2: Development & Implementation</strong> ⚙️</h3><ul><li><strong>Week 4-8:</strong> Core development</li><li><strong>Week 9:</strong> Testing & quality assurance</li><li><strong>Milestone:</strong> 🎯 MVP ready for review</li></ul><h3><strong>Phase 3: Launch & Delivery</strong> 🚀</h3><ul><li><strong>Week 10:</strong> Final preparations</li><li><strong>Week 11:</strong> Go-live</li><li><strong>Milestone:</strong> 🎯 Project successfully delivered</li></ul><p><br></p><h2><strong>👨‍💼 Team & Responsibilities</strong></h2><table><thead><tr><th><strong>Role</strong></th><th><strong>Name</strong></th><th><strong>Key Responsibilities</strong></th><th><strong>Contact</strong></th></tr></thead><tbody><tr><td>Project Manager</td><td>[Name]</td><td>Overall coordination, timeline management</td><td>[Email]</td></tr><tr><td>Developer</td><td>[Name]</td><td>Technical implementation, code quality</td><td>[Email]</td></tr><tr><td>Designer</td><td>[Name]</td><td>UI/UX design, user experience</td><td>[Email]</td></tr></tbody></table><p><br></p><h2><strong>⚠️ Risk Assessment</strong></h2><table><thead><tr><th><strong>Risk</strong></th><th><strong>Impact</strong></th><th><strong>Probability</strong></th><th><strong>Mitigation Strategy</strong></th></tr></thead><tbody><tr><td>Resource availability</td><td>High</td><td>Medium</td><td>Cross-train team members</td></tr><tr><td>Timeline delays</td><td>Medium</td><td>Medium</td><td>Built-in buffer time</td></tr><tr><td>Scope creep</td><td>Medium</td><td>High</td><td>Change control process</td></tr></tbody></table><p><br></p><h2><strong>💰 Budget Breakdown</strong></h2><ul><li><strong>Personnel:</strong> $[Amount] ([%]%)</li><li><strong>Technology & Tools:</strong> $[Amount] ([%]%)</li><li><strong>External Services:</strong> $[Amount] ([%]%)</li><li><strong>Contingency (10%):</strong> $[Amount]</li><li><strong>Total Budget:</strong> $[Total]</li></ul><p><br></p><p><em>Project plan created on ${new Date().toLocaleDateString()} | Next review: [Date]</em></p>`
  },
  {
    id: 'knowledge-base',
    title: 'Knowledge Hub',
    description: 'Comprehensive documentation with searchable procedures and best practices',
    icon: BookOpen,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    content: `<h1><strong>📚 Knowledge Hub Entry</strong></h1><hr><p><strong>📋 Document Information</strong></p><table><tbody><tr><td><strong>Topic</strong></td><td>[Main Subject]</td></tr><tr><td><strong>Category</strong></td><td>🔧 Process | 📖 Reference | 🚨 Troubleshooting | 💡 Best Practice</td></tr><tr><td><strong>Difficulty Level</strong></td><td>🟢 Beginner | 🟡 Intermediate | 🔴 Advanced</td></tr><tr><td><strong>Last Updated</strong></td><td>${new Date().toLocaleDateString()}</td></tr><tr><td><strong>Author</strong></td><td>[Your Name]</td></tr><tr><td><strong>Review Date</strong></td><td>[Next Review Date]</td></tr></tbody></table><p><br></p><h2><strong>📝 Executive Summary</strong></h2><blockquote>Brief 2-3 sentence overview of what this document covers and why it's important...</blockquote><p><br></p><h2><strong>🎯 Learning Objectives</strong></h2><p>After reading this document, you will be able to:</p><ul><li>Understand [concept/process]</li><li>Execute [specific task]</li><li>Apply [best practice]</li></ul><p><br></p><h2><strong>📚 Background & Context</strong></h2><p><strong>Why is this important?</strong></p><p>[Explanation of the business value or technical importance]</p><p><br></p><p><strong>Prerequisites:</strong></p><ul><li>Knowledge of [concept 1]</li><li>Access to [system/tool]</li><li>Understanding of [process]</li></ul><p><br></p><h2><strong>📋 Step-by-Step Process</strong></h2><h3><strong>🚀 Phase 1: Preparation</strong></h3><ol><li><strong>Gather Requirements</strong><ul><li>Document what you need</li><li>Check system prerequisites</li><li>Verify permissions</li></ul></li><li><strong>Set Up Environment</strong><ul><li>Configure necessary tools</li><li>Prepare workspace</li></ul></li></ol><h3><strong>⚙️ Phase 2: Implementation</strong></h3><ol><li><strong>Primary Action</strong><ul><li>Detailed step description</li><li>Expected outcome</li><li>Verification method</li></ul></li><li><strong>Configuration</strong><ul><li>Settings to adjust</li><li>Parameters to set</li></ul></li></ol><h3><strong>✅ Phase 3: Validation</strong></h3><ol><li><strong>Testing</strong><ul><li>How to verify success</li><li>What to look for</li></ul></li><li><strong>Documentation</strong><ul><li>Record changes made</li><li>Update relevant logs</li></ul></li></ol><p><br></p><h2><strong>💡 Pro Tips & Best Practices</strong></h2><blockquote><strong>💡 Tip:</strong> [Helpful shortcut or best practice]</blockquote><blockquote><strong>💡 Tip:</strong> [Time-saving technique]</blockquote><blockquote><strong>💡 Tip:</strong> [Quality improvement advice]</blockquote><p><br></p><h2><strong>🚨 Troubleshooting Guide</strong></h2><h3><strong>Common Issues & Solutions</strong></h3><table><thead><tr><th><strong>Problem</strong></th><th><strong>Possible Cause</strong></th><th><strong>Solution</strong></th></tr></thead><tbody><tr><td>Error message appears</td><td>Missing configuration</td><td>Check settings in step X</td></tr><tr><td>Process fails at step Y</td><td>Permission issue</td><td>Verify user access rights</td></tr><tr><td>Unexpected results</td><td>Data inconsistency</td><td>Validate input parameters</td></tr></tbody></table><p><br></p><h2><strong>📊 Metrics & KPIs</strong></h2><p><strong>How to measure success:</strong></p><ul><li><strong>Performance Metric:</strong> [What to measure] - Target: [Value]</li><li><strong>Quality Metric:</strong> [What to measure] - Target: [Value]</li><li><strong>User Satisfaction:</strong> [How to measure] - Target: [Value]</li></ul><p><br></p><h2><strong>🔗 Related Resources</strong></h2><ul><li><strong>📖 Documentation:</strong> <a href="#" rel="noopener noreferrer" target="_blank">Link to related docs</a></li><li><strong>🎥 Video Tutorial:</strong> <a href="#" rel="noopener noreferrer" target="_blank">Training video link</a></li><li><strong>🛠️ Tools:</strong> <a href="#" rel="noopener noreferrer" target="_blank">Required software/tools</a></li><li><strong>👥 Support:</strong> Contact [Team/Person] for help</li></ul><p><br></p><h2><strong>📝 Revision History</strong></h2><table><thead><tr><th><strong>Date</strong></th><th><strong>Version</strong></th><th><strong>Changes</strong></th><th><strong>Author</strong></th></tr></thead><tbody><tr><td>${new Date().toLocaleDateString()}</td><td>1.0</td><td>Initial document creation</td><td>[Your Name]</td></tr></tbody></table><p><br></p><h2><strong>🏷️ Tags & Keywords</strong></h2><p><code>#documentation</code> <code>#process</code> <code>#[relevant-topic]</code> <code>#[department]</code> <code>#[priority]</code></p><p><br></p><p><em>Document owner: [Your Name] | For questions or updates, contact: [email/slack]</em></p>`
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

  const getPreview = (content: string) => {
    // Strip HTML tags for preview
    const strippedContent = content.replace(/<[^>]*>/g, '');
    return strippedContent.length > 150 ? strippedContent.substring(0, 150) + '...' : strippedContent;
  };

  const createFromTemplate = (template: NoteTemplate) => {
    navigate('/notes/new', { state: { template } });
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
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-complie-accent" />
                      Choose a Template
                    </DialogTitle>
                    <DialogDescription>
                      Start with a professional template to save time and ensure consistency.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
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
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white shadow-sm">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-bold">{template.title}</CardTitle>
                                <CardDescription className="text-sm mt-1">
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
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-complie-accent" />
            <h2 className="text-2xl font-bold text-complie-primary">Quick Start Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NOTE_TEMPLATES.map((template) => {
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
                      <span className="text-sm font-medium text-complie-primary">Click to start</span>
                      <Plus className="h-4 w-4 text-complie-accent group-hover:scale-110 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
                    <div className="flex-1">
                      <CardDescription className="text-sm font-medium text-complie-primary">
                        {format(new Date(note.updated_at), 'MMM d, yyyy at h:mm a')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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