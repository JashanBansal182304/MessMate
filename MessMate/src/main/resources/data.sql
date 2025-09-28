-- Sample data initialization script for MessMate database
-- This script will be executed automatically by Spring Boot

-- Note: The application will automatically create tables based on JPA entities
-- This file contains sample data that can be loaded after table creation

-- Sample menu items are created programmatically in DataInitializationService.java
-- Additional sample data can be added here if needed

-- Example of manual data insertion (commented out as it's handled by the service)
/*
INSERT INTO menu_items (name, description, price, meal_type, category, is_available, is_vegetarian, created_at, updated_at) 
VALUES 
('Special Thali', 'Complete meal with rice, dal, curry, and dessert', 75.00, 'LUNCH', 'MAIN_COURSE', true, true, NOW(), NOW()),
('Masala Chai', 'Spiced Indian tea', 8.00, 'BREAKFAST', 'BEVERAGE', true, true, NOW(), NOW());
*/

-- Database indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number);
CREATE INDEX IF NOT EXISTS idx_menu_items_meal_type ON menu_items(meal_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_daily_menus_date ON daily_menus(menu_date);
CREATE INDEX IF NOT EXISTS idx_meal_orders_user_id ON meal_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_orders_status ON meal_orders(status);
CREATE INDEX IF NOT EXISTS idx_mess_passes_user_id ON mess_passes(user_id);
CREATE INDEX IF NOT EXISTS idx_mess_passes_pass_number ON mess_passes(pass_number);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Feedback table indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_student_id ON feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_replied_by ON feedback(replied_by);
