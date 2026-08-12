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
  component: Workouts;
});

function Workouts() {
  return null;
}
