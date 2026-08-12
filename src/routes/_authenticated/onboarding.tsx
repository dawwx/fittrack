import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "@/hooks/useFitTrack";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const schema = z.object({
  full_name: z.string().trim().min(1, "Tell us your name").max(100),
  age: z.number().int().min(13, "Age must be 13 or older").max(100),
  height_cm: z.number().min(100, "Height looks too low").max(250),
  weight_kg: z.number().min(25, "Weight looks too low").max(300),
  target_weight_kg: z.number().min(25).max(300).optional(),
});

const OPTIONS = {
  gender: ["male", "female", "other"],
  fitness_level: ["beginner", "intermediate", "advanced"],
  goal: ["weight loss", "muscle gain", "maintenance", "general fitness"],
  location: ["gym", "home"],
  food_preference: ["veg", "non-veg", "vegan"],
} as const;

function Chips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={
              value === o
                ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                : "rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            }
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  const [form, setForm] = useState({
    full_name: "",
    age: "25",
    height_cm: "170",
    weight_kg: "70",
    target_weight_kg: "",
    gender: "female",
    fitness_level: "beginner",
    goal: "general fitness",
    location: "gym",
    food_preference: "veg",
    days_per_week: "4",
    session_minutes: "45",
    allergies: "",
  });

  const name = form.full_name || profile?.full_name || "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      full_name: name,
      age: Number(form.age),
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      target_weight_kg: form.target_weight_kg ? Number(form.target_weight_kg) : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    try {
      await update.mutateAsync({
        full_name: name,
        age: Number(form.age),
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        target_weight_kg: form.target_weight_kg ? Number(form.target_weight_kg) : null,
        gender: form.gender,
        fitness_level: form.fitness_level,
        goal: form.goal,
        location: form.location,
        food_preference: form.food_preference,
        days_per_week: Number(form.days_per_week),
        session_minutes: Number(form.session_minutes),
        allergies: form.allergies.trim(),
        onboarded: true,
      });
      toast.success("Your plan is ready");
      navigate({ to: "/dashboard", replace: true });
    } catch {
      toast.error("Could not save your profile. Please try again.");
    }
  }

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-bold md:text-3xl">Let's build your plan</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        These details shape your workout split and calorie targets. All figures are estimates, not
        medical advice.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-7 rounded-2xl bg-card p-6 shadow-card">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            value={name}
            onChange={(e) => set("full_name")(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {(
            [
              ["age", "Age", "years"],
              ["height_cm", "Height", "cm"],
              ["weight_kg", "Weight", "kg"],
              ["target_weight_kg", "Target weight", "optional"],
            ] as const
          ).map(([key, label, hint]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>
                {label} <span className="text-xs text-muted-foreground">({hint})</span>
              </Label>
              <Input
                id={key}
                type="number"
                inputMode="decimal"
                value={form[key]}
                onChange={(e) => set(key)(e.target.value)}
              />
            </div>
          ))}
        </div>

        <Chips label="Gender" options={OPTIONS.gender} value={form.gender} onChange={set("gender")} />
        <Chips
          label="Fitness level"
          options={OPTIONS.fitness_level}
          value={form.fitness_level}
          onChange={set("fitness_level")}
        />
        <Chips label="Goal" options={OPTIONS.goal} value={form.goal} onChange={set("goal")} />
        <Chips
          label="Where do you train?"
          options={OPTIONS.location}
          value={form.location}
          onChange={set("location")}
        />
        <Chips
          label="Food preference"
          options={OPTIONS.food_preference}
          value={form.food_preference}
          onChange={set("food_preference")}
        />
        <Chips
          label="Workout days per week"
          options={["2", "3", "4", "5", "6"]}
          value={form.days_per_week}
          onChange={set("days_per_week")}
        />
        <Chips
          label="Session length (minutes)"
          options={["30", "45", "60", "75"]}
          value={form.session_minutes}
          onChange={set("session_minutes")}
        />

        <div className="space-y-1.5">
          <Label htmlFor="allergies">Allergies or foods to avoid</Label>
          <Input
            id="allergies"
            value={form.allergies}
            onChange={(e) => set("allergies")(e.target.value)}
            placeholder="e.g. peanuts, milk"
            maxLength={200}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Generate my plan"}
        </Button>
      </form>
    </div>
  );
}
