import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "@/hooks/useFitTrack";
import { bmi, bmiCategory, macroTargets } from "@/lib/fitness";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState({
    full_name: "",
    weight_kg: "",
    target_weight_kg: "",
    height_cm: "",
    days_per_week: "",
    session_minutes: "",
    water_goal_ml: "",
    allergies: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        weight_kg: String(profile.weight_kg ?? ""),
        target_weight_kg: String(profile.target_weight_kg ?? ""),
        height_cm: String(profile.height_cm ?? ""),
        days_per_week: String(profile.days_per_week ?? 4),
        session_minutes: String(profile.session_minutes ?? 45),
        water_goal_ml: String(profile.water_goal_ml ?? 3000),
        allergies: profile.allergies ?? "",
      });
    }
  }, [profile]);

  const targets = macroTargets(profile ?? {});
  const bmiValue = bmi(Number(profile?.weight_kg ?? 0), Number(profile?.height_cm ?? 0));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({
        full_name: form.full_name.trim().slice(0, 100),
        weight_kg: Number(form.weight_kg) || null,
        target_weight_kg: form.target_weight_kg ? Number(form.target_weight_kg) : null,
        height_cm: Number(form.height_cm) || null,
        days_per_week: Number(form.days_per_week) || 4,
        session_minutes: Number(form.session_minutes) || 45,
        water_goal_ml: Number(form.water_goal_ml) || 3000,
        allergies: form.allergies.trim().slice(0, 200),
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save your changes. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Profile">
        <div className="h-64 animate-pulse rounded-2xl bg-card" />
      </AppShell>
    );
  }

  return (
    <AppShell title="Profile" subtitle="Your stats drive every target in FitTrack">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={save} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              maxLength={100}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["weight_kg", "Current weight (kg)"],
                ["target_weight_kg", "Target weight (kg)"],
                ["height_cm", "Height (cm)"],
                ["days_per_week", "Workout days / week"],
                ["session_minutes", "Session length (min)"],
                ["water_goal_ml", "Water goal (ml)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="number"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="allergies">Allergies / foods to avoid</Label>
            <Input
              id="allergies"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              maxLength={200}
            />
          </div>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <div className="space-y-4">
          <section className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Your estimates
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["BMI", bmiValue ? `${bmiValue.toFixed(1)} · ${bmiCategory(bmiValue).label}` : "—"],
                ["Daily calories", `${targets.calories} kcal`],
                ["Protein target", `${targets.protein} g`],
                ["Goal", profile?.goal ?? "—"],
                ["Fitness level", profile?.fitness_level ?? "—"],
                ["Training at", profile?.location ?? "—"],
                ["Food preference", profile?.food_preference ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Figures are estimates from standard formulas — general wellness info, not medical
              advice.
            </p>
          </section>
          <section className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-semibold">Change your goal or split?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Re-run onboarding to update your goal, level, training location and food preference.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/onboarding">Redo onboarding</Link>
            </Button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
