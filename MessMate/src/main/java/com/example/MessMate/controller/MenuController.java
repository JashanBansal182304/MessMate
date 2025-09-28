package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.entity.DailyMenu;
import com.example.MessMate.entity.MealBooking;
import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MenuController {
    
    private final MenuService menuService;
    
    // MenuItem endpoints
    @GetMapping("/items")
    public ResponseEntity<ApiResponse> getAllMenuItems() {
        List<MenuItem> items = menuService.getAllMenuItems();
        return ResponseEntity.ok(ApiResponse.success("Menu items retrieved successfully", items));
    }
    
    @GetMapping("/items/meal-type/{mealType}")
    public ResponseEntity<ApiResponse> getMenuItemsByMealType(@PathVariable MenuItem.MealType mealType) {
        List<MenuItem> items = menuService.getAvailableMenuItemsByMealType(mealType);
        return ResponseEntity.ok(ApiResponse.success("Menu items retrieved successfully", items));
    }
    
    @GetMapping("/items/category/{category}")
    public ResponseEntity<ApiResponse> getMenuItemsByCategory(@PathVariable MenuItem.FoodCategory category) {
        List<MenuItem> items = menuService.getMenuItemsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Menu items retrieved successfully", items));
    }
    
    @GetMapping("/items/vegetarian")
    public ResponseEntity<ApiResponse> getVegetarianMenuItems() {
        List<MenuItem> items = menuService.getVegetarianMenuItems();
        return ResponseEntity.ok(ApiResponse.success("Vegetarian menu items retrieved successfully", items));
    }
    
    @GetMapping("/items/search")
    public ResponseEntity<ApiResponse> searchMenuItems(@RequestParam String name) {
        List<MenuItem> items = menuService.searchMenuItems(name);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", items));
    }
    
    @PostMapping("/items")
    public ResponseEntity<ApiResponse> createMenuItem(@RequestBody MenuItem menuItem) {
        try {
            MenuItem created = menuService.createMenuItem(menuItem);
            return ResponseEntity.ok(ApiResponse.success("Menu item created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem menuItem) {
        try {
            menuItem.setId(id);
            MenuItem updated = menuService.updateMenuItem(menuItem);
            return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse> deleteMenuItem(@PathVariable Long id) {
        try {
            menuService.deleteMenuItem(id);
            return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Daily Menu endpoints
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse> getAllDailyMenus() {
        List<DailyMenu> menus = menuService.getAllDailyMenus();
        return ResponseEntity.ok(ApiResponse.success("Daily menus retrieved successfully", menus));
    }
    
    @GetMapping("/daily/today")
    public ResponseEntity<ApiResponse> getTodaysMenu() {
        List<DailyMenu> menu = menuService.getTodaysMenu();
        return ResponseEntity.ok(ApiResponse.success("Today's menu retrieved successfully", menu));
    }
    
    @GetMapping("/daily/today/{mealType}")
    public ResponseEntity<ApiResponse> getTodaysMenuByMealType(@PathVariable MenuItem.MealType mealType) {
        return menuService.getTodaysMenuByMealType(mealType)
                .map(menu -> ResponseEntity.ok(ApiResponse.success("Menu retrieved successfully", menu)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/daily/date/{date}")
    public ResponseEntity<ApiResponse> getMenuByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DailyMenu> menu = menuService.getMenuByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Menu retrieved successfully", menu));
    }
    
    @GetMapping("/daily/weekly")
    public ResponseEntity<ApiResponse> getWeeklyMenu(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DailyMenu> menu = menuService.getWeeklyMenu(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Weekly menu retrieved successfully", menu));
    }
    
    @PostMapping("/daily")
    public ResponseEntity<ApiResponse> createDailyMenu(@RequestBody DailyMenu dailyMenu) {
        try {
            DailyMenu created = menuService.createDailyMenu(dailyMenu);
            return ResponseEntity.ok(ApiResponse.success("Daily menu created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/daily/{id}")
    public ResponseEntity<ApiResponse> deleteDailyMenu(@PathVariable Long id) {
        try {
            menuService.deleteDailyMenu(id);
            return ResponseEntity.ok(ApiResponse.success("Daily menu deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Meal booking endpoint
    @PostMapping("/book")
    public ResponseEntity<ApiResponse> bookMeal(@RequestBody BookMealRequest request) {
        try {
            // Validate the request
            if (request.getDailyMenuId() == null || request.getQuantity() <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid booking request"));
            }
            
            // Create actual meal booking in database
            MealBooking booking = menuService.createMealBooking(request);
            return ResponseEntity.ok(ApiResponse.success("Meal booked successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get booking statistics for admin dashboard
    @GetMapping("/bookings/stats")
    public ResponseEntity<ApiResponse> getBookingStats() {
        try {
            List<BookingStatsDTO> stats = menuService.getBookingStatistics();
            return ResponseEntity.ok(ApiResponse.success("Booking statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get booking statistics for a specific date
    @GetMapping("/bookings/stats/{date}")
    public ResponseEntity<ApiResponse> getBookingStatsByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<BookingStatsDTO> stats = menuService.getBookingStatisticsByDate(date);
            return ResponseEntity.ok(ApiResponse.success("Booking statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // DTO for booking statistics
    public static class BookingStatsDTO {
        private LocalDate menuDate;  // Changed from 'date' to 'menuDate'
        private String mealType;
        private Integer totalQuantity;
        private Integer totalBookings;  // Changed from 'bookingCount' to 'totalBookings'
        
        public BookingStatsDTO(LocalDate menuDate, String mealType, Integer totalQuantity, Integer totalBookings) {
            this.menuDate = menuDate;
            this.mealType = mealType;
            this.totalQuantity = totalQuantity;
            this.totalBookings = totalBookings;
        }
        
        public LocalDate getMenuDate() { return menuDate; }
        public void setMenuDate(LocalDate menuDate) { this.menuDate = menuDate; }
        public String getMealType() { return mealType; }
        public void setMealType(String mealType) { this.mealType = mealType; }
        public Integer getTotalQuantity() { return totalQuantity; }
        public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }
        public Integer getTotalBookings() { return totalBookings; }
        public void setTotalBookings(Integer totalBookings) { this.totalBookings = totalBookings; }
    }
    
    // DTO for meal booking
    public static class BookMealRequest {
        private Long dailyMenuId;
        private Integer quantity;
        private String specialInstructions;
        
        public Long getDailyMenuId() { return dailyMenuId; }
        public void setDailyMenuId(Long dailyMenuId) { this.dailyMenuId = dailyMenuId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    }
}
