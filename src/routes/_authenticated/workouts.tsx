import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Dumbbell, Info, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useExercises,
  useFinishSession,
  useProfile,
  useSessionExercises,
  useStartSession,
  useUpdateSessionExercise,
  useWorkoutLogs,
} from "@/hooks/useFitTrack";
import { generateWeekPlan, titleCase, todayISO, type Exercise } from "@/lib/fitness";

export const Route = createFileRoute("/_authenticated/workouts")({
  component: Workouts,
});

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{exercise.name}</h3>
          <p className="text-xs text-muted-foreground">
            {titleCase(exercise.muscle_group)} · {exercise.equipment} · {exercise.difficulty}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="stat-number">
            {exercise.sets}×{exercise.reps}
          </p>
          <p className="text-xs text-muted-foreground">{exercise.rest_seconds}s rest</p>
        </div>
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <Info className="size-3.5" /> {open ? "Hide details" : "How to do it"}
      </button>
      {open && (
        <div className="mt-3 space-y-2 rounded-xl bg-secondary p-3 text-sm">
          <p>{exercise.instructions}</p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Common mistakes: </span>
            {exercise.common_mistakes}
          </p>
        </div>
      )}
    </div>
  );
}

function Workouts() {
  const { data: profile } = useProfile();
  const { data: exercises = [], isLoading } = useExercises();
  const { data: workoutLogs = [] } = useWorkoutLogs();
  const startSession = useStartSession();
  const finishSession = useFinishSession();
  const updateExercise = useUpdateSessionExercise();

  const [dayIndex, setDayIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("all");

  const plan = useMemo(
    () => (profile && exercises.length ? generateWeekPlan(profile, exercises) : []),
    [profile, exercises],
  );
  const day = plan[dayIndex];

  const todaysLog = workoutLogs.find((l) => l.log_date === todayISO());
  const { data: sessionExercises = [] } = useSessionExercises(todaysLog?.id);
  const doneCount = sessionExercises.filter((e) => e.completed).length;
  const completion = sessionExercises.length
    ? Math.round((doneCount / sessionExercises.length) * 100)
    : 0;

  const muscles = useMemo(
    () => ["all", ...Array.from(new Set(exercises.map((e) => e.muscle_group)))],
    [exercises],
  );
  const library = exercises.filter(
    (e) =>
      (muscle === "all" || e.muscle_group === muscle) &&
      e.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  async function start() {
    if (!day) return;
    try {
      await startSession.mutateAsync({
        focus: day.focus,
        exercises: day.exercises.map((e) => ({
          exercise_id: e.id,
          exercise_name: e.name,
          sets: e.sets,
        })),
      });
      toast.success("Session started — log your sets as you go");
    } catch {
      toast.error("Could not start the session. Please try again.");
    }
  }

  return (
    <AppShell title="Workouts" subtitle="Your personalised split and today's session">
      <Tabs defaultValue="plan">
        <TabsList className="mb-5">
          <TabsTrigger value="plan">My plan</TabsTrigger>
          <TabsTrigger value="session">Today's session</TabsTrigger>
          <TabsTrigger value="library">Exercise library</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-4">
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-card" />
          ) : plan.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No plan yet"
              body="Complete your profile and FitTrack will build a split around your goal and schedule."
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {plan.map((d, i) => (
                  <button
                    key={d.name}
                    onClick={() => setDayIndex(i)}
                    className={
                      i === dayIndex
                        ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        : "rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }
                  >
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{day?.focus}</h2>
                  <p className="text-sm text-muted-foreground">
                    {day?.exercises.length} exercises · {profile?.session_minutes} min ·{" "}
                    {profile?.location}
                  </p>
                </div>
                <Button onClick={start} disabled={startSession.isPending || !!todaysLog}>
                  {todaysLog ? "Session already started today" : "Start this session"}
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {day?.exercises.map((e) => <ExerciseCard key={e.id} exercise={e} />)}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="session" className="space-y-4">
          {!todaysLog ? (
            <EmptyState
              icon={Dumbbell}
              title="No session started today"
              body="Head to My plan and hit Start this session to begin logging sets, reps and weight. 💪"
            />
          ) : (
            <>
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{todaysLog.focus}</h2>
                    <p className="text-sm text-muted-foreground">
                      {doneCount} of {sessionExercises.length} exercises done
                    </p>
                  </div>
                  <span className="stat-number text-2xl text-primary">{completion}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                {!todaysLog.completed && (
                  <Button
                    className="mt-4"
                    onClick={async () => {
                      await finishSession.mutateAsync({
                        id: todaysLog.id,
                        duration: profile?.session_minutes ?? 45,
                      });
                      toast.success("Workout complete — streak updated");
                    }}
                  >
                    Complete session
                  </Button>
                )}
                {todaysLog.completed && (
                  <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success">
                    <CheckCircle2 className="size-4" /> Session completed
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {sessionExercises.map((ex) => (
                  <div key={ex.id} className="rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-3 font-medium">
                        <input
                          type="checkbox"
                          checked={ex.completed}
                          onChange={(e) =>
                            updateExercise.mutate({
                              id: ex.id,
                              values: { completed: e.target.checked },
                            })
                          }
                          className="size-4 accent-primary"
                        />
                        {ex.exercise_name}
                      </label>
                      <div className="flex gap-2">
                        {(
                          [
                            ["sets", "Sets"],
                            ["reps", "Reps"],
                            ["weight_kg", "kg"],
                          ] as const
                        ).map(([field, label]) => (
                          <Input
                            key={field}
                            type="number"
                            aria-label={`${ex.exercise_name} ${label}`}
                            placeholder={label}
                            defaultValue={ex[field] ?? ""}
                            className="w-20"
                            onBlur={(e) =>
                              updateExercise.mutate({
                                id: ex.id,
                                values: {
                                  [field]: e.target.value === "" ? null : Number(e.target.value),
                                },
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises"
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {muscles.map((m) => (
              <button
                key={m}
                onClick={() => setMuscle(m)}
                className={
                  m === muscle
                    ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                    : "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              >
                {titleCase(m)}
              </button>
            ))}
          </div>
          {library.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No exercises match"
              body="Try a different muscle group or clear your search."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {library.map((e) => (
                <ExerciseCard key={e.id} exercise={e} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {workoutLogs.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No workouts logged yet"
              body="Complete your first workout to start tracking your progress! 💪"
            />
          ) : (
            workoutLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card"
              >
                <div>
                  <p className="font-semibold">{log.focus}</p>
                  <p className="text-xs text-muted-foreground">{log.log_date}</p>
                </div>
                <span
                  className={
                    log.completed
                      ? "rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-foreground"
                      : "rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground"
                  }
                >
                  {log.completed ? `Completed · ${log.duration_minutes ?? 0} min` : "In progress"}
                </span>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
