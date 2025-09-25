import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
];

const OnboardingCustomize = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [showOptional, setShowOptional] = useState({
    country: false,
    description: false,
  });

  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    countryCode: '',
    shortDescription: '',
  });

  // Redirect if user is already onboarded
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single();
      
      if (data?.onboarded) {
        navigate('/dashboard');
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate]);

  const validateUsername = async (username: string) => {
    if (!username) return;
    
    const regex = /^[A-Za-z0-9_-]{3,30}$/;
    if (!regex.test(username)) {
      setUsernameError('Username must be 3-30 characters, letters, numbers, _ and - only');
      return;
    }

    setUsernameLoading(true);
    setUsernameError('');

    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .neq('id', user?.id);
      
      if (data && data.length > 0) {
        setUsernameError('Username not available');
      }
    } catch (error) {
      console.error('Error validating username:', error);
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.nickname) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in username and nickname',
        variant: 'destructive',
      });
      return;
    }

    if (usernameError) {
      toast({
        title: 'Invalid username',
        description: usernameError,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          nickname: formData.nickname,
          country_code: formData.countryCode || null,
          short_description: formData.shortDescription || null,
          onboarded: true,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Welcome to Complie!',
        description: 'Your profile has been set up successfully.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      
      if (error.code === '23505') {
        toast({
          title: 'Username taken',
          description: 'This username is already in use. Please choose another.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete onboarding. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-complie-primary">
            Customize your experience
          </CardTitle>
          <p className="text-muted-foreground">
            Let&apos;s set up your profile to get started
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-complie-primary">Required Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  onBlur={(e) => validateUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                />
                {usernameLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking availability...
                  </div>
                )}
                {usernameError && (
                  <p className="text-sm text-destructive">{usernameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Display Name *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="How should we call you?"
                  maxLength={30}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-sm text-muted-foreground">Optional Information</h3>
              
              <div className="space-y-3">
                {!showOptional.country ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOptional(prev => ({ ...prev, country: true }))}
                    disabled={loading}
                  >
                    + Add Country
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, countryCode: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!showOptional.description ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOptional(prev => ({ ...prev, description: true }))}
                    disabled={loading}
                  >
                    + Add Bio
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Bio</Label>
                    <Textarea
                      id="description"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                      placeholder="Tell us a bit about yourself..."
                      maxLength={200}
                      rows={3}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.shortDescription.length}/200 characters
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-complie-primary"
              disabled={loading || usernameLoading || !!usernameError || !formData.username || !formData.nickname}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingCustomize;