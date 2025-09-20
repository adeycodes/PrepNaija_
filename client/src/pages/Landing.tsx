import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Brain, 
  WifiOff, 
  TrendingUp, 
  MessageSquare, 
  Gamepad, 
  Clock, 
  University, 
  Award, 
  Users,
  Star,
  Calculator,
  Book,
  Trophy,
  Zap,
  Phone,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleSignup = () => {
    window.location.href = "/signup";
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-primary-foreground" size={16} />
                </div>
                <span className="text-xl font-bold text-foreground">PrepNaija</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                data-testid="button-login-nav"
                className="text-muted-foreground hover:text-foreground"
              >
                Login
              </Button>
              <Button 
                onClick={handleSignup}
                data-testid="button-signup-nav"
                className="bg-primary text-primary-foreground hover:bg-accent"
              >
                Sign Up Free
              </Button>
            </div>
            
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                data-testid="button-menu-toggle"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-2">
              <a href="#features" className="block px-4 py-2 text-muted-foreground hover:text-foreground">Features</a>
              <a href="#how-it-works" className="block px-4 py-2 text-muted-foreground hover:text-foreground">How it Works</a>
              <a href="#pricing" className="block px-4 py-2 text-muted-foreground hover:text-foreground">Pricing</a>
              <a href="#contact" className="block px-4 py-2 text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background to-muted py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                Ace Your <span className="text-primary">JAMB, WAEC</span> & <span className="text-accent">NECO</span> Exams
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join over 50,000 Nigerian students using AI-powered practice questions, 
                personalized study plans, and offline mode to achieve their dream scores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  onClick={handleSignup}
                  data-testid="button-start-practice"
                  className="bg-primary text-primary-foreground hover:bg-accent btn-animate text-lg px-8 py-4"
                >
                  Start Free Practice
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-watch-demo"
                  className="text-lg px-8 py-4 btn-animate"
                >
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="text-primary" size={16} />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <WifiOff className="text-primary" size={16} />
                  <span>Works Offline</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="text-primary" size={16} />
                  <span>Mobile Optimized</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Dashboard Preview Mockup */}
              <Card className="hover-lift shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-card-foreground">Your Progress</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock size={16} />
                      <span>Today</span>
                    </div>
                  </div>
                  
                  {/* Subject Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="bg-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Mathematics</span>
                          <Calculator className="text-primary" size={16} />
                        </div>
                        <div className="text-2xl font-bold text-card-foreground mb-1">85%</div>
                        <Progress value={85} className="h-2" />
                      </CardContent>
                    </Card>
                    <Card className="bg-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">English</span>
                          <Book className="text-accent" size={16} />
                        </div>
                        <div className="text-2xl font-bold text-card-foreground mb-1">92%</div>
                        <Progress value={92} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Activity */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Trophy className="text-primary-foreground" size={12} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">Mastered Algebra!</p>
                        <p className="text-xs text-muted-foreground">+100 energy points</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <Zap className="text-accent-foreground" size={12} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">7-day streak!</p>
                        <p className="text-xs text-muted-foreground">Keep it up, Adebayo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From AI-powered explanations to offline practice, PrepNaija gives you all the tools 
              to ace your Nigerian exams with confidence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="btn-animate border card-enter card-enter-active stagger-1">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Brain className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">AI-Powered Explanations</h3>
                <p className="text-muted-foreground mb-4">
                  Get instant, detailed explanations for every wrong answer. Our AI breaks down complex concepts 
                  into simple, easy-to-understand steps.
                </p>
                <div className="text-sm text-primary font-medium flex items-center">
                  <span className="mr-2">→</span>Learn from mistakes
                </div>
              </CardContent>
            </Card>

            <Card className="btn-animate border card-enter card-enter-active stagger-2">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <WifiOff className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Offline Mode</h3>
                <p className="text-muted-foreground mb-4">
                  Practice anywhere, anytime. Download questions to your device and study even 
                  without internet connection. Perfect for areas with poor network.
                </p>
                <div className="text-sm text-accent font-medium flex items-center">
                  <span className="mr-2">→</span>Study anywhere
                </div>
              </CardContent>
            </Card>

            <Card className="btn-animate border card-enter card-enter-active stagger-3">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Progress Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  Khan Academy-style progress tracking shows your mastery level in each subject. 
                  Visualize your growth and identify areas that need more practice.
                </p>
                <div className="text-sm text-primary font-medium flex items-center">
                  <span className="mr-2">→</span>Track mastery
                </div>
              </CardContent>
            </Card>

            <Card className="btn-animate border card-enter card-enter-active stagger-4">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <MessageSquare className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">SMS Reminders</h3>
                <p className="text-muted-foreground mb-4">
                  Never miss a practice session. Get daily study reminders and quiz results 
                  sent directly to your phone via SMS.
                </p>
                <div className="text-sm text-accent font-medium flex items-center">
                  <span className="mr-2">→</span>Stay consistent
                </div>
              </CardContent>
            </Card>

            <Card className="btn-animate border card-enter card-enter-active stagger-5">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Gamepad className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Gamification</h3>
                <p className="text-muted-foreground mb-4">
                  Earn energy points, unlock achievements, and compete with friends. 
                  Make studying fun with our engaging reward system.
                </p>
                <div className="text-sm text-primary font-medium flex items-center">
                  <span className="mr-2">→</span>Make it fun
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <Clock className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Timed Practice</h3>
                <p className="text-muted-foreground mb-4">
                  Simulate real exam conditions with our 30-minute timed sessions. 
                  Build confidence and improve your time management skills.
                </p>
                <div className="text-sm text-accent font-medium flex items-center">
                  <span className="mr-2">→</span>Exam ready
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of successful students who've improved their scores with PrepNaija
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Sign Up & Choose Subjects</h3>
              <p className="text-muted-foreground">
                Create your free account and select the subjects you want to practice. 
                Choose from Mathematics, English, Physics, Chemistry, and Biology.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Take Practice Quizzes</h3>
              <p className="text-muted-foreground">
                Start with 20-question quizzes tailored to your level. Get instant feedback 
                and AI explanations for every answer.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Track Progress & Improve</h3>
              <p className="text-muted-foreground">
                Monitor your progress with visual charts, achieve mastery in topics, 
                and watch your scores improve over time.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={handleSignup}
              data-testid="button-start-journey"
              className="bg-primary text-primary-foreground hover:bg-accent hover-lift text-lg px-8 py-4"
            >
              Start Your Journey Today
            </Button>
          </div>
        </div>
      </section>

      {/* Exam Coverage Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Complete Exam Coverage
            </h2>
            <p className="text-xl text-muted-foreground">
              Authentic questions for all major Nigerian examinations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift border text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <University className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">JAMB UTME</h3>
                <p className="text-muted-foreground mb-6">
                  Comprehensive practice for Joint Admissions and Matriculation Board exams. 
                  Over 10,000 questions covering all subjects.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span>Mathematics • English • Physics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span>Chemistry • Biology • Literature</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span>Past questions from 2010-2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="text-accent" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">WAEC SSCE</h3>
                <p className="text-muted-foreground mb-6">
                  West African Senior School Certificate Examination preparation with 
                  detailed solutions and marking schemes.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-accent" size={16} />
                    <span>Core subjects + Electives</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-accent" size={16} />
                    <span>Theory & Objective questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-accent" size={16} />
                    <span>Detailed marking guides</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">NECO SSCE</h3>
                <p className="text-muted-foreground mb-6">
                  National Examinations Council preparation with current syllabus 
                  alignment and comprehensive topic coverage.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span>Updated syllabus alignment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span>Multiple choice & Theory</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span>Recent exam patterns</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-muted-foreground">
              Hear from students who achieved their dream scores with PrepNaija
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift border">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "PrepNaija helped me improve my JAMB score from 180 to 289! The AI explanations 
                  made complex math topics so much easier to understand."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">A</span>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">Adebayo Okonkwo</p>
                    <p className="text-sm text-muted-foreground">University of Lagos, Medicine</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "The offline mode was a lifesaver! I could practice even when there was no network 
                  in my village. Got 6 A's in WAEC!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-accent-foreground font-semibold">C</span>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">Chioma Eze</p>
                    <p className="text-sm text-muted-foreground">FUTO, Computer Science</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "The progress tracking kept me motivated. Seeing my improvement in real-time 
                  pushed me to study harder. Scored 320 in JAMB!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">F</span>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">Fatima Ahmad</p>
                    <p className="text-sm text-muted-foreground">ABU Zaria, Engineering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Card className="inline-flex items-center space-x-4 px-6 py-4">
              <div className="text-3xl font-bold text-primary">50,000+</div>
              <div className="text-left">
                <p className="font-semibold text-card-foreground">Active Students</p>
                <p className="text-sm text-muted-foreground">Preparing for exams daily</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free and upgrade when you're ready for premium features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="hover-lift border">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">Free Plan</h3>
                  <div className="text-4xl font-bold text-primary mb-2">₦0</div>
                  <p className="text-muted-foreground">Perfect to get started</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span className="text-card-foreground">50 practice questions per day</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span className="text-card-foreground">Basic progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span className="text-card-foreground">Access to all subjects</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span className="text-card-foreground">Mobile app access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="text-primary" size={16} />
                    <span className="text-card-foreground">Community support</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSignup}
                  data-testid="button-get-started-free"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="hover-lift border bg-primary text-primary-foreground relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground">
                  Most Popular
                </Badge>
              </div>
              
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
                  <div className="text-4xl font-bold mb-2">₦2,500</div>
                  <p className="opacity-90">per month</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 size={16} />
                    <span>Unlimited practice questions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 size={16} />
                    <span>AI-powered explanations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 size={16} />
                    <span>Offline mode (download questions)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 size={16} />
                    <span>SMS study reminders</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 size={16} />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 size={16} />
                    <span>Personalized study plans</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 size={16} />
                    <span>Priority support</span>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-primary hover:bg-gray-100"
                  onClick={handleSignup}
                  data-testid="button-upgrade-premium"
                >
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              💳 Pay with Bank Transfer, USSD, or Mobile Money
            </p>
            <p className="text-sm text-muted-foreground">
              7-day money-back guarantee • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about PrepNaija
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "How does the offline mode work?",
                answer: "You can download up to 50 questions per subject directly to your device. Once downloaded, you can practice without any internet connection. Your progress will sync automatically when you reconnect to the internet."
              },
              {
                question: "Are the questions authentic and up-to-date?",
                answer: "Yes! Our question bank includes past questions from JAMB, WAEC, and NECO from 2010-2024, plus AI-generated questions that follow the exact patterns and style of these examinations. All questions are reviewed by subject matter experts."
              },
              {
                question: "Can I use PrepNaija on my phone?",
                answer: "Absolutely! PrepNaija is designed mobile-first and works perfectly on all smartphones, tablets, and computers. You can study anywhere, anytime with our responsive design."
              },
              {
                question: "How do SMS reminders work?",
                answer: "Premium users receive daily study reminders and quiz results via SMS to their registered phone number. You can customize when and how often you want to receive these messages."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept bank transfers, USSD payments, mobile money (MTN, Airtel, etc.), and debit/credit cards. All payments are secure and processed in Nigerian Naira."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your Premium subscription at any time. You'll continue to have access to premium features until the end of your current billing period, then automatically switch to the free plan."
              }
            ].map((faq, index) => (
              <Card key={index} className="border">
                <CardContent className="p-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleFaq(index)}
                    data-testid={`button-faq-${index}`}
                  >
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {faq.question}
                    </h3>
                    <div className={`transform transition-transform ${faqOpenIndex === index ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>
                  {faqOpenIndex === index && (
                    <p className="text-muted-foreground mt-4" data-testid={`text-faq-answer-${index}`}>
                      {faq.answer}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Ace Your Exams?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join over 50,000 students who are already improving their scores with PrepNaija. 
            Start your journey to academic success today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleSignup}
              data-testid="button-start-practice-cta"
              className="bg-white text-primary hover:bg-gray-100 hover-lift text-lg px-8 py-4"
            >
              Start Free Practice
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              data-testid="button-watch-demo-cta"
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4"
            >
              Watch Demo Video
            </Button>
          </div>
          <div className="mt-8 text-sm text-white/80">
            No credit card required • Free forever plan available
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-primary-foreground" size={16} />
                </div>
                <span className="text-xl font-bold text-card-foreground">PrepNaija</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Nigeria's leading exam preparation platform. Helping students ace JAMB, WAEC, 
                and NECO exams with AI-powered practice questions and personalized learning.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <a 
                    key={social}
                    href={`#${social}`} 
                    className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    data-testid={`link-${social}`}
                  >
                    <Users size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Quick Links</h4>
              <div className="space-y-3">
                {['About Us', 'Features', 'Pricing', 'Contact', 'Help Center'].map((link) => (
                  <a 
                    key={link}
                    href={`#${link.toLowerCase().replace(' ', '-')}`} 
                    className="block text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`link-${link.toLowerCase().replace(' ', '-')}`}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Support</h4>
              <div className="space-y-3">
                {['FAQ', 'Contact Support', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map((link) => (
                  <a 
                    key={link}
                    href={`#${link.toLowerCase().replace(' ', '-')}`} 
                    className="block text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`link-${link.toLowerCase().replace(' ', '-')}`}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground text-sm">
                © 2024 PrepNaija. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-muted-foreground text-sm">Made with ❤️ in Nigeria</span>
                <div className="flex items-center space-x-2">
                  <Phone className="text-primary" size={16} />
                  <span className="text-muted-foreground text-sm">+234 800 PREP (7737)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
