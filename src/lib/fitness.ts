export type Profile = {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  target_weight_kg: number | null;
  fitness_level: string | null;
  goal: string | null;
  location: string | null;
  days_per_week: number | null;
  session_minutes: number | null;
  food_preference: string | null;
  allergies: string | null;
  water_goal_ml: number;
  onboarded: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: string;
  equipment: string;
  location: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  instructions: string;
  common_mistakes: string;
};

export type Food = {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_veg: boolean;
  is_vegan: boolean;
  meal_slot: string | null;
};

export const MEAL_SLOTS = [
  "breakfast",
  "mid-morning snack",
  "lunch",
  "evening snack",
  "dinner",
] as const;

/** Estimated BMI (screening metric only, not a diagnosis). */
export function bmi(weightKg: number, heightCm: number) {
  if (!weightKg || !heightCm) return 0;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(value: number) {
  if (value < 18.5) return { label: "Underweight", tone: "text-water" };
  if (value < 25) return { label: "Healthy range", tone: "text-success" };
  if (value < 30) return { label: "Overweight", tone: "text-primary" };
  return { label: "Obese", tone: "text-destructive" };
}

export function healthyWeightRange(heightCm: number) {
  const m = heightCm / 100;
  return { min: 18.5 * m * m, max: 24.9 * m * m };
}

/** Mifflin-St Jeor BMR estimate. */
export function bmr(p: Partial<Profile>) {
  const w = Number(p.weight_kg ?? 0);
  const h = Number(p.height_cm ?? 0);
  const a = Number(p.age ?? 25);
  if (!w || !h) return 0;
  const base = 10 * w + 6.25 * h - 5 * a;
  return p.gender === "female" ? base - 161 : base + 5;
}

export function calorieTarget(p: Partial<Profile>) {
  const base = bmr(p);
  if (!base) return 0;
  const days = Number(p.days_per_week ?? 3);
  const activity = days <= 1 ? 1.2 : days <= 3 ? 1.375 : days <= 5 ? 1.55 : 1.725;
  const tdee = base * activity;
  const adjusted =
    p.goal === "weight loss" ? tdee - 500 : p.goal === "muscle gain" ? tdee + 300 : tdee;
  return Math.round(adjusted / 10) * 10;
}

export function proteinTarget(p: Partial<Profile>) {
  const w = Number(p.weight_kg ?? 0);
  if (!w) return 0;
  const perKg =
    p.goal === "muscle gain" ? 1.9 : p.goal === "weight loss" ? 1.7 : 1.4;
  return Math.round(w * perKg);
}

export function macroTargets(p: Partial<Profile>) {
  const cals = calorieTarget(p);
  const protein = proteinTarget(p);
  const fat = Math.round((cals * 0.25) / 9);
  const carbs = Math.max(0, Math.round((cals - protein * 4 - fat * 9) / 4));
  return { calories: cals, protein, carbs, fat };
}

const SPLITS: Record<number, string[][]> = {
  2: [["full body"], ["full body"]],
  3: [
    ["chest", "triceps", "core"],
    ["back", "biceps", "core"],
    ["legs", "shoulders"],
  ],
  4: [
    ["chest", "triceps"],
    ["back", "biceps"],
    ["legs", "core"],
    ["shoulders", "full body"],
  ],
  5: [
    ["chest", "triceps"],
    ["back", "biceps"],
    ["legs"],
    ["shoulders", "core"],
    ["full body"],
  ],
  6: [
    ["chest"],
    ["back"],
    ["legs"],
    ["shoulders", "core"],
    ["biceps", "triceps"],
    ["full body"],
  ],
};

const DAY_NAMES = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"];

export type PlanDay = { name: string; focus: string; exercises: Exercise[] };

export function generateWeekPlan(profile: Partial<Profile>, exercises: Exercise[]): PlanDay[] {
  const days = Math.min(6, Math.max(2, Number(profile.days_per_week ?? 4)));
  const split = SPLITS[days] ?? SPLITS[4]!;
  const level = profile.fitness_level ?? "beginner";
  const allowed =
    level === "beginner"
      ? ["beginner"]
      : level === "intermediate"
        ? ["beginner", "intermediate"]
        : ["beginner", "intermediate", "advanced"];
  const place = profile.location ?? "gym";
  const perDay = Number(profile.session_minutes ?? 45) >= 60 ? 6 : Number(profile.session_minutes ?? 45) >= 45 ? 5 : 4;

  const pool = exercises.filter(
    (e) =>
      allowed.includes(e.difficulty) &&
      (e.location === "both" || e.location === place),
  );

  return split.map((groups, i) => {
    const picked: Exercise[] = [];
    let guard = 0;
    while (picked.length < perDay && guard < 40) {
      const group = groups[picked.length % groups.length]!;
      const candidate = pool
        .filter((e) => e.muscle_group === group && !picked.some((p) => p.id === e.id))
        .at(picked.length % 3 === 0 ? 0 : (picked.length % 3) - 1);
      if (candidate) picked.push(candidate);
      else {
        const fallback = pool.find((e) => !picked.some((p) => p.id === e.id));
        if (fallback) picked.push(fallback);
        else break;
      }
      guard++;
    }
    return {
      name: DAY_NAMES[i]!,
      focus: groups.map(titleCase).join(" + "),
      exercises: picked,
    };
  });
}

export function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

const SLOT_SHARE: Record<string, number> = {
  breakfast: 0.25,
  "mid-morning snack": 0.1,
  lunch: 0.3,
  "evening snack": 0.1,
  dinner: 0.25,
};

export type MealItem = { food: Food; servings: number };
export type MealPlan = { slot: string; items: MealItem[] };

export function filterFoods(foods: Food[], profile: Partial<Profile>) {
  const pref = profile.food_preference ?? "veg";
  const allergies = (profile.allergies ?? "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);
  return foods.filter((f) => {
    if (pref === "vegan" && !f.is_vegan) return false;
    if (pref === "veg" && !f.is_veg) return false;
    if (allergies.some((a) => f.name.toLowerCase().includes(a))) return false;
    return true;
  });
}

export function generateMealPlan(
  foods: Food[],
  profile: Partial<Profile>,
  seed = 0,
): MealPlan[] {
  const pool = filterFoods(foods, profile);
  const targets = macroTargets(profile);
  return MEAL_SLOTS.map((slot, slotIndex) => {
    const slotCalories = targets.calories * (SLOT_SHARE[slot] ?? 0.2);
    const candidates = pool.filter((f) => f.meal_slot === slot);
    const usable = candidates.length ? candidates : pool;
    const items: MealItem[] = [];
    let total = 0;
    let i = 0;
    while (total < slotCalories * 0.85 && i < 4 && usable.length) {
      const food = usable[(seed + slotIndex * 3 + i) % usable.length]!;
      if (items.some((it) => it.food.id === food.id)) {
        i++;
        continue;
      }
      const remaining = slotCalories - total;
      const servings = Math.max(0.5, Math.round((remaining / food.calories) * 2) / 2);
      const capped = Math.min(servings, 3);
      items.push({ food, servings: capped });
      total += food.calories * capped;
      i++;
    }
    return { slot, items };
  });
}

export function sumMeal(items: MealItem[]) {
  return items.reduce(
    (acc, it) => ({
      calories: acc.calories + it.food.calories * it.servings,
      protein: acc.protein + it.food.protein * it.servings,
      carbs: acc.carbs + it.food.carbs * it.servings,
      fat: acc.fat + it.food.fat * it.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
