import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Apple, Droplets, Dumbbell, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitTrack — Smart Gym & Diet Planner" },
      {
        name: "description",
        content:
          "Plan workouts, track calories, macros and water, and watch your progress build — FitTrack is your personal fitness companion.",
      },
      { property: "og:title", content: "FitTrack — Smart Gym & Diet Planner" },
      {
        property: "og:description",
        content:
          "Personalised workout plans, an Indian-friendly food database, macro tracking and hydration goals in one clean dashboard.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Dumbbell,
    title: "Workout plans that fit you",
    body: "Splits built from your goal, level, days per week and whether you train at home or the gym.",
  },
  {
    icon: Apple,
    title: "Diet plan + food log",
    body: "Five-meal plans from your calorie and protein targets, with rice, roti, dal, paneer and more.",
  },
  {
    icon: Activity,
    title: "Calories & macros",
    body: "Daily totals against your targets with clear progress rings — add or remove food in a tap.",
  },
  {
    icon: Droplets,
    title: "Hydration goals",
    body: "A 3L default goal with quick-add cups so you never guess how much you drank.",
  },
  {
    icon: LineChart,
    title: "Real progress",
    body: "Weight, measurements and streaks tracked over time so you can see the trend, not just today.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your logs are yours: every record is locked to your account.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">FitTrack</span>
        </div>
        <Button asChild variant="ghost">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 md:pt-20">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
          Smart gym & diet planner
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.05] font-bold md:text-6xl">
          Train with a plan. Eat with a number. Track every single day.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          FitTrack turns your body stats and goal into a workout split, a five-meal diet plan and
          daily calorie, protein and water targets — then keeps score for you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth" search={{ mode: "login" }}>
              I already have an account
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Estimates only — FitTrack offers general wellness guidance, not medical advice.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl bg-card p-6 shadow-card">
            <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <f.icon className="size-5" />
            </span>
            <h2 className="text-base font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
