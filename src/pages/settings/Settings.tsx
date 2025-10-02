import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Globe, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  timezone: string;
  email_notifications: {
    updates: boolean;
    marketing: boolean;
    reminders: boolean;
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  trial_start: string;
}

const Settings = () => {
  const [profileData, setProfileData] = useState({
    full_name: '',
    username: ''
  });
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [originalUsername, setOriginalUsername] = useState('');

  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Set profile data when loaded
      if (data) {
        const username = data.username || '';
        setOriginalUsername(username);
        setProfileData({
          full_name: data.full_name || '',
          username: username
        });
      }
      
      return data as Profile;
    },
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? {
        ...data,
        email_notifications: (data.email_notifications as any) || { updates: true, marketing: false, reminders: true }
      } as UserSettings : null;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
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

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          ...data
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: "Settings updated",
        description: "Your settings have been successfully updated.",
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

  const validateUsername = async (username: string) => {
    if (!username) {
      setUsernameError('');
      setUsernameAvailable(false);
      return;
    }
    
    // Only allow letters, numbers, and underscores
    const regex = /^[A-Za-z0-9_]{3,30}$/;
    if (!regex.test(username)) {
      setUsernameError('Username must be 3-30 characters, letters, numbers, and underscores only');
      setUsernameAvailable(false);
      return;
    }

    // If it's the same as the original username, mark as available
    if (username === originalUsername) {
      setUsernameError('');
      setUsernameAvailable(true);
      return;
    }

    setUsernameLoading(true);
    setUsernameError('');
    setUsernameAvailable(false);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .neq('id', user?.id);
      
      if (error) {
        console.error('Error validating username:', error);
        setUsernameError('Error checking username availability');
        return;
      }
      
      if (data && data.length > 0) {
        setUsernameError('Username not available');
        setUsernameAvailable(false);
      } else {
        setUsernameError('');
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error('Error validating username:', error);
      setUsernameError('Error checking username availability');
      setUsernameAvailable(false);
    } finally {
      setUsernameLoading(false);
    }
  };

  // Debounce username validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profileData.username && profileData.username !== originalUsername) {
        validateUsername(profileData.username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [profileData.username]);

  const handleProfileUpdate = () => {
    if (usernameError) {
      toast({
        title: 'Invalid username',
        description: usernameError,
        variant: 'destructive',
      });
      return;
    }
    
    updateProfileMutation.mutate(profileData);
  };

  const handleSettingUpdate = (key: string, value: any) => {
    const currentNotifications = settings?.email_notifications || {
      updates: true,
      marketing: false,
      reminders: true
    };

    let updateData: any = {};

    if (key.startsWith('email_notifications.')) {
      const notificationKey = key.split('.')[1];
      updateData = {
        ...settings,
        email_notifications: {
          ...currentNotifications,
          [notificationKey]: value
        }
      };
    } else {
      updateData = {
        ...settings,
        [key]: value
      };
    }

    updateSettingsMutation.mutate(updateData);
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Badge variant="outline">Basic</Badge>;
      case 'pro':
        return <Badge className="bg-complie-accent text-white">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-gradient-to-r from-complie-accent to-black text-white">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Trial</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-complie-primary">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="card-complie">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg bg-complie-accent text-white">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{profile?.full_name || 'User'}</h3>
                    {profile && getPlanBadge(profile.plan)}
                  </div>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="Your full name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    type="text"
                    placeholder="Choose a username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    disabled={updateProfileMutation.isPending}
                  />
                  {usernameLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking availability...
                    </div>
                  )}
                  {!usernameLoading && usernameError && (
                    <p className="text-sm text-destructive">{usernameError}</p>
                  )}
                  {!usernameLoading && usernameAvailable && !usernameError && profileData.username !== originalUsername && (
                    <p className="text-sm text-green-600">✓ Username is available</p>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleProfileUpdate}
                disabled={updateProfileMutation.isPending || usernameLoading || !!usernameError}
                className="btn-complie-primary"
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Save'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="card-complie">
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Project Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified about project status changes and task completions
                    </div>
                  </div>
                  <Switch
                    checked={settings?.email_notifications?.updates ?? true}
                    onCheckedChange={(checked) => handleSettingUpdate('email_notifications.updates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Receive reminders for upcoming deadlines and tasks
                    </div>
                  </div>
                  <Switch
                    checked={settings?.email_notifications?.reminders ?? true}
                    onCheckedChange={(checked) => handleSettingUpdate('email_notifications.reminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about new features and promotions
                    </div>
                  </div>
                  <Switch
                    checked={settings?.email_notifications?.marketing ?? false}
                    onCheckedChange={(checked) => handleSettingUpdate('email_notifications.marketing', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="card-complie">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <Select 
                    value={settings?.theme || 'light'} 
                    onValueChange={(value) => handleSettingUpdate('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select 
                    value={settings?.language || 'en'} 
                    onValueChange={(value) => handleSettingUpdate('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <Select 
                    value={settings?.timezone || 'UTC'} 
                    onValueChange={(value) => handleSettingUpdate('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="card-complie">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Password</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Change your password to keep your account secure
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Account Deletion</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card className="card-complie">
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Current Plan</h4>
                  <div className="flex items-center gap-4">
                    {profile && getPlanBadge(profile.plan)}
                    <span className="text-sm text-muted-foreground">
                      {profile?.plan === 'basic' ? 'Free plan' : '$9/month'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Subscription</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade your plan to unlock more features and increase limits
                  </p>
                  <Button className="btn-complie-primary">Upgrade Plan</Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Billing History</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and download your billing history and invoices
                  </p>
                  <Button variant="outline">View History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
