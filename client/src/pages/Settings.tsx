import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import {
  Bell,
  User,
  Shield,
  Smartphone,
  Mail,
  Moon,
  Volume2,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Your data export will be sent to your email within 24 hours.",
    });
  };

  const handleDeleteAccount = () => {
    // This would typically show a confirmation dialog
    toast({
      title: "Account deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings.
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell size={16} />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <User size={16} />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Volume2 size={16} />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield size={16} />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell size={20} />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-muted-foreground" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive quiz results and progress updates via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Smartphone size={16} className="text-muted-foreground" />
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get study reminders and achievements via SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="study-reminders">Daily Study Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to practice at your preferred time
                    </p>
                  </div>
                  <Switch
                    id="study-reminders"
                    checked={studyReminders}
                    onCheckedChange={setStudyReminders}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="achievement-notifications">Achievement Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Be notified when you unlock new badges and milestones
                    </p>
                  </div>
                  <Switch
                    id="achievement-notifications"
                    checked={achievementNotifications}
                    onCheckedChange={setAchievementNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={user?.firstName || ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={user?.lastName || ''}
                      disabled
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 xxx xxx xxxx"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Contact support to update your phone number
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 size={20} />
                  <span>App Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Volume2 size={16} className="text-muted-foreground" />
                      <Label htmlFor="sound-effects">Sound Effects</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for correct/incorrect answers
                    </p>
                  </div>
                  <Switch
                    id="sound-effects"
                    checked={soundEffects}
                    onCheckedChange={setSoundEffects}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Moon size={16} className="text-muted-foreground" />
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <Separator />

                <div>
                  <Label>Offline Content</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download questions for offline practice
                  </p>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Download size={16} />
                    <span>Manage Offline Content</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield size={20} />
                  <span>Privacy & Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Data Export</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of all your data including quiz history and progress
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    className="flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Export My Data</span>
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label className="text-destructive">Danger Zone</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="text-amber-600" size={20} />
                  <div>
                    <h4 className="font-medium text-amber-800">Privacy Notice</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      We take your privacy seriously. Your data is encrypted and never shared with third parties.
                      For more information, see our Privacy Policy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Save Settings</span>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
