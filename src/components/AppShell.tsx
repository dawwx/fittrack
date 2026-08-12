import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Apple,
  Dumbbell,
  Droplets,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/diet", label: "Diet", icon: UtensilsCrossed },
  { to: "/calories", label: "Calories", icon: Apple },
  { to: "/water", label: "Water", icon: Droplets },
] as const;

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("fittrack-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("fittrack-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };
  return { dark, toggle };
}

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string | undefined;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dark, toggle } = useTheme();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card px-4 py-6 md:flex">
        <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">FitTrack</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.to
                  ? "bg-primary text-primary-foreground shadow-lift"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/profile"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <User className="size-4.5" /> Profile
          </Link>
          <button
            onClick={toggle}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            {dark ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <Button size="icon" variant="ghost" onClick={toggle} aria-label="Toggle theme">
                {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sign out">
                <LogOut className="size-4.5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 pb-28 pt-5 md:px-8 md:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-card/95 backdrop-blur md:hidden">
        {[...NAV, { to: "/profile", label: "Profile", icon: User } as const].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              pathname === item.to ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body }: { icon: typeof Apple; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
