import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Target, 
  Edit,
  Save,
  X,
  Check
} from "lucide-react";

const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology"];
const EXAM_TYPES = ["JAMB", "WAEC", "NECO"];

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.profile?.fullName || user?.firstName || "",
    phone: user?.profile?.phone || "",
    selectedSubjects: user?.profile?.selectedSubjects || [],
    targetExam: user?.profile?.targetExam || "JAMB"
  });

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.profile?.fullName || user?.firstName || "",
      phone: user?.profile?.phone || "",
      selectedSubjects: user?.profile?.selectedSubjects || [],
      targetExam: user?.profile?.targetExam || "JAMB"
    });
    setIsEditing(false);
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      {formData.fullName || "Not set"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email || "Not available"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed from here
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {formData.phone || "Not set"}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Used for study reminders and notifications
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Preferences */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Study Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Target Examination</Label>
                <div className="flex flex-wrap gap-2">
                  {EXAM_TYPES.map((exam) => (
                    <button
                      key={exam}
                      onClick={() => isEditing && setFormData(prev => ({ ...prev, targetExam: exam }))}
                      disabled={!isEditing}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        formData.targetExam === exam
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Selected Subjects</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((subject) => {
                    const isSelected = formData.selectedSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        onClick={() => isEditing && toggleSubject(subject)}
                        disabled={!isEditing}
                        className={`px-3 py-2 rounded-md border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{subject}</span>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the subjects you want to focus on in your studies
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Profile Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-medium">{formData.fullName || "Student"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">Target Exam</p>
                  <Badge variant="secondary" className="mt-1">
                    {formData.targetExam}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Selected Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.selectedSubjects.length > 0 ? (
                      formData.selectedSubjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No subjects selected</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Contact</p>
                  <p className="text-xs text-muted-foreground">
                    {formData.phone || "No phone number"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <Badge variant="default" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile Complete</span>
                  <Badge 
                    variant={formData.fullName && formData.selectedSubjects.length > 0 ? "default" : "secondary"} 
                    className="text-xs"
                  >
                    {formData.fullName && formData.selectedSubjects.length > 0 ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Type</span>
                  <Badge variant="outline" className="text-xs">
                    Free
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
