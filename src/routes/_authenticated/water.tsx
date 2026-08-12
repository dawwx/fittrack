import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddWater, useProfile, useRemoveWater, useWaterLogs } from "@/hooks/useFitTrack";

export const Route = createFileRoute("/_authenticated/water")({
  component: Water,
});

const QUICK = [250, 500, 750];

function Water() {
  const { data: profile } = useProfile();
  const { data: logs = [], isLoading } = useWaterLogs();
  const addWater = useAddWater();
  const removeWater = useRemoveWater();
  const [custom, setCustom] = useState("");

  const goal = profile?.water_goal_ml ?? 3000;
  const total = logs.reduce((a, l) => a + l.amount_ml, 0);
  const remaining = Math.max(0, goal - total);

  async function add(amount: number) {
    if (!amount || amount < 10 || amount > 3000) {
      toast.error("Enter an amount between 10 and 3000 ml");
      return;
    }
    await addWater.mutateAsync(amount);
    toast.success(`${amount} ml added`);
  }

  return (
    <AppShell title="Water" subtitle={`Goal: ${(goal / 1000).toFixed(1)}L per day`}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 shadow-card">
          <ProgressRing value={total} max={goal} label="Today" unit=" ml" size={168} tone="water" />
          <p className="text-sm text-muted-foreground">
            {remaining > 0
              ? `${remaining} ml to go — about ${Math.ceil(remaining / 250)} more glasses.`
              : "Goal reached. Nicely hydrated! 💧"}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-card">
          <h2 className="mb-3 font-semibold">Quick add</h2>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <Button key={q} variant="outline" onClick={() => add(q)} disabled={addWater.isPending}>
                <Droplets className="mr-2 size-4 text-water" /> {q} ml
              </Button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              type="number"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Custom amount (ml)"
            />
            <Button
              onClick={async () => {
                await add(Number(custom));
                setCustom("");
              }}
            >
              Add
            </Button>
          </div>

          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Today's entries
          </h3>
          {isLoading ? (
            <div className="h-16 animate-pulse rounded-xl bg-secondary" />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Droplets}
              title="No water logged yet"
              body="Tap a quick-add button after your next glass and we'll keep the count."
            />
          ) : (
            <ul className="space-y-2">
              {logs.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2"
                >
                  <span className="text-sm font-medium">{l.amount_ml} ml</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove entry"
                      onClick={() => removeWater.mutate(l.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
