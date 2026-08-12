import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Apple, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState } from "@/components/AppShell";
import { ProgressBar, ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddFoodLog,
  useFoodLogs,
  useFoods,
  useProfile,
  useRemoveFoodLog,
} from "@/hooks/useFitTrack";
import { MEAL_SLOTS, macroTargets, titleCase } from "@/lib/fitness";

export const Route = createFileRoute("/_authenticated/calories")({
  component: Calories,
});

function Calories() {
  const { data: profile } = useProfile();
  const { data: foods = [] } = useFoods();
  const { data: logs = [], isLoading } = useFoodLogs();
  const addLog = useAddFoodLog();
  const removeLog = useRemoveFoodLog();

  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState<string>("lunch");
  const [servings, setServings] = useState("1");

  const targets = useMemo(() => macroTargets(profile ?? {}), [profile]);
  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + Number(l.calories),
      protein: acc.protein + Number(l.protein),
      carbs: acc.carbs + Number(l.carbs),
      fat: acc.fat + Number(l.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const results = query.trim()
    ? foods.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  return (
    <AppShell title="Calories & macros" subtitle="Today's intake against your targets">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing
              value={totals.calories}
              max={targets.calories}
              label="Calories"
              unit=" kcal"
              size={132}
            />
            <div className="min-w-44 flex-1 space-y-3">
              <ProgressBar value={totals.protein} max={targets.protein} label="Protein" tone="success" />
              <ProgressBar value={totals.carbs} max={targets.carbs} label="Carbs" tone="chart-4" />
              <ProgressBar value={totals.fat} max={targets.fat} label="Fat" tone="water" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {targets.calories - Math.round(totals.calories) > 0
              ? `${targets.calories - Math.round(totals.calories)} kcal left today.`
              : "You've reached your calorie estimate for today."}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-5 shadow-card">
          <h2 className="mb-3 font-semibold">Add food</h2>
          <div className="flex flex-wrap gap-2">
            {MEAL_SLOTS.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={
                  s === slot
                    ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                    : "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              >
                {titleCase(s)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rice, dal, paneer, eggs…"
                className="pl-9"
              />
            </div>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-24"
              aria-label="Servings"
            />
          </div>

          <div className="mt-3 space-y-2">
            {query.trim() && results.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No foods match "{query}". Try a simpler name like "rice" or "dal".
              </p>
            )}
            {results.map((f) => (
              <button
                key={f.id}
                onClick={async () => {
                  const s = Math.max(0.25, Number(servings) || 1);
                  await addLog.mutateAsync({
                    food_id: f.id,
                    food_name: f.name,
                    meal_slot: slot,
                    servings: s,
                    calories: f.calories * s,
                    protein: f.protein * s,
                    carbs: f.carbs * s,
                    fat: f.fat * s,
                  });
                  setQuery("");
                  toast.success(`${f.name} logged to ${slot}`);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl bg-secondary px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <span>
                  <span className="block text-sm font-medium">{f.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {f.serving} · {f.calories} kcal · {f.protein}g P
                  </span>
                </span>
                <span className="text-xs font-semibold text-primary">Add</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <h2 className="mb-3 mt-6 font-semibold">Today's log</h2>
      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-card" />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Apple}
          title="Nothing logged yet"
          body="Search a food above and add it to see your calories and macros fill up."
        />
      ) : (
        <div className="space-y-2">
          {MEAL_SLOTS.filter((s) => logs.some((l) => l.meal_slot === s)).map((s) => (
            <div key={s} className="rounded-2xl bg-card p-4 shadow-card">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {titleCase(s)}
              </p>
              <ul className="space-y-2">
                {logs
                  .filter((l) => l.meal_slot === s)
                  .map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{l.food_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Number(l.servings)} serving · {Math.round(Number(l.calories))} kcal ·{" "}
                          {Math.round(Number(l.protein))}g P
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove ${l.food_name}`}
                        onClick={() => removeLog.mutate(l.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
