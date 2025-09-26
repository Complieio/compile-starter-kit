import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageCircle, Mail, Users, ExternalLink } from 'lucide-react';

const Help = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold text-primary">Help & Support</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to our help center! This is where you can get support, ask questions about how to use Complie, 
          and connect with other freelancers in our community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Discord Community Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Recommended
              </Badge>
            </div>
            <CardTitle className="text-xl">Join Our Discord Community</CardTitle>
            <CardDescription className="text-base">
              Connect with our team and fellow freelancers in our active Discord server. Get real-time support, 
              share experiences, and build your professional network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Community support & networking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                <span>Direct help from our team</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>Real-time discussions & tips</span>
              </div>
              <Button 
                asChild 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <a 
                  href="https://discord.gg/9HdmMjbQXW" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Join our Discord
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Support Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <Mail className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl">Email Support</CardTitle>
            <CardDescription className="text-base">
              Prefer email? We're here to help through direct email communication for more formal support requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Support Team Email */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">General Support</Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Official Support Team</p>
                      <a 
                        href="mailto:Complie.app@gmail.com" 
                        className="text-primary hover:underline"
                      >
                        Complie.app@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* CEO Email */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Direct Contact</Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">CEO Direct Contact</p>
                      <a 
                        href="mailto:Liana.complie@gmail.com" 
                        className="text-primary hover:underline"
                      >
                        Liana.complie@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Need immediate assistance?</h3>
            <p className="text-muted-foreground">
              For the fastest response, we recommend joining our Discord community where our team and 
              community members are most active. For formal inquiries or detailed support requests, 
              email is the best option.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;