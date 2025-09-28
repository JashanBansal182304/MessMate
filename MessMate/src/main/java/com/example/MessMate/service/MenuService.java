package com.example.MessMate.service;

import com.example.MessMate.entity.DailyMenu;
import com.example.MessMate.entity.MealBooking;
import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.repository.DailyMenuRepository;
import com.example.MessMate.repository.MealBookingRepository;
import com.example.MessMate.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MenuService {
    
    private final MenuItemRepository menuItemRepository;
    private final DailyMenuRepository dailyMenuRepository;
    private final MealBookingRepository mealBookingRepository;
    
    // MenuItem operations
    public MenuItem createMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }
    
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }
    
    public List<MenuItem> getAvailableMenuItemsByMealType(MenuItem.MealType mealType) {
        return menuItemRepository.findByMealTypeAndIsAvailableTrue(mealType);
    }
    
    public List<MenuItem> getMenuItemsByCategory(MenuItem.FoodCategory category) {
        return menuItemRepository.findByCategoryAndIsAvailableTrue(category);
    }
    
    public List<MenuItem> getVegetarianMenuItems() {
        return menuItemRepository.findByIsVegetarianAndIsAvailableTrue(true);
    }
    
    public List<MenuItem> searchMenuItems(String name) {
        return menuItemRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue(name);
    }
    
    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }
    
    public MenuItem updateMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }
    
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }
    
    // DailyMenu operations
    public DailyMenu createDailyMenu(DailyMenu dailyMenu) {
        return dailyMenuRepository.save(dailyMenu);
    }
    
    public List<DailyMenu> getAllDailyMenus() {
        return dailyMenuRepository.findAll();
    }
    
    public List<DailyMenu> getTodaysMenu() {
        return dailyMenuRepository.findByMenuDateAndIsActiveTrue(LocalDate.now());
    }
    
    public Optional<DailyMenu> getTodaysMenuByMealType(MenuItem.MealType mealType) {
        return dailyMenuRepository.findByMenuDateAndMealTypeAndIsActiveTrue(LocalDate.now(), mealType);
    }
    
    public List<DailyMenu> getMenuByDate(LocalDate date) {
        return dailyMenuRepository.findByMenuDateAndIsActiveTrue(date);
    }
    
    public List<DailyMenu> getWeeklyMenu(LocalDate startDate, LocalDate endDate) {
        return dailyMenuRepository.findByMenuDateBetweenAndIsActiveTrue(startDate, endDate);
    }
    
    public DailyMenu updateDailyMenu(DailyMenu dailyMenu) {
        return dailyMenuRepository.save(dailyMenu);
    }
    
    public void deleteDailyMenu(Long id) {
        dailyMenuRepository.deleteById(id);
    }
    
    // Meal booking operations
    @Transactional
    public MealBooking createMealBooking(com.example.MessMate.controller.MenuController.BookMealRequest request) {
        // Find the daily menu
        DailyMenu dailyMenu = dailyMenuRepository.findById(request.getDailyMenuId())
                .orElseThrow(() -> new IllegalArgumentException("Daily menu not found with ID: " + request.getDailyMenuId()));
        
        // Check if a booking already exists for this daily menu
        List<MealBooking> existingBookings = mealBookingRepository.findByDailyMenuIdExplicit(request.getDailyMenuId());
        
        // Debug logging
        System.out.println("DEBUG: Looking for existing bookings for daily menu ID: " + request.getDailyMenuId());
        System.out.println("DEBUG: Found " + existingBookings.size() + " existing bookings");
        for (MealBooking booking : existingBookings) {
            System.out.println("DEBUG: Existing booking - ID: " + booking.getId() + ", Quantity: " + booking.getQuantity());
        }
        
        if (!existingBookings.isEmpty()) {
            // Update existing booking by increasing quantity
            MealBooking existingBooking = existingBookings.get(0);
            existingBooking.setQuantity(existingBooking.getQuantity() + request.getQuantity());
            
            // Append special instructions if provided
            if (request.getSpecialInstructions() != null && !request.getSpecialInstructions().trim().isEmpty()) {
                String currentInstructions = existingBooking.getSpecialInstructions();
                if (currentInstructions == null || currentInstructions.trim().isEmpty()) {
                    existingBooking.setSpecialInstructions(request.getSpecialInstructions());
                } else {
                    existingBooking.setSpecialInstructions(currentInstructions + "; " + request.getSpecialInstructions());
                }
            }
            
            return mealBookingRepository.save(existingBooking);
        } else {
            // Create new booking if none exists
            MealBooking booking = new MealBooking();
            booking.setDailyMenu(dailyMenu);
            booking.setQuantity(request.getQuantity());
            booking.setSpecialInstructions(request.getSpecialInstructions());
            booking.setStatus(MealBooking.BookingStatus.CONFIRMED);
            
            return mealBookingRepository.save(booking);
        }
    }
    
    // Clear all meal bookings (for testing/cleanup)
    public void clearAllBookings() {
        mealBookingRepository.deleteAll();
    }
    
    // Get booking statistics for admin dashboard
    public List<com.example.MessMate.controller.MenuController.BookingStatsDTO> getBookingStatistics() {
        List<MealBooking> bookings = mealBookingRepository.findAll();
        Map<String, com.example.MessMate.controller.MenuController.BookingStatsDTO> statsMap = new HashMap<>();
        
        for (MealBooking booking : bookings) {
            if (booking.getDailyMenu() != null) {
                LocalDate date = booking.getDailyMenu().getMenuDate();
                String mealType = booking.getDailyMenu().getMealType().toString();
                String key = date + "_" + mealType;
                
                if (statsMap.containsKey(key)) {
                    com.example.MessMate.controller.MenuController.BookingStatsDTO existing = statsMap.get(key);
                    existing.setTotalQuantity(existing.getTotalQuantity() + booking.getQuantity());
                    existing.setTotalBookings(existing.getTotalBookings() + 1);
                } else {
                    statsMap.put(key, new com.example.MessMate.controller.MenuController.BookingStatsDTO(
                        date, mealType, booking.getQuantity(), 1
                    ));
                }
            }
        }
        
        return new ArrayList<>(statsMap.values());
    }
    
    // Get booking statistics for a specific date
    public List<com.example.MessMate.controller.MenuController.BookingStatsDTO> getBookingStatisticsByDate(LocalDate date) {
        List<DailyMenu> dailyMenus = dailyMenuRepository.findByMenuDateAndIsActiveTrue(date);
        List<com.example.MessMate.controller.MenuController.BookingStatsDTO> stats = new ArrayList<>();
        
        for (DailyMenu dailyMenu : dailyMenus) {
            List<MealBooking> bookings = mealBookingRepository.findByDailyMenuId(dailyMenu.getId());
            
            int totalQuantity = bookings.stream().mapToInt(MealBooking::getQuantity).sum();
            int bookingCount = bookings.size();
            
            stats.add(new com.example.MessMate.controller.MenuController.BookingStatsDTO(
                date, dailyMenu.getMealType().toString(), totalQuantity, bookingCount
            ));
        }
        
        return stats;
    }
}
