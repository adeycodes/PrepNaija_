import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password, rememberMe);
      toast({ title: "Success!", description: "You have successfully logged in." });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#ECF6FF]">
      {/* Left visual panel */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden p-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#36d399] to-[#003423]" />
        <div className="relative z-10 w-full max-w-md text-white">
          <div className="flex items-center gap-2 mb-10">
            <img src="/logo.png" alt="PrepNaija" className="h-8 w-8" />
            
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold leading-snug">
            A few clicks away from
            <br /> acing your next exam
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
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">Log in</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back! Enter your details to access your dashboard
            </p>
          </div>

          <Card>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate("/reset-password")}
                  >
                    Forgot password?
                  </button>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
                <div className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate("/signup")}
                  >
                    Create one
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
