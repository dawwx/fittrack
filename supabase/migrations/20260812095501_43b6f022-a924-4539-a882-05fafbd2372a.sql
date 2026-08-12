CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  age integer,
  gender text,
  height_cm numeric,
  weight_kg numeric,
  target_weight_kg numeric,
  fitness_level text,
  goal text,
  location text,
  days_per_week integer DEFAULT 4,
  session_minutes integer DEFAULT 45,
  food_preference text,
  allergies text,
  water_goal_ml integer NOT NULL DEFAULT 3000,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  muscle_group text NOT NULL,
  difficulty text NOT NULL,
  equipment text NOT NULL,
  location text NOT NULL DEFAULT 'both',
  sets integer NOT NULL DEFAULT 3,
  reps text NOT NULL DEFAULT '10-12',
  rest_seconds integer NOT NULL DEFAULT 60,
  instructions text NOT NULL DEFAULT '',
  common_mistakes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read exercises" ON public.exercises FOR SELECT TO authenticated USING (true);

CREATE TABLE public.foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  serving text NOT NULL,
  calories numeric NOT NULL,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  is_veg boolean NOT NULL DEFAULT true,
  is_vegan boolean NOT NULL DEFAULT false,
  meal_slot text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.foods TO authenticated;
GRANT ALL ON public.foods TO service_role;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read foods" ON public.foods FOR SELECT TO authenticated USING (true);

CREATE TABLE public.workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT (now()::date),
  focus text NOT NULL DEFAULT 'Full Body',
  duration_minutes integer,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
GRANT ALL ON public.workout_logs TO service_role;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own workout logs" ON public.workout_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.workout_log_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  workout_log_id uuid NOT NULL REFERENCES public.workout_logs ON DELETE CASCADE,
  exercise_id uuid REFERENCES public.exercises ON DELETE SET NULL,
  exercise_name text NOT NULL,
  sets integer,
  reps integer,
  weight_kg numeric,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_log_exercises TO authenticated;
GRANT ALL ON public.workout_log_exercises TO service_role;
ALTER TABLE public.workout_log_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own workout log exercises" ON public.workout_log_exercises FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  food_id uuid REFERENCES public.foods ON DELETE SET NULL,
  food_name text NOT NULL,
  meal_slot text NOT NULL DEFAULT 'lunch',
  servings numeric NOT NULL DEFAULT 1,
  calories numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  log_date date NOT NULL DEFAULT (now()::date),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_logs TO authenticated;
GRANT ALL ON public.food_logs TO service_role;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own food logs" ON public.food_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount_ml integer NOT NULL,
  log_date date NOT NULL DEFAULT (now()::date),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.water_logs TO authenticated;
GRANT ALL ON public.water_logs TO service_role;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own water logs" ON public.water_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT (now()::date),
  weight_kg numeric,
  waist_cm numeric,
  chest_cm numeric,
  arms_cm numeric,
  thighs_cm numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_logs TO authenticated;
