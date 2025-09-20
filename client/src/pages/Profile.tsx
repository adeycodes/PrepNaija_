import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useOffline } from "@/hooks/useOffline";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { SUBJECTS, EXAM_TYPES } from "@/utils/constants";
import { 
  User, 
  Phone, 
  Mail, 
  BookOpen, 
  Target, 
  Download,
  Wifi,
  WifiOff,
  Settings,
  Save,
  MessageSquare
} from "lucide-react";

interface ProfileFormData {
  fullName: string;
  phone: string;
  selectedSubjects: string[];
  targetExam: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { 
    cacheStats, 
    cacheQuestionsForSubject, 
    cacheAllSubjects, 
    isCaching, 
    isOnline,
    getCachedCount,
    getTotalCachedCount 
  } = useOffline();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.profile?.fullName || "",
      phone: user?.profile?.phone || "",
      selectedSubjects: user?.profile?.selectedSubjects || [],
      targetExam: user?.profile?.targetExam || "JAMB",
    }
  });

  // Update form when user data loads
  useEffect(() => {
    if (user?.profile) {
      setValue("fullName", user.profile.fullName || "");
      setValue("phone", user.profile.phone || "");
      setValue("selectedSubjects", user.profile.selectedSubjects || []);
      setValue("targetExam", user.profile.targetExam || "JAMB");
    }
  }, [user, setValue]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileFormData) => {
      const response = await apiFetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Your session has expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/sms/reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Study reminder sent to your phone!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Your session has expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      
      toast({
        title: "SMS Failed",
        description: "Failed to send SMS reminder. Please check your phone number.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleSubjectToggle = (subject: string, checked: boolean) => {
    const currentSubjects = watch("selectedSubjects");
    if (checked) {
      setValue("selectedSubjects", [...currentSubjects, subject]);
    } else {
      setValue("selectedSubjects", currentSubjects.filter(s => s !== subject));
    }
  };

  const selectedSubjects = watch("selectedSubjects");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalCachedQuestions = getTotalCachedCount();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-profile-title">
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account and study preferences
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="button-back-dashboard"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      {...register("fullName", { required: "Full name is required" })}
                      placeholder="Enter your full name"
                      data-testid="input-full-name"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                      data-testid="input-email"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register("phone", { 
                        pattern: {
                          value: /^(\+234|0)[789][01]\d{8}$/,
                          message: "Please enter a valid Nigerian phone number"
                        }
                      })}
                      placeholder="080xxxxxxxx or +234xxxxxxxxx"
                      data-testid="input-phone"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Required for SMS study reminders
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="targetExam">Target Exam</Label>
                    <Select
                      value={watch("targetExam")}
                      onValueChange={(value) => setValue("targetExam", value)}
                    >
                      <SelectTrigger data-testid="select-target-exam">
                        <SelectValue placeholder="Select your target exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAM_TYPES.map((exam) => (
                          <SelectItem key={exam} value={exam}>
                            {exam}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                    className="w-full"
                  >
                    <Save size={16} className="mr-2" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Subject Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen size={20} />
                  <span>Subject Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select the subjects you want to practice. You can change this anytime.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center space-x-3">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={selectedSubjects.includes(subject)}
                          onCheckedChange={(checked) => handleSubjectToggle(subject, checked as boolean)}
                          data-testid={`checkbox-subject-${subject.toLowerCase()}`}
                        />
                        <Label
                          htmlFor={`subject-${subject}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {subject}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {selectedSubjects.length === 0 && (
                    <p className="text-sm text-destructive">
                      Please select at least one subject to practice.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings size={20} />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendReminderMutation.mutate()}
                  disabled={sendReminderMutation.isPending || !watch("phone")}
                  data-testid="button-send-reminder"
                >
                  <MessageSquare size={16} className="mr-2" />
                  {sendReminderMutation.isPending ? "Sending..." : "Send Test Reminder"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setLocation("/")}
                  data-testid="button-view-progress"
                >
                  <Target size={16} className="mr-2" />
                  View Progress
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={cacheAllSubjects}
                  disabled={isCaching || !isOnline}
                  data-testid="button-cache-all"
                >
                  <Download size={16} className="mr-2" />
                  {isCaching ? "Caching..." : "Cache All Subjects"}
                </Button>
              </CardContent>
            </Card>

            {/* Offline Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                  <span>Offline Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-primary' : 'bg-destructive'}`} />
                    <span className="text-sm font-medium">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Cached Questions</span>
                      <span className="text-sm font-semibold">{totalCachedQuestions}</span>
                    </div>
                    
                    {selectedSubjects.map((subject) => {
                      const cachedCount = getCachedCount(subject);
                      const progress = (cachedCount / 50) * 100; // 50 is max cache per subject
                      
                      return (
                        <div key={subject} className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{subject}</span>
                            <span className="text-xs font-medium">{cachedCount}/50</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                          
                          {cachedCount < 50 && isOnline && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => cacheQuestionsForSubject(subject)}
                              disabled={isCaching}
                              data-testid={`button-cache-${subject.toLowerCase()}`}
                            >
                              <Download size={12} className="mr-1" />
                              Cache {subject}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!isOnline && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        You're offline. Using cached questions for practice.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member Since:</span>
                    <span className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
