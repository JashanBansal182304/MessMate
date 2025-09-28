-- Fix daily_menu unique constraint to allow multiple meal types per date

-- Drop the existing unique constraint on menu_date only
ALTER TABLE daily_menus DROP CONSTRAINT IF EXISTS ukapervncoltwjirx5mse6547x8;

-- Add a new unique constraint on the combination of menu_date and meal_type
ALTER TABLE daily_menus ADD CONSTRAINT uk_daily_menu_date_meal_type UNIQUE (menu_date, meal_type);