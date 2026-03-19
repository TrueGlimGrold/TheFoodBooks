-- The Food Books: seed data for Ingredients (testing/dev only)
-- Run after `docs/supabase/ingredients.sql`.

insert into public.ingredients
  (name, unit, price_per_unit, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg)
values
  ('Chicken breast, raw', '100g', 1.80, 165, 31.0, 0.0, 3.6, 0.0, 74),
  ('Rice, cooked', '100g', 0.25, 130, 2.4, 28.2, 0.3, 0.4, 1),
  ('Olive oil', 'tbsp', 0.22, 119, 0.0, 0.0, 13.5, 0.0, 0),
  ('Broccoli', '100g', 0.40, 34, 2.8, 6.6, 0.4, 2.6, 33),
  ('Almonds', '30g', 0.55, 174, 6.0, 6.1, 15.0, 3.5, 0),
  ('Greek yogurt, plain', '100g', 0.65, 59, 10.0, 3.6, 0.4, 0.0, 36)
on conflict (lower(name)) do nothing;

