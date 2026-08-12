import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { todayISO, type Exercise, type Food, type Profile } from "@/lib/fitness";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: async (): Promise<Exercise[]> => {
      const { data, error } = await supabase.from("exercises").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Exercise[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFoods() {
  return useQuery({
    queryKey: ["foods"],
    queryFn: async (): Promise<Food[]> => {
      const { data, error } = await supabase.from("foods").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Food[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export type FoodLog = {
  id: string;
  food_name: string;
  meal_slot: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  log_date: string;
};

export function useFoodLogs(date = todayISO()) {
  return useQuery({
    queryKey: ["food_logs", date],
    queryFn: async (): Promise<FoodLog[]> => {
      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("log_date", date)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as FoodLog[];
    },
  });
}

export function useAddFoodLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      food_id: string | null;
      food_name: string;
      meal_slot: string;
      servings: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await supabase.from("food_logs").insert({
        ...entry,
        user_id: auth.user.id,
        log_date: todayISO(),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food_logs"] }),
  });
}

export function useRemoveFoodLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("food_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food_logs"] }),
  });
}

export function useWaterLogs(date = todayISO()) {
  return useQuery({
    queryKey: ["water_logs", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("water_logs")
        .select("*")
        .eq("log_date", date)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as { id: string; amount_ml: number; created_at: string }[];
    },
  });
}

export function useAddWater() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount_ml: number) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("water_logs")
        .insert({ user_id: auth.user.id, amount_ml, log_date: todayISO() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water_logs"] }),
  });
}

export function useRemoveWater() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("water_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water_logs"] }),
  });
}

export type WorkoutLog = {
  id: string;
  log_date: string;
  focus: string;
  duration_minutes: number | null;
  completed: boolean;
};

export type WorkoutLogExercise = {
  id: string;
  workout_log_id: string;
  exercise_id: string | null;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  completed: boolean;
};

export function useWorkoutLogs() {
  return useQuery({
    queryKey: ["workout_logs"],
    queryFn: async (): Promise<WorkoutLog[]> => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .order("log_date", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as WorkoutLog[];
    },
  });
}

export function useSessionExercises(workoutLogId: string | undefined) {
  return useQuery({
    queryKey: ["workout_log_exercises", workoutLogId],
    enabled: !!workoutLogId,
    queryFn: async (): Promise<WorkoutLogExercise[]> => {
      const { data, error } = await supabase
        .from("workout_log_exercises")
        .select("*")
        .eq("workout_log_id", workoutLogId!)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as WorkoutLogExercise[];
    },
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      focus: string;
      exercises: { exercise_id: string; exercise_name: string; sets: number }[];
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { data: log, error } = await supabase
        .from("workout_logs")
        .insert({ user_id: auth.user.id, focus: payload.focus, log_date: todayISO() })
        .select("*")
        .single();
      if (error) throw error;
      if (payload.exercises.length) {
        const { error: exError } = await supabase.from("workout_log_exercises").insert(
          payload.exercises.map((e) => ({
            user_id: auth.user!.id,
            workout_log_id: log.id,
            exercise_id: e.exercise_id,
            exercise_name: e.exercise_name,
            sets: e.sets,
          })),
        );
        if (exError) throw exError;
      }
      return log as WorkoutLog;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout_logs"] });
      qc.invalidateQueries({ queryKey: ["workout_log_exercises"] });
    },
  });
}

export function useUpdateSessionExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<WorkoutLogExercise> }) => {
      const { error } = await supabase.from("workout_log_exercises").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout_log_exercises"] }),
  });
}

export function useFinishSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, duration }: { id: string; duration: number }) => {
      const { error } = await supabase
        .from("workout_logs")
        .update({ completed: true, duration_minutes: duration })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout_logs"] }),
  });
}

/** Consecutive-day streak from the most recent completed workout. */
export function workoutStreak(logs: WorkoutLog[]) {
  const done = new Set(logs.filter((l) => l.completed).map((l) => l.log_date));
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (done.has(iso)) streak++;
    else if (i > 0) break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
