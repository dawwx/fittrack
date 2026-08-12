import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, RefreshCw, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAddFoodLog, useFoods, useProfile } from "@/hooks/useFitTrack";
import { generateMealPlan, macroTargets, sumMeal, titleCase } from "@/lib/fitness";

export const Route = createFileRoute("/_authenticated/diet")({
  component: Diet,
});

function Diet() {
  const { data: profile } = useProfile();
  const { data: foods = [], isLoading } = useFoods();
  const addLog = useAddFoodLog();
  const [seed, setSeed] = useState(0);

  const targets = useMemo(() => macroTargets(profile ?? {}), [profile]);
  const plan = useMemo(
    () => (foods.length && profile ? generateMealPlan(foods, profile, seed) : []),
    [foods, profile, seed],
  );
  const dayTotal = plan.reduce(
    (acc, meal) => {
      const t = sumMeal(meal.items);
      return {
        calories: acc.calories + t.calories,
        protein: acc.protein + t.protein,
      };
    },
    { calories: 0, protein: 0 },
  );

  return (
    <AppShell title="Diet plan" subtitle="Five meals built from your calorie and protein targets">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-5 shadow-card">
        <div className="text-sm">
          <p className="text-muted-foreground">Daily targets</p>
          <p className="stat-number text-xl">
            {targets.calories} kcal · {targets.protein} g protein
          </p>
          <p className="text-xs text-muted-foreground">
            This plan: {Math.round(dayTotal.calories)} kcal · {Math.round(dayTotal.protein)} g
            protein · {profile?.food_preference ?? "veg"}
            {profile?.allergies ? ` · avoiding ${profile.allergies}` : ""}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSeed((s) => s + 1)}>
          <RefreshCw className="mr-2 size-4" /> Swap meals
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : plan.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No meal plan yet"
          body="Complete your profile so we can size your meals to your calorie and protein targets."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plan.map((meal) => {
            const totals = sumMeal(meal.items);
            return (
              <section key={meal.slot} className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-semibold">{titleCase(meal.slot)}</h2>
                  <span className="text-sm text-muted-foreground">
                    <span className="stat-number text-foreground">
                      {Math.round(totals.calories)}
                    </span>{" "}
                    kcal
                  </span>
                </div>
                {meal.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nothing fits your preferences for this meal yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {meal.items.map((item) => (
                      <li
                        key={item.food.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.servings} × {item.food.serving} ·{" "}
                            {Math.round(item.food.calories * item.servings)} kcal ·{" "}
                            {Math.round(item.food.protein * item.servings)}g P
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Log ${item.food.name}`}
                          onClick={async () => {
                            await addLog.mutateAsync({
                              food_id: item.food.id,
                              food_name: item.food.name,
                              meal_slot: meal.slot,
                              servings: item.servings,
                              calories: item.food.calories * item.servings,
                              protein: item.food.protein * item.servings,
                              carbs: item.food.carbs * item.servings,
                              fat: item.food.fat * item.servings,
                            });
                            toast.success(`${item.food.name} added to today's log`);
                          }}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {Math.round(totals.protein)}g protein · {Math.round(totals.carbs)}g carbs ·{" "}
                  {Math.round(totals.fat)}g fat
                </p>
              </section>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        Meal plans are general wellness suggestions based on standard estimates — not medical or
        dietetic advice.
      </p>
    </AppShell>
  );
}
