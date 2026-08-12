import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Apple, Droplets, Dumbbell, Flame, Scale, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProgressBar, ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import {
  useExercises,
  useFoodLogs,
  useProfile,
  useWaterLogs,
  useWorkoutLogs,
  workoutStreak,
} from "@/hooks/useFitTrack";
import {
  bmi,
  bmiCategory,
  generateWeekPlan,
  greeting,
  healthyWeightRange,
  macroTargets,
  todayISO,
} from "@/lib/fitness";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const { data: foodLogs = [] } = useFoodLogs();
  const { data: waterLogs = [] } = useWaterLogs();
  const { data: workoutLogs = [] } = useWorkoutLogs();
  const { data: exercises = [] } = useExercises();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [isLoading, profile, navigate]);

  const targets = useMemo(() => macroTargets(profile ?? {}), [profile]);
  const consumed = foodLogs.reduce(
    (acc, l) => ({
      calories: acc.calories + Number(l.calories),
      protein: acc.protein + Number(l.protein),
      carbs: acc.carbs + Number(l.carbs),
      fat: acc.fat + Number(l.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const water = waterLogs.reduce((a, l) => a + l.amount_ml, 0);
  const waterGoal = profile?.water_goal_ml ?? 3000;
  const streak = workoutStreak(workoutLogs);

  const plan = useMemo(
    () => (profile && exercises.length ? generateWeekPlan(profile, exercises) : []),
    [profile, exercises],
  );
  const todaysPlan = plan.length ? plan[new Date().getDay() % plan.length]! : null;
  const todaysLog = workoutLogs.find((l) => l.log_date === todayISO());

  const bmiValue = bmi(Number(profile?.weight_kg ?? 0), Number(profile?.height_cm ?? 0));
  const category = bmiCategory(bmiValue);
  const range = healthyWeightRange(Number(profile?.height_cm ?? 170));

  if (isLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      </AppShell>
    );
  }

  const firstName = (profile?.full_name || "there").split(" ")[0];

  return (
    <AppShell
      title={`${greeting()}, ${firstName}`}
      subtitle={profile?.goal ? `Goal: ${profile.goal} · ${profile.days_per_week} days/week` : undefined}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Today's nutrition"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/calories">Log food</Link>
            </Button>
          }
        >
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing
              value={consumed.calories}
              max={targets.calories}
              label="Calories"
              unit=" kcal"
            />
            <div className="min-w-44 flex-1 space-y-3">
              <ProgressBar value={consumed.protein} max={targets.protein} label="Protein" tone="success" />
              <ProgressBar value={consumed.carbs} max={targets.carbs} label="Carbs" tone="chart-4" />
              <ProgressBar value={consumed.fat} max={targets.fat} label="Fat" tone="water" />
            </div>
          </div>
        </Card>

        <Card
          title="Hydration"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/water">Add water</Link>
            </Button>
          }
        >
          <div className="flex items-center gap-5">
            <ProgressRing value={water} max={waterGoal} label="Water" unit=" ml" tone="water" />
            <div className="text-sm text-muted-foreground">
              <p className="stat-number text-2xl text-foreground">
                {(water / 1000).toFixed(2)}L
              </p>
              <p>of {(waterGoal / 1000).toFixed(1)}L goal</p>
              <p className="mt-2 flex items-center gap-1.5">
                <Droplets className="size-4 text-water" /> {waterLogs.length} entries today
              </p>
            </div>
          </div>
        </Card>

        <Card title="Body stats">
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current</p>
                <p className="stat-number text-3xl">{profile?.weight_kg ?? "—"} kg</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Target</p>
                <p className="stat-number text-3xl">
                  {profile?.target_weight_kg ?? profile?.weight_kg ?? "—"} kg
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">BMI</span>
                <span className="stat-number text-xl">{bmiValue ? bmiValue.toFixed(1) : "—"}</span>
              </div>
              <p className={`text-sm font-semibold ${category.tone}`}>{category.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Healthy range for your height: {range.min.toFixed(0)}–{range.max.toFixed(0)} kg. BMI
                is a screening metric, not a diagnosis.
              </p>
            </div>
          </div>
        </Card>

        <Card
          title="Today's workout"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/workouts">Open plan</Link>
            </Button>
          }
        >
          {todaysPlan ? (
            <div>
              <p className="font-display text-xl font-bold">{todaysPlan.focus}</p>
              <p className="text-sm text-muted-foreground">
                {todaysPlan.exercises.length} exercises · {profile?.session_minutes} min ·{" "}
                {profile?.location}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {todaysPlan.exercises.slice(0, 4).map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <span>{e.name}</span>
                    <span className="text-muted-foreground">
                      {e.sets}×{e.reps}
                    </span>
                  </li>
                ))}
              </ul>
              {todaysLog?.completed && (
                <p className="mt-3 text-sm font-semibold text-success">Session completed today ✓</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Finish your profile and we'll build a split for you.
            </p>
          )}
        </Card>

        <Card title="Streak & activity">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Trophy, label: "Workout streak", value: `${streak} day${streak === 1 ? "" : "s"}` },
              {
                icon: Dumbbell,
                label: "Sessions done",
                value: String(workoutLogs.filter((l) => l.completed).length),
              },
              { icon: Flame, label: "Calories today", value: `${Math.round(consumed.calories)}` },
              { icon: Apple, label: "Foods logged", value: String(foodLogs.length) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-secondary p-4">
                <s.icon className="size-4 text-primary" />
                <p className="stat-number mt-2 text-xl">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Diet plan"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/diet">View meals</Link>
            </Button>
          }
        >
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Your daily targets are built from your body stats and goal.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-4">
              <Scale className="size-4 text-primary" />
              <span>
                <span className="stat-number">{targets.calories}</span> kcal ·{" "}
                <span className="stat-number">{targets.protein}</span> g protein
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Estimates from standard formulas — general wellness guidance, not medical advice.
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
