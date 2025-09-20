import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [agree, setAgree] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await auth.signup({ email, password, firstName, lastName });
      toast({
        title: "Account Created!",
        description: result?.message || "Please check your email and click the confirmation link to activate your account.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#ECF6FF]">
      {/* Left visual panel */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden p-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#36d399] to-[#003423] " />
        <div className="relative z-10 w-full max-w-md text-white">
          <div className="flex items-center gap-2 mb-10">
            <img src="/logo.png" alt="PrepNaija" className="h-8 w-8" />
    
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold leading-snug">
            A few clicks away from
            <br /> creating your account
          </h2>
          <div className="mt-10 rounded-2xl bg-white/10 backdrop-blur-md p-6 shadow-xl">
            <div className="h-48 w-full rounded-xl bg-white/20" />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 opacity-80">
            <span className="h-1.5 w-6 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">Register</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all your exam prep efficiently. Let’s get you set up.
            </p>
          </div>

          <Card>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" placeholder="John" disabled={isLoading} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Doe" disabled={isLoading} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" autoComplete="new-password" disabled={isLoading} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" disabled={isLoading} required />
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    id="agree"
                    type="checkbox"
                    className="mt-1 rounded"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <label htmlFor="agree">
                    I agree to the <span className="text-blue-600">Terms</span>, <span className="text-blue-600">Privacy Policy</span> and any applicable fees.
                  </label>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading || !agree}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate('/login')}
                  >
                    Log in
                  </button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
