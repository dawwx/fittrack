import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search["mode"] === "login" ? ("login" as const) : ("register" as const),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — FitTrack" },
      {
        name: "description",
        content: "Sign in or create your FitTrack account to plan workouts and track nutrition.",
      },
      { property: "og:title", content: "Sign in — FitTrack" },
      { property: "og:description", content: "Access your FitTrack workout and nutrition dashboard." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  fullName: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else setCheckEmail(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-sm rounded-2xl bg-card p-8 text-center shadow-card">
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to {email}. Click it to activate your account, then come
            back and sign in.
          </p>
          <Button
            className="mt-6 w-full"
            variant="outline"
            onClick={() => {
              setCheckEmail(false);
              setIsLogin(true);
            }}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Dumbbell className="size-6" />
          </span>
          <h1 className="text-2xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to pick up today's workout and log your meals."
              : "A minute of setup, then your plan is ready."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sneha Mirashi"
                maxLength={100}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isLogin ? "New to FitTrack?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setIsLogin((v) => !v)}
          >
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