GRANT ALL ON public.progress_logs TO service_role;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress logs" ON public.progress_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.exercises (name, muscle_group, difficulty, equipment, location, sets, reps, rest_seconds, instructions, common_mistakes) VALUES
('Barbell Bench Press','chest','intermediate','barbell','gym',4,'8-10',90,'Lie flat, grip slightly wider than shoulders, lower the bar to mid-chest and press up.','Bouncing the bar off the chest; flaring elbows out to 90 degrees.'),
('Push-Up','chest','beginner','bodyweight','both',3,'12-15',60,'Hands under shoulders, body in a straight line, lower until chest nearly touches the floor.','Sagging hips; partial range of motion.'),
('Incline Dumbbell Press','chest','intermediate','dumbbell','gym',3,'10-12',75,'Set bench to 30 degrees, press dumbbells up and slightly inward.','Setting the incline too steep; short reps.'),
('Lat Pulldown','back','beginner','machine','gym',3,'10-12',75,'Pull the bar to your upper chest, squeezing shoulder blades down.','Leaning back excessively; pulling with the arms only.'),
('Bent-Over Row','back','intermediate','barbell','gym',4,'8-10',90,'Hinge at the hips, keep back flat, row the bar to your lower ribs.','Rounding the lower back; jerking the weight.'),
('Superman Hold','back','beginner','bodyweight','home',3,'20-30s',45,'Lie face down and lift arms, chest and legs off the floor.','Straining the neck upward.'),
('Overhead Press','shoulders','intermediate','barbell','gym',4,'8-10',90,'Press the bar overhead without leaning back, lock out with the head through.','Excessive lower-back arch.'),
('Dumbbell Lateral Raise','shoulders','beginner','dumbbell','both',3,'12-15',45,'Raise dumbbells to shoulder height with a slight elbow bend.','Using momentum; shrugging the traps.'),
('Pike Push-Up','shoulders','intermediate','bodyweight','home',3,'8-12',60,'Hips high, head between hands, lower the crown toward the floor.','Letting hips drop into a plank.'),
('Barbell Curl','biceps','beginner','barbell','gym',3,'10-12',60,'Elbows pinned to sides, curl without swinging the torso.','Swinging the hips to lift.'),
('Dumbbell Hammer Curl','biceps','beginner','dumbbell','both',3,'10-12',60,'Neutral grip, curl straight up keeping the wrists stable.','Rushing the lowering phase.'),
('Triceps Rope Pushdown','triceps','beginner','machine','gym',3,'12-15',45,'Elbows locked at your sides, extend and split the rope at the bottom.','Letting elbows drift forward.'),
('Bench Dip','triceps','beginner','bodyweight','home',3,'10-15',60,'Hands on a bench behind you, lower until elbows reach 90 degrees.','Shrugging shoulders to the ears.'),
('Barbell Back Squat','legs','advanced','barbell','gym',4,'6-8',120,'Bar on upper back, sit down and back, drive up through mid-foot.','Knees caving in; heels lifting.'),
('Goblet Squat','legs','beginner','dumbbell','both',3,'12-15',60,'Hold a dumbbell at your chest and squat between your knees.','Rounding the upper back.'),
('Romanian Deadlift','legs','intermediate','barbell','gym',3,'8-10',90,'Hinge at hips with soft knees, feel the hamstrings stretch, then stand tall.','Turning it into a squat; rounding the back.'),
('Walking Lunge','legs','beginner','bodyweight','both',3,'12 each leg',60,'Step forward, drop the back knee toward the floor, push through the front foot.','Short steps; front knee collapsing inward.'),
('Plank','core','beginner','bodyweight','both',3,'30-60s',45,'Forearms down, squeeze glutes and abs, body in one line.','Hips too high or sagging.'),
('Hanging Knee Raise','core','intermediate','bodyweight','gym',3,'10-15',60,'Hang from a bar and raise knees toward your chest, controlling the swing.','Swinging for momentum.'),
('Russian Twist','core','beginner','bodyweight','home',3,'20 total',45,'Sit with heels light, rotate the torso side to side.','Moving only the arms.'),
('Burpee','full body','intermediate','bodyweight','both',4,'10-12',60,'Squat, kick back to a push-up, jump the feet in and leap up.','Sloppy landing; skipping the push-up.'),
('Kettlebell Swing','full body','intermediate','kettlebell','both',4,'15-20',60,'Hinge and snap the hips to float the bell to chest height.','Squatting instead of hinging.'),
('Mountain Climber','full body','beginner','bodyweight','home',3,'30-40s',45,'From a plank, drive knees toward the chest alternately.','Bouncing the hips.'),
('Jumping Jack','full body','beginner','bodyweight','home',3,'40-60s',30,'Jump feet out while raising arms overhead, keep a steady rhythm.','Landing with locked knees.');

INSERT INTO public.foods (name, serving, calories, protein, carbs, fat, is_veg, is_vegan, meal_slot) VALUES
('Cooked White Rice','1 cup (150g)',205,4.3,45,0.4,true,true,'lunch'),
('Roti (Whole Wheat)','1 medium',120,3.5,20,3,true,true,'dinner'),
('Toor Dal (cooked)','1 cup',198,12,32,1,true,true,'lunch'),
('Paneer','100g',296,18,3,25,true,false,'dinner'),
('Curd (Plain Yogurt)','1 cup (245g)',149,8.5,11,8,true,false,'mid-morning snack'),
('Toned Milk','1 cup (240ml)',122,8,12,4.8,true,false,'breakfast'),
('Boiled Egg','1 large',78,6.3,0.6,5.3,false,false,'breakfast'),
('Grilled Chicken Breast','100g',165,31,0,3.6,false,false,'lunch'),
('Rohu Fish (cooked)','100g',143,19,0,7,false,false,'dinner'),
('Rolled Oats (dry)','40g',150,5,27,3,true,true,'breakfast'),
('Banana','1 medium',105,1.3,27,0.4,true,true,'mid-morning snack'),
('Apple','1 medium',95,0.5,25,0.3,true,true,'evening snack'),
('Moong Sprouts','1 cup',125,10,22,0.8,true,true,'evening snack'),
('Almonds','15 pieces',105,3.8,3.9,9,true,true,'evening snack'),
('Peanuts (roasted)','30g',170,7,5,14,true,true,'evening snack'),
('Mixed Vegetable Sabzi','1 cup',130,4,14,6,true,true,'dinner'),
('Palak Paneer','1 cup',270,14,10,20,true,false,'dinner'),
('Idli','2 pieces',116,4,24,0.4,true,true,'breakfast'),
('Poha','1 cup',180,4,32,4,true,true,'breakfast'),
('Chana Masala','1 cup',210,11,30,5,true,true,'lunch'),
('Whey Protein Scoop','30g',120,24,3,1.5,true,false,'mid-morning snack'),
('Peanut Butter','1 tbsp',94,4,3,8,true,true,'breakfast'),
('Brown Bread','2 slices',160,6,28,2,true,true,'breakfast'),
('Sweet Potato (boiled)','150g',135,2.5,31,0.2,true,true,'lunch'),
('Cucumber Salad','1 bowl',45,2,8,0.3,true,true,'lunch'),
('Tofu','100g',144,15,3,9,true,true,'dinner'),
('Coconut Water','1 glass (240ml)',46,1.7,9,0.5,true,true,'mid-morning snack'),
('Green Tea','1 cup',2,0,0.5,0,true,true,'evening snack');