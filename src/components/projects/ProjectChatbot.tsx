import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User, AlertTriangle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ProjectChatbotProps {
  projectId: string;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  tokens_used: number;
  created_at: string;
}

export function ProjectChatbot({ projectId }: ProjectChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const suggestedPrompts = [
    "What documents do I need for tax compliance?",
    "How should I structure my project timeline?",
    "What are the key compliance requirements for my industry?",
    "How do I handle client contracts effectively?",
    "What's the best way to track project expenses?",
  ];

  useEffect(() => {
    loadChatHistory();
  }, [projectId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || currentMessage.trim();
    if (!text || isLoading || !user) return;

    setCurrentMessage('');
    setIsLoading(true);

    // Add user message optimistically
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      message: text,
      response: '',
      tokens_used: 0,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: text,
          project_id: projectId,
        },
      });

      if (error) throw error;

      // Remove temp message and add real message
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      
      const realMessage: ChatMessage = {
        id: data.id,
        message: text,
        response: data.response,
        tokens_used: data.tokens_used,
        created_at: data.created_at,
      };
      
      setMessages(prev => [...prev, realMessage]);

      toast({
        title: "Response received",
        description: `Used ${data.tokens_used} tokens`,
      });
    } catch (error: any) {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      
      toast({
        title: "Chat error",
        description: error.message || "Failed to get response from AI assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingHistory) {
    return (
      <Card className="card-complie">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-complie">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-complie-accent to-black rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Complie Assistant
                <Badge variant="secondary" className="text-xs">GPT-3.5</Badge>
              </CardTitle>
              <CardDescription>
                Get help with freelancing, compliance, and project management
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Disclaimer</p>
                <p className="text-yellow-700">
                  Mainly for guidance on freelancing, compliance, taxes, and deadlines. 
                  Not professional legal advice. Always consult with qualified professionals 
                  for specific legal or financial matters.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="border rounded-lg">
            <ScrollArea className="h-96 p-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ask me anything about freelancing, compliance, or project management
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Try these suggestions:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => sendMessage(prompt)}
                          disabled={isLoading}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      {/* User Message */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-complie-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>

                      {/* AI Response */}
                      {msg.response && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-complie-accent to-black rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 bg-blue-50 rounded-lg p-3">
                            <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                {msg.tokens_used} tokens
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-complie-accent to-black rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>

          {/* Suggested Prompts (when no messages) */}
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Suggested questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-3 whitespace-normal"
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your project..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !currentMessage.trim()}
              className="btn-complie-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}