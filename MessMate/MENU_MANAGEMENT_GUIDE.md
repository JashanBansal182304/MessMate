# Menu Management System - Implementation Guide

## Overview
This document describes the complete menu management system where staff and admin can add/update menus that are stored in the database and displayed across all three dashboards (Student, Staff, Admin).

## Architecture

### Backend (Database-First Approach)
- **Menu Items**: Individual food items stored in `menu_items` table
- **Daily Menus**: Daily meal plans stored in `daily_menus` table with relationships to menu items
- **API Endpoints**: RESTful APIs for CRUD operations

### Frontend (Multi-Dashboard Sync)
- **Admin Dashboard**: Can create menu items and daily menus
- **Staff Dashboard**: Can create menu items and manage availability
- **Student Dashboard**: Views menus for meal booking
- **Landing Page**: Displays today's menu for public viewing

## Database Schema

### menu_items table
- `id` (Primary Key)
- `name` (Item name)
- `description` (Item description)
- `price` (BigDecimal)
- `meal_type` (BREAKFAST, LUNCH, DINNER)
- `category` (MAIN_COURSE, STARTER, DESSERT, BEVERAGE)
- `is_available` (Boolean)
- `is_vegetarian` (Boolean)
- `image_url` (Optional)
- `created_at`, `updated_at`

### daily_menus table
- `id` (Primary Key)
- `menu_date` (LocalDate)
- `meal_type` (BREAKFAST, LUNCH, DINNER)
- `is_active` (Boolean)
- `created_at`, `updated_at`

### daily_menu_items table (Join Table)
- `daily_menu_id` (Foreign Key)
- `menu_item_id` (Foreign Key)

## API Endpoints

### Menu Items
- `GET /api/menu/items` - Get all menu items
- `POST /api/menu/items` - Create new menu item
- `PUT /api/menu/items/{id}` - Update menu item
- `DELETE /api/menu/items/{id}` - Delete menu item
- `GET /api/menu/items/meal-type/{mealType}` - Get items by meal type

### Daily Menus
- `GET /api/menu/daily/today` - Get today's complete menu
- `GET /api/menu/daily/date/{date}` - Get menu for specific date
- `POST /api/menu/daily` - Create daily menu
- `GET /api/menu/daily/weekly` - Get weekly menu range

## Frontend Implementation

### Admin Dashboard Menu Management
```javascript
// Creates menu items and daily menu in database
async function addMenu(event) {
    // 1. Parse menu items from form
    // 2. Create individual menu items via API
    // 3. Create daily menu linking to those items
    // 4. Refresh UI from database
}
```

### Staff Dashboard Menu Management
```javascript
// Creates individual menu items
async function addMenuItem(e) {
    // 1. Create menu item via API
    // 2. Refresh menu display from database
}

// Updates menu item availability
async function updateMenuItemAvailability(itemId, isAvailable) {
    // 1. Update item via API
    // 2. Refresh menu display
}
```

### Student Dashboard Menu Display
```javascript
// Loads menus from database for meal booking
async function loadMealBookings() {
    // 1. Fetch daily menu from API
    // 2. Transform data for UI
    // 3. Update meal sections with booking options
}
```

## Workflow

### Adding Menu Items (Staff/Admin)
1. **Admin** or **Staff** creates menu items using their dashboard
2. Menu items are stored in `menu_items` table via API
3. Items are immediately available across all dashboards

### Creating Daily Menus (Admin)
1. **Admin** selects menu items and creates daily menu
2. Daily menu is stored in `daily_menus` table with item relationships
3. Daily menu appears in all dashboards for the specified date

### Viewing Menus (Students)
1. **Students** select a date in their dashboard
2. System fetches daily menu from database via API
3. Available meals are displayed with booking options

### Public Menu Display (Landing Page)
1. Landing page automatically loads today's menu
2. Displays all available meals for public viewing
3. Updates in real-time when staff/admin add items

## Key Features

### Cross-Dashboard Synchronization ✅
- Menus added by admin/staff appear immediately in student dashboard
- All data stored in central database
- No localStorage dependencies for menu data

### Real-Time Updates ✅
- Changes reflect across all dashboards instantly
- Database-first approach ensures consistency
- API-driven updates for reliability

### Role-Based Access ✅
- **Admin**: Full menu management (create, update, delete)
- **Staff**: Menu item creation and availability management
- **Students**: View-only access for meal booking

### Data Persistence ✅
- All menu data stored in PostgreSQL database
- Survives browser refreshes and cross-device access
- Backup and recovery through database

## Error Handling
- Network error handling with user feedback
- Validation for required fields
- Graceful fallbacks when API is unavailable
- Clear success/error notifications

## Usage Examples

### Admin Adding Weekly Menu
1. Go to Admin Dashboard → Daily Menu Management
2. Select date and meal type
3. Enter comma-separated menu items
4. Set price and submit
5. Menu appears in all dashboards for that date

### Staff Adding New Item
1. Go to Staff Dashboard → Menu Management
2. Fill item name, meal type, and status
3. Submit form
4. Item is created in database and available system-wide

### Student Booking Meals
1. Go to Student Dashboard → Meal Booking
2. Select date using date picker
3. View available menus loaded from database
4. Book desired meals

## Testing
- Test menu creation from admin dashboard
- Test menu item creation from staff dashboard
- Verify menus appear in student dashboard
- Check landing page displays today's menu
- Test cross-dashboard synchronization

## Benefits
1. **Centralized Data**: Single source of truth in database
2. **Real-Time Sync**: Changes visible immediately across all dashboards
3. **Scalability**: Can handle multiple staff/admin users
4. **Reliability**: Database persistence with proper error handling
5. **User Experience**: Intuitive interface with clear feedback