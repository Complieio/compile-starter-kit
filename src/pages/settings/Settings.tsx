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
              <CardTitle>Timezone</CardTitle>
              <CardDescription>
                Select your timezone for accurate scheduling and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium">Select Timezone</label>
                <Select 
                  value={settings?.timezone || 'UTC'} 
                  onValueChange={(value) => handleSettingUpdate('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="Africa/Abidjan">Africa/Abidjan</SelectItem>
                    <SelectItem value="Africa/Accra">Africa/Accra</SelectItem>
                    <SelectItem value="Africa/Addis_Ababa">Africa/Addis Ababa</SelectItem>
                    <SelectItem value="Africa/Algiers">Africa/Algiers</SelectItem>
                    <SelectItem value="Africa/Asmara">Africa/Asmara</SelectItem>
                    <SelectItem value="Africa/Bamako">Africa/Bamako</SelectItem>
                    <SelectItem value="Africa/Bangui">Africa/Bangui</SelectItem>
                    <SelectItem value="Africa/Banjul">Africa/Banjul</SelectItem>
                    <SelectItem value="Africa/Bissau">Africa/Bissau</SelectItem>
                    <SelectItem value="Africa/Blantyre">Africa/Blantyre</SelectItem>
                    <SelectItem value="Africa/Brazzaville">Africa/Brazzaville</SelectItem>
                    <SelectItem value="Africa/Bujumbura">Africa/Bujumbura</SelectItem>
                    <SelectItem value="Africa/Cairo">Africa/Cairo</SelectItem>
                    <SelectItem value="Africa/Casablanca">Africa/Casablanca</SelectItem>
                    <SelectItem value="Africa/Ceuta">Africa/Ceuta</SelectItem>
                    <SelectItem value="Africa/Conakry">Africa/Conakry</SelectItem>
                    <SelectItem value="Africa/Dakar">Africa/Dakar</SelectItem>
                    <SelectItem value="Africa/Dar_es_Salaam">Africa/Dar es Salaam</SelectItem>
                    <SelectItem value="Africa/Djibouti">Africa/Djibouti</SelectItem>
                    <SelectItem value="Africa/Douala">Africa/Douala</SelectItem>
                    <SelectItem value="Africa/El_Aaiun">Africa/El Aaiun</SelectItem>
                    <SelectItem value="Africa/Freetown">Africa/Freetown</SelectItem>
                    <SelectItem value="Africa/Gaborone">Africa/Gaborone</SelectItem>
                    <SelectItem value="Africa/Harare">Africa/Harare</SelectItem>
                    <SelectItem value="Africa/Johannesburg">Africa/Johannesburg</SelectItem>
                    <SelectItem value="Africa/Juba">Africa/Juba</SelectItem>
                    <SelectItem value="Africa/Kampala">Africa/Kampala</SelectItem>
                    <SelectItem value="Africa/Khartoum">Africa/Khartoum</SelectItem>
                    <SelectItem value="Africa/Kigali">Africa/Kigali</SelectItem>
                    <SelectItem value="Africa/Kinshasa">Africa/Kinshasa</SelectItem>
                    <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                    <SelectItem value="Africa/Libreville">Africa/Libreville</SelectItem>
                    <SelectItem value="Africa/Lome">Africa/Lome</SelectItem>
                    <SelectItem value="Africa/Luanda">Africa/Luanda</SelectItem>
                    <SelectItem value="Africa/Lubumbashi">Africa/Lubumbashi</SelectItem>
                    <SelectItem value="Africa/Lusaka">Africa/Lusaka</SelectItem>
                    <SelectItem value="Africa/Malabo">Africa/Malabo</SelectItem>
                    <SelectItem value="Africa/Maputo">Africa/Maputo</SelectItem>
                    <SelectItem value="Africa/Maseru">Africa/Maseru</SelectItem>
                    <SelectItem value="Africa/Mbabane">Africa/Mbabane</SelectItem>
                    <SelectItem value="Africa/Mogadishu">Africa/Mogadishu</SelectItem>
                    <SelectItem value="Africa/Monrovia">Africa/Monrovia</SelectItem>
                    <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                    <SelectItem value="Africa/Ndjamena">Africa/Ndjamena</SelectItem>
                    <SelectItem value="Africa/Niamey">Africa/Niamey</SelectItem>
                    <SelectItem value="Africa/Nouakchott">Africa/Nouakchott</SelectItem>
                    <SelectItem value="Africa/Ouagadougou">Africa/Ouagadougou</SelectItem>
                    <SelectItem value="Africa/Porto-Novo">Africa/Porto-Novo</SelectItem>
                    <SelectItem value="Africa/Sao_Tome">Africa/Sao Tome</SelectItem>
                    <SelectItem value="Africa/Tripoli">Africa/Tripoli</SelectItem>
                    <SelectItem value="Africa/Tunis">Africa/Tunis</SelectItem>
                    <SelectItem value="Africa/Windhoek">Africa/Windhoek</SelectItem>
                    <SelectItem value="America/Adak">America/Adak</SelectItem>
                    <SelectItem value="America/Anchorage">America/Anchorage</SelectItem>
                    <SelectItem value="America/Anguilla">America/Anguilla</SelectItem>
                    <SelectItem value="America/Antigua">America/Antigua</SelectItem>
                    <SelectItem value="America/Araguaina">America/Araguaina</SelectItem>
                    <SelectItem value="America/Argentina/Buenos_Aires">America/Argentina/Buenos Aires</SelectItem>
                    <SelectItem value="America/Argentina/Catamarca">America/Argentina/Catamarca</SelectItem>
                    <SelectItem value="America/Argentina/Cordoba">America/Argentina/Cordoba</SelectItem>
                    <SelectItem value="America/Argentina/Jujuy">America/Argentina/Jujuy</SelectItem>
                    <SelectItem value="America/Argentina/La_Rioja">America/Argentina/La Rioja</SelectItem>
                    <SelectItem value="America/Argentina/Mendoza">America/Argentina/Mendoza</SelectItem>
                    <SelectItem value="America/Argentina/Rio_Gallegos">America/Argentina/Rio Gallegos</SelectItem>
                    <SelectItem value="America/Argentina/Salta">America/Argentina/Salta</SelectItem>
                    <SelectItem value="America/Argentina/San_Juan">America/Argentina/San Juan</SelectItem>
                    <SelectItem value="America/Argentina/San_Luis">America/Argentina/San Luis</SelectItem>
                    <SelectItem value="America/Argentina/Tucuman">America/Argentina/Tucuman</SelectItem>
                    <SelectItem value="America/Argentina/Ushuaia">America/Argentina/Ushuaia</SelectItem>
                    <SelectItem value="America/Aruba">America/Aruba</SelectItem>
                    <SelectItem value="America/Asuncion">America/Asuncion</SelectItem>
                    <SelectItem value="America/Atikokan">America/Atikokan</SelectItem>
                    <SelectItem value="America/Bahia">America/Bahia</SelectItem>
                    <SelectItem value="America/Bahia_Banderas">America/Bahia Banderas</SelectItem>
                    <SelectItem value="America/Barbados">America/Barbados</SelectItem>
                    <SelectItem value="America/Belem">America/Belem</SelectItem>
                    <SelectItem value="America/Belize">America/Belize</SelectItem>
                    <SelectItem value="America/Blanc-Sablon">America/Blanc-Sablon</SelectItem>
                    <SelectItem value="America/Boa_Vista">America/Boa Vista</SelectItem>
                    <SelectItem value="America/Bogota">America/Bogota</SelectItem>
                    <SelectItem value="America/Boise">America/Boise</SelectItem>
                    <SelectItem value="America/Cambridge_Bay">America/Cambridge Bay</SelectItem>
                    <SelectItem value="America/Campo_Grande">America/Campo Grande</SelectItem>
                    <SelectItem value="America/Cancun">America/Cancun</SelectItem>
                    <SelectItem value="America/Caracas">America/Caracas</SelectItem>
                    <SelectItem value="America/Cayenne">America/Cayenne</SelectItem>
                    <SelectItem value="America/Cayman">America/Cayman</SelectItem>
                    <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                    <SelectItem value="America/Chihuahua">America/Chihuahua</SelectItem>
                    <SelectItem value="America/Ciudad_Juarez">America/Ciudad Juarez</SelectItem>
                    <SelectItem value="America/Costa_Rica">America/Costa Rica</SelectItem>
                    <SelectItem value="America/Creston">America/Creston</SelectItem>
                    <SelectItem value="America/Cuiaba">America/Cuiaba</SelectItem>
                    <SelectItem value="America/Curacao">America/Curacao</SelectItem>
                    <SelectItem value="America/Danmarkshavn">America/Danmarkshavn</SelectItem>
                    <SelectItem value="America/Dawson">America/Dawson</SelectItem>
                    <SelectItem value="America/Dawson_Creek">America/Dawson Creek</SelectItem>
                    <SelectItem value="America/Denver">America/Denver</SelectItem>
                    <SelectItem value="America/Detroit">America/Detroit</SelectItem>
                    <SelectItem value="America/Dominica">America/Dominica</SelectItem>
                    <SelectItem value="America/Edmonton">America/Edmonton</SelectItem>
                    <SelectItem value="America/Eirunepe">America/Eirunepe</SelectItem>
                    <SelectItem value="America/El_Salvador">America/El Salvador</SelectItem>
                    <SelectItem value="America/Fort_Nelson">America/Fort Nelson</SelectItem>
                    <SelectItem value="America/Fortaleza">America/Fortaleza</SelectItem>
                    <SelectItem value="America/Glace_Bay">America/Glace Bay</SelectItem>
                    <SelectItem value="America/Goose_Bay">America/Goose Bay</SelectItem>
                    <SelectItem value="America/Grand_Turk">America/Grand Turk</SelectItem>
                    <SelectItem value="America/Grenada">America/Grenada</SelectItem>
                    <SelectItem value="America/Guadeloupe">America/Guadeloupe</SelectItem>
                    <SelectItem value="America/Guatemala">America/Guatemala</SelectItem>
                    <SelectItem value="America/Guayaquil">America/Guayaquil</SelectItem>
                    <SelectItem value="America/Guyana">America/Guyana</SelectItem>
                    <SelectItem value="America/Halifax">America/Halifax</SelectItem>
                    <SelectItem value="America/Havana">America/Havana</SelectItem>
                    <SelectItem value="America/Hermosillo">America/Hermosillo</SelectItem>
                    <SelectItem value="America/Indiana/Indianapolis">America/Indiana/Indianapolis</SelectItem>
                    <SelectItem value="America/Indiana/Knox">America/Indiana/Knox</SelectItem>
                    <SelectItem value="America/Indiana/Marengo">America/Indiana/Marengo</SelectItem>
                    <SelectItem value="America/Indiana/Petersburg">America/Indiana/Petersburg</SelectItem>
                    <SelectItem value="America/Indiana/Tell_City">America/Indiana/Tell City</SelectItem>
                    <SelectItem value="America/Indiana/Vevay">America/Indiana/Vevay</SelectItem>
                    <SelectItem value="America/Indiana/Vincennes">America/Indiana/Vincennes</SelectItem>
                    <SelectItem value="America/Indiana/Winamac">America/Indiana/Winamac</SelectItem>
                    <SelectItem value="America/Inuvik">America/Inuvik</SelectItem>
                    <SelectItem value="America/Iqaluit">America/Iqaluit</SelectItem>
                    <SelectItem value="America/Jamaica">America/Jamaica</SelectItem>
                    <SelectItem value="America/Juneau">America/Juneau</SelectItem>
                    <SelectItem value="America/Kentucky/Louisville">America/Kentucky/Louisville</SelectItem>
                    <SelectItem value="America/Kentucky/Monticello">America/Kentucky/Monticello</SelectItem>
                    <SelectItem value="America/Kralendijk">America/Kralendijk</SelectItem>
                    <SelectItem value="America/La_Paz">America/La Paz</SelectItem>
                    <SelectItem value="America/Lima">America/Lima</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                    <SelectItem value="America/Lower_Princes">America/Lower Princes</SelectItem>
                    <SelectItem value="America/Maceio">America/Maceio</SelectItem>
                    <SelectItem value="America/Managua">America/Managua</SelectItem>
                    <SelectItem value="America/Manaus">America/Manaus</SelectItem>
                    <SelectItem value="America/Marigot">America/Marigot</SelectItem>
                    <SelectItem value="America/Martinique">America/Martinique</SelectItem>
                    <SelectItem value="America/Matamoros">America/Matamoros</SelectItem>
                    <SelectItem value="America/Mazatlan">America/Mazatlan</SelectItem>
                    <SelectItem value="America/Menominee">America/Menominee</SelectItem>
                    <SelectItem value="America/Merida">America/Merida</SelectItem>
                    <SelectItem value="America/Metlakatla">America/Metlakatla</SelectItem>
                    <SelectItem value="America/Mexico_City">America/Mexico City</SelectItem>
                    <SelectItem value="America/Miquelon">America/Miquelon</SelectItem>
                    <SelectItem value="America/Moncton">America/Moncton</SelectItem>
                    <SelectItem value="America/Monterrey">America/Monterrey</SelectItem>
                    <SelectItem value="America/Montevideo">America/Montevideo</SelectItem>
                    <SelectItem value="America/Montserrat">America/Montserrat</SelectItem>
                    <SelectItem value="America/Nassau">America/Nassau</SelectItem>
                    <SelectItem value="America/New_York">America/New York</SelectItem>
                    <SelectItem value="America/Nome">America/Nome</SelectItem>
                    <SelectItem value="America/Noronha">America/Noronha</SelectItem>
                    <SelectItem value="America/North_Dakota/Beulah">America/North Dakota/Beulah</SelectItem>
                    <SelectItem value="America/North_Dakota/Center">America/North Dakota/Center</SelectItem>
                    <SelectItem value="America/North_Dakota/New_Salem">America/North Dakota/New Salem</SelectItem>
                    <SelectItem value="America/Nuuk">America/Nuuk</SelectItem>
                    <SelectItem value="America/Ojinaga">America/Ojinaga</SelectItem>
                    <SelectItem value="America/Panama">America/Panama</SelectItem>
                    <SelectItem value="America/Paramaribo">America/Paramaribo</SelectItem>
                    <SelectItem value="America/Phoenix">America/Phoenix</SelectItem>
                    <SelectItem value="America/Port-au-Prince">America/Port-au-Prince</SelectItem>
                    <SelectItem value="America/Port_of_Spain">America/Port of Spain</SelectItem>
                    <SelectItem value="America/Porto_Velho">America/Porto Velho</SelectItem>
                    <SelectItem value="America/Puerto_Rico">America/Puerto Rico</SelectItem>
                    <SelectItem value="America/Punta_Arenas">America/Punta Arenas</SelectItem>
                    <SelectItem value="America/Rankin_Inlet">America/Rankin Inlet</SelectItem>
                    <SelectItem value="America/Recife">America/Recife</SelectItem>
                    <SelectItem value="America/Regina">America/Regina</SelectItem>
                    <SelectItem value="America/Resolute">America/Resolute</SelectItem>
                    <SelectItem value="America/Rio_Branco">America/Rio Branco</SelectItem>
                    <SelectItem value="America/Santarem">America/Santarem</SelectItem>
                    <SelectItem value="America/Santiago">America/Santiago</SelectItem>
                    <SelectItem value="America/Santo_Domingo">America/Santo Domingo</SelectItem>
                    <SelectItem value="America/Sao_Paulo">America/Sao Paulo</SelectItem>
                    <SelectItem value="America/Scoresbysund">America/Scoresbysund</SelectItem>
                    <SelectItem value="America/Sitka">America/Sitka</SelectItem>
                    <SelectItem value="America/St_Barthelemy">America/St Barthelemy</SelectItem>
                    <SelectItem value="America/St_Johns">America/St Johns</SelectItem>
                    <SelectItem value="America/St_Kitts">America/St Kitts</SelectItem>
                    <SelectItem value="America/St_Lucia">America/St Lucia</SelectItem>
                    <SelectItem value="America/St_Thomas">America/St Thomas</SelectItem>
                    <SelectItem value="America/St_Vincent">America/St Vincent</SelectItem>
                    <SelectItem value="America/Swift_Current">America/Swift Current</SelectItem>
                    <SelectItem value="America/Tegucigalpa">America/Tegucigalpa</SelectItem>
                    <SelectItem value="America/Thule">America/Thule</SelectItem>
                    <SelectItem value="America/Tijuana">America/Tijuana</SelectItem>
                    <SelectItem value="America/Toronto">America/Toronto</SelectItem>
                    <SelectItem value="America/Tortola">America/Tortola</SelectItem>
                    <SelectItem value="America/Vancouver">America/Vancouver</SelectItem>
                    <SelectItem value="America/Whitehorse">America/Whitehorse</SelectItem>
                    <SelectItem value="America/Winnipeg">America/Winnipeg</SelectItem>
                    <SelectItem value="America/Yakutat">America/Yakutat</SelectItem>
                    <SelectItem value="America/Yellowknife">America/Yellowknife</SelectItem>
                    <SelectItem value="Antarctica/Casey">Antarctica/Casey</SelectItem>
                    <SelectItem value="Antarctica/Davis">Antarctica/Davis</SelectItem>
                    <SelectItem value="Antarctica/DumontDUrville">Antarctica/DumontDUrville</SelectItem>
                    <SelectItem value="Antarctica/Macquarie">Antarctica/Macquarie</SelectItem>
                    <SelectItem value="Antarctica/Mawson">Antarctica/Mawson</SelectItem>
                    <SelectItem value="Antarctica/McMurdo">Antarctica/McMurdo</SelectItem>
                    <SelectItem value="Antarctica/Palmer">Antarctica/Palmer</SelectItem>
                    <SelectItem value="Antarctica/Rothera">Antarctica/Rothera</SelectItem>
                    <SelectItem value="Antarctica/Syowa">Antarctica/Syowa</SelectItem>
                    <SelectItem value="Antarctica/Troll">Antarctica/Troll</SelectItem>
                    <SelectItem value="Antarctica/Vostok">Antarctica/Vostok</SelectItem>
                    <SelectItem value="Arctic/Longyearbyen">Arctic/Longyearbyen</SelectItem>
                    <SelectItem value="Asia/Aden">Asia/Aden</SelectItem>
                    <SelectItem value="Asia/Almaty">Asia/Almaty</SelectItem>
                    <SelectItem value="Asia/Amman">Asia/Amman</SelectItem>
                    <SelectItem value="Asia/Anadyr">Asia/Anadyr</SelectItem>
                    <SelectItem value="Asia/Aqtau">Asia/Aqtau</SelectItem>
                    <SelectItem value="Asia/Aqtobe">Asia/Aqtobe</SelectItem>
                    <SelectItem value="Asia/Ashgabat">Asia/Ashgabat</SelectItem>
                    <SelectItem value="Asia/Atyrau">Asia/Atyrau</SelectItem>
                    <SelectItem value="Asia/Baghdad">Asia/Baghdad</SelectItem>
                    <SelectItem value="Asia/Bahrain">Asia/Bahrain</SelectItem>
                    <SelectItem value="Asia/Baku">Asia/Baku</SelectItem>
                    <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                    <SelectItem value="Asia/Barnaul">Asia/Barnaul</SelectItem>
                    <SelectItem value="Asia/Beirut">Asia/Beirut</SelectItem>
                    <SelectItem value="Asia/Bishkek">Asia/Bishkek</SelectItem>
                    <SelectItem value="Asia/Brunei">Asia/Brunei</SelectItem>
                    <SelectItem value="Asia/Chita">Asia/Chita</SelectItem>
                    <SelectItem value="Asia/Choibalsan">Asia/Choibalsan</SelectItem>
                    <SelectItem value="Asia/Colombo">Asia/Colombo</SelectItem>
                    <SelectItem value="Asia/Damascus">Asia/Damascus</SelectItem>
                    <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                    <SelectItem value="Asia/Dili">Asia/Dili</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                    <SelectItem value="Asia/Dushanbe">Asia/Dushanbe</SelectItem>
                    <SelectItem value="Asia/Famagusta">Asia/Famagusta</SelectItem>
                    <SelectItem value="Asia/Gaza">Asia/Gaza</SelectItem>
                    <SelectItem value="Asia/Hebron">Asia/Hebron</SelectItem>
                    <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh</SelectItem>
                    <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong</SelectItem>
                    <SelectItem value="Asia/Hovd">Asia/Hovd</SelectItem>
                    <SelectItem value="Asia/Irkutsk">Asia/Irkutsk</SelectItem>
                    <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                    <SelectItem value="Asia/Jayapura">Asia/Jayapura</SelectItem>
                    <SelectItem value="Asia/Jerusalem">Asia/Jerusalem</SelectItem>
                    <SelectItem value="Asia/Kabul">Asia/Kabul</SelectItem>
                    <SelectItem value="Asia/Kamchatka">Asia/Kamchatka</SelectItem>
                    <SelectItem value="Asia/Karachi">Asia/Karachi</SelectItem>
                    <SelectItem value="Asia/Kathmandu">Asia/Kathmandu</SelectItem>
                    <SelectItem value="Asia/Khandyga">Asia/Khandyga</SelectItem>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                    <SelectItem value="Asia/Krasnoyarsk">Asia/Krasnoyarsk</SelectItem>
                    <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur</SelectItem>
                    <SelectItem value="Asia/Kuching">Asia/Kuching</SelectItem>
                    <SelectItem value="Asia/Kuwait">Asia/Kuwait</SelectItem>
                    <SelectItem value="Asia/Macau">Asia/Macau</SelectItem>
                    <SelectItem value="Asia/Magadan">Asia/Magadan</SelectItem>
                    <SelectItem value="Asia/Makassar">Asia/Makassar</SelectItem>
                    <SelectItem value="Asia/Manila">Asia/Manila</SelectItem>
                    <SelectItem value="Asia/Muscat">Asia/Muscat</SelectItem>
                    <SelectItem value="Asia/Nicosia">Asia/Nicosia</SelectItem>
                    <SelectItem value="Asia/Novokuznetsk">Asia/Novokuznetsk</SelectItem>
                    <SelectItem value="Asia/Novosibirsk">Asia/Novosibirsk</SelectItem>
                    <SelectItem value="Asia/Omsk">Asia/Omsk</SelectItem>
                    <SelectItem value="Asia/Oral">Asia/Oral</SelectItem>
                    <SelectItem value="Asia/Phnom_Penh">Asia/Phnom Penh</SelectItem>
                    <SelectItem value="Asia/Pontianak">Asia/Pontianak</SelectItem>
                    <SelectItem value="Asia/Pyongyang">Asia/Pyongyang</SelectItem>
                    <SelectItem value="Asia/Qatar">Asia/Qatar</SelectItem>
                    <SelectItem value="Asia/Qostanay">Asia/Qostanay</SelectItem>
                    <SelectItem value="Asia/Qyzylorda">Asia/Qyzylorda</SelectItem>
                    <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                    <SelectItem value="Asia/Sakhalin">Asia/Sakhalin</SelectItem>
                    <SelectItem value="Asia/Samarkand">Asia/Samarkand</SelectItem>
                    <SelectItem value="Asia/Seoul">Asia/Seoul</SelectItem>
                    <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                    <SelectItem value="Asia/Srednekolymsk">Asia/Srednekolymsk</SelectItem>
                    <SelectItem value="Asia/Taipei">Asia/Taipei</SelectItem>
                    <SelectItem value="Asia/Tashkent">Asia/Tashkent</SelectItem>
                    <SelectItem value="Asia/Tbilisi">Asia/Tbilisi</SelectItem>
                    <SelectItem value="Asia/Tehran">Asia/Tehran</SelectItem>
                    <SelectItem value="Asia/Thimphu">Asia/Thimphu</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    <SelectItem value="Asia/Tomsk">Asia/Tomsk</SelectItem>
                    <SelectItem value="Asia/Ulaanbaatar">Asia/Ulaanbaatar</SelectItem>
                    <SelectItem value="Asia/Urumqi">Asia/Urumqi</SelectItem>
                    <SelectItem value="Asia/Ust-Nera">Asia/Ust-Nera</SelectItem>
                    <SelectItem value="Asia/Vientiane">Asia/Vientiane</SelectItem>
                    <SelectItem value="Asia/Vladivostok">Asia/Vladivostok</SelectItem>
                    <SelectItem value="Asia/Yakutsk">Asia/Yakutsk</SelectItem>
                    <SelectItem value="Asia/Yangon">Asia/Yangon</SelectItem>
                    <SelectItem value="Asia/Yekaterinburg">Asia/Yekaterinburg</SelectItem>
                    <SelectItem value="Asia/Yerevan">Asia/Yerevan</SelectItem>
                    <SelectItem value="Atlantic/Azores">Atlantic/Azores</SelectItem>
                    <SelectItem value="Atlantic/Bermuda">Atlantic/Bermuda</SelectItem>
                    <SelectItem value="Atlantic/Canary">Atlantic/Canary</SelectItem>
                    <SelectItem value="Atlantic/Cape_Verde">Atlantic/Cape Verde</SelectItem>
                    <SelectItem value="Atlantic/Faroe">Atlantic/Faroe</SelectItem>
                    <SelectItem value="Atlantic/Madeira">Atlantic/Madeira</SelectItem>
                    <SelectItem value="Atlantic/Reykjavik">Atlantic/Reykjavik</SelectItem>
                    <SelectItem value="Atlantic/South_Georgia">Atlantic/South Georgia</SelectItem>
                    <SelectItem value="Atlantic/St_Helena">Atlantic/St Helena</SelectItem>
                    <SelectItem value="Atlantic/Stanley">Atlantic/Stanley</SelectItem>
                    <SelectItem value="Australia/Adelaide">Australia/Adelaide</SelectItem>
                    <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                    <SelectItem value="Australia/Broken_Hill">Australia/Broken Hill</SelectItem>
                    <SelectItem value="Australia/Darwin">Australia/Darwin</SelectItem>
                    <SelectItem value="Australia/Eucla">Australia/Eucla</SelectItem>
                    <SelectItem value="Australia/Hobart">Australia/Hobart</SelectItem>
                    <SelectItem value="Australia/Lindeman">Australia/Lindeman</SelectItem>
                    <SelectItem value="Australia/Lord_Howe">Australia/Lord Howe</SelectItem>
                    <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                    <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                    <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                    <SelectItem value="Europe/Amsterdam">Europe/Amsterdam</SelectItem>
                    <SelectItem value="Europe/Andorra">Europe/Andorra</SelectItem>
                    <SelectItem value="Europe/Astrakhan">Europe/Astrakhan</SelectItem>
                    <SelectItem value="Europe/Athens">Europe/Athens</SelectItem>
                    <SelectItem value="Europe/Belgrade">Europe/Belgrade</SelectItem>
                    <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                    <SelectItem value="Europe/Bratislava">Europe/Bratislava</SelectItem>
                    <SelectItem value="Europe/Brussels">Europe/Brussels</SelectItem>
                    <SelectItem value="Europe/Bucharest">Europe/Bucharest</SelectItem>
                    <SelectItem value="Europe/Budapest">Europe/Budapest</SelectItem>
                    <SelectItem value="Europe/Busingen">Europe/Busingen</SelectItem>
                    <SelectItem value="Europe/Chisinau">Europe/Chisinau</SelectItem>
                    <SelectItem value="Europe/Copenhagen">Europe/Copenhagen</SelectItem>
                    <SelectItem value="Europe/Dublin">Europe/Dublin</SelectItem>
                    <SelectItem value="Europe/Gibraltar">Europe/Gibraltar</SelectItem>
                    <SelectItem value="Europe/Guernsey">Europe/Guernsey</SelectItem>
                    <SelectItem value="Europe/Helsinki">Europe/Helsinki</SelectItem>
                    <SelectItem value="Europe/Isle_of_Man">Europe/Isle of Man</SelectItem>
                    <SelectItem value="Europe/Istanbul">Europe/Istanbul</SelectItem>
                    <SelectItem value="Europe/Jersey">Europe/Jersey</SelectItem>
                    <SelectItem value="Europe/Kaliningrad">Europe/Kaliningrad</SelectItem>
                    <SelectItem value="Europe/Kirov">Europe/Kirov</SelectItem>
                    <SelectItem value="Europe/Kyiv">Europe/Kyiv</SelectItem>
                    <SelectItem value="Europe/Lisbon">Europe/Lisbon</SelectItem>
                    <SelectItem value="Europe/Ljubljana">Europe/Ljubljana</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Europe/Luxembourg">Europe/Luxembourg</SelectItem>
                    <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                    <SelectItem value="Europe/Malta">Europe/Malta</SelectItem>
                    <SelectItem value="Europe/Mariehamn">Europe/Mariehamn</SelectItem>
                    <SelectItem value="Europe/Minsk">Europe/Minsk</SelectItem>
                    <SelectItem value="Europe/Monaco">Europe/Monaco</SelectItem>
                    <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                    <SelectItem value="Europe/Oslo">Europe/Oslo</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    <SelectItem value="Europe/Podgorica">Europe/Podgorica</SelectItem>
                    <SelectItem value="Europe/Prague">Europe/Prague</SelectItem>
                    <SelectItem value="Europe/Riga">Europe/Riga</SelectItem>
                    <SelectItem value="Europe/Rome">Europe/Rome</SelectItem>
                    <SelectItem value="Europe/Samara">Europe/Samara</SelectItem>
                    <SelectItem value="Europe/San_Marino">Europe/San Marino</SelectItem>
                    <SelectItem value="Europe/Sarajevo">Europe/Sarajevo</SelectItem>
                    <SelectItem value="Europe/Saratov">Europe/Saratov</SelectItem>
                    <SelectItem value="Europe/Simferopol">Europe/Simferopol</SelectItem>
                    <SelectItem value="Europe/Skopje">Europe/Skopje</SelectItem>
                    <SelectItem value="Europe/Sofia">Europe/Sofia</SelectItem>
                    <SelectItem value="Europe/Stockholm">Europe/Stockholm</SelectItem>
                    <SelectItem value="Europe/Tallinn">Europe/Tallinn</SelectItem>
                    <SelectItem value="Europe/Tirane">Europe/Tirane</SelectItem>
                    <SelectItem value="Europe/Ulyanovsk">Europe/Ulyanovsk</SelectItem>
                    <SelectItem value="Europe/Vaduz">Europe/Vaduz</SelectItem>
                    <SelectItem value="Europe/Vatican">Europe/Vatican</SelectItem>
                    <SelectItem value="Europe/Vienna">Europe/Vienna</SelectItem>
                    <SelectItem value="Europe/Vilnius">Europe/Vilnius</SelectItem>
                    <SelectItem value="Europe/Volgograd">Europe/Volgograd</SelectItem>
                    <SelectItem value="Europe/Warsaw">Europe/Warsaw</SelectItem>
                    <SelectItem value="Europe/Zagreb">Europe/Zagreb</SelectItem>
                    <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                    <SelectItem value="Indian/Antananarivo">Indian/Antananarivo</SelectItem>
                    <SelectItem value="Indian/Chagos">Indian/Chagos</SelectItem>
                    <SelectItem value="Indian/Christmas">Indian/Christmas</SelectItem>
                    <SelectItem value="Indian/Cocos">Indian/Cocos</SelectItem>
                    <SelectItem value="Indian/Comoro">Indian/Comoro</SelectItem>
                    <SelectItem value="Indian/Kerguelen">Indian/Kerguelen</SelectItem>
                    <SelectItem value="Indian/Mahe">Indian/Mahe</SelectItem>
                    <SelectItem value="Indian/Maldives">Indian/Maldives</SelectItem>
                    <SelectItem value="Indian/Mauritius">Indian/Mauritius</SelectItem>
                    <SelectItem value="Indian/Mayotte">Indian/Mayotte</SelectItem>
                    <SelectItem value="Indian/Reunion">Indian/Reunion</SelectItem>
                    <SelectItem value="Pacific/Apia">Pacific/Apia</SelectItem>
                    <SelectItem value="Pacific/Auckland">Pacific/Auckland</SelectItem>
                    <SelectItem value="Pacific/Bougainville">Pacific/Bougainville</SelectItem>
                    <SelectItem value="Pacific/Chatham">Pacific/Chatham</SelectItem>
                    <SelectItem value="Pacific/Chuuk">Pacific/Chuuk</SelectItem>
                    <SelectItem value="Pacific/Easter">Pacific/Easter</SelectItem>
                    <SelectItem value="Pacific/Efate">Pacific/Efate</SelectItem>
                    <SelectItem value="Pacific/Fakaofo">Pacific/Fakaofo</SelectItem>
                    <SelectItem value="Pacific/Fiji">Pacific/Fiji</SelectItem>
                    <SelectItem value="Pacific/Funafuti">Pacific/Funafuti</SelectItem>
                    <SelectItem value="Pacific/Galapagos">Pacific/Galapagos</SelectItem>
                    <SelectItem value="Pacific/Gambier">Pacific/Gambier</SelectItem>
                    <SelectItem value="Pacific/Guadalcanal">Pacific/Guadalcanal</SelectItem>
                    <SelectItem value="Pacific/Guam">Pacific/Guam</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Pacific/Honolulu</SelectItem>
                    <SelectItem value="Pacific/Kanton">Pacific/Kanton</SelectItem>
                    <SelectItem value="Pacific/Kiritimati">Pacific/Kiritimati</SelectItem>
                    <SelectItem value="Pacific/Kosrae">Pacific/Kosrae</SelectItem>
                    <SelectItem value="Pacific/Kwajalein">Pacific/Kwajalein</SelectItem>
                    <SelectItem value="Pacific/Majuro">Pacific/Majuro</SelectItem>
                    <SelectItem value="Pacific/Marquesas">Pacific/Marquesas</SelectItem>
                    <SelectItem value="Pacific/Midway">Pacific/Midway</SelectItem>
                    <SelectItem value="Pacific/Nauru">Pacific/Nauru</SelectItem>
                    <SelectItem value="Pacific/Niue">Pacific/Niue</SelectItem>
                    <SelectItem value="Pacific/Norfolk">Pacific/Norfolk</SelectItem>
                    <SelectItem value="Pacific/Noumea">Pacific/Noumea</SelectItem>
                    <SelectItem value="Pacific/Pago_Pago">Pacific/Pago Pago</SelectItem>
                    <SelectItem value="Pacific/Palau">Pacific/Palau</SelectItem>
                    <SelectItem value="Pacific/Pitcairn">Pacific/Pitcairn</SelectItem>
                    <SelectItem value="Pacific/Pohnpei">Pacific/Pohnpei</SelectItem>
                    <SelectItem value="Pacific/Port_Moresby">Pacific/Port Moresby</SelectItem>
                    <SelectItem value="Pacific/Rarotonga">Pacific/Rarotonga</SelectItem>
                    <SelectItem value="Pacific/Saipan">Pacific/Saipan</SelectItem>
                    <SelectItem value="Pacific/Tahiti">Pacific/Tahiti</SelectItem>
                    <SelectItem value="Pacific/Tarawa">Pacific/Tarawa</SelectItem>
                    <SelectItem value="Pacific/Tongatapu">Pacific/Tongatapu</SelectItem>
                    <SelectItem value="Pacific/Wake">Pacific/Wake</SelectItem>
                    <SelectItem value="Pacific/Wallis">Pacific/Wallis</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
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
