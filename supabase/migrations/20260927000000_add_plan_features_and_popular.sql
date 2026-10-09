-- Migration: Add features array and popular boolean flag to public.plans
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;

-- Backfill default starter plan
UPDATE public.plans
SET features = ARRAY[
  '4 Butter Rotis',
  'Seasonal Veggie',
  'Dal Tadka',
  'Steamed Rice',
  'Salad & Pickle'
]
WHERE code = 'starter' AND (features IS NULL OR array_length(features, 1) IS NULL);

-- Backfill default regular plan (popular)
UPDATE public.plans
SET features = ARRAY[
  '4 Butter Rotis',
  'Two Seasonal Veggies',
  'Premium Dal',
  'Basmati Rice',
  'Dessert (Fri)',
  'Salad & Pickle'
], popular = true
WHERE code = 'regular' AND (features IS NULL OR array_length(features, 1) IS NULL);

-- Backfill default family plan
UPDATE public.plans
SET features = ARRAY[
  'Standard Thali x 2',
  'Large Portions',
  'Extra Sides',
  'Full Week Variety',
  'Free Weekend Special'
]
WHERE code = 'family' AND (features IS NULL OR array_length(features, 1) IS NULL);
