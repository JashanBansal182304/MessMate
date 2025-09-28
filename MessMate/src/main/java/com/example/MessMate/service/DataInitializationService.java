package com.example.MessMate.service;

import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.entity.User;
import com.example.MessMate.repository.MenuItemRepository;
import com.example.MessMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Order(2)
public class DataInitializationService implements CommandLineRunner {
    
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
        initializeMenuItems();
    }
    
    private void initializeUsers() {
        System.out.println("Checking user count...");
        long userCount = userRepository.count();
        System.out.println("Current user count: " + userCount);
        
        if (userCount == 0) {
            System.out.println("Creating sample users...");
            try {
                // Create sample student user
                User student = new User();
                student.setName("Test Student");
                student.setEmail("test@example.com");
                student.setPassword("password123"); // In real app, this should be encrypted
                student.setRollNumber("STU001");
                student.setPhone("9876543210");
                student.setUserType(User.UserType.STUDENT);
                student.setHostel("Hostel A");
                student.setRoom("101");
                
                // Create sample staff user
                User staff = new User();
                staff.setName("Test Staff");
                staff.setEmail("staff@example.com");
                staff.setPassword("password123"); // In real app, this should be encrypted
                staff.setRollNumber("STF001");
                staff.setPhone("9876543211");
                staff.setUserType(User.UserType.STAFF);
                
                // Create admin user
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@example.com");
                admin.setPassword("admin123");
                admin.setRollNumber("ADM001");
                admin.setPhone("9876543212");
                admin.setUserType(User.UserType.ADMIN);
                
                userRepository.saveAll(Arrays.asList(student, staff, admin));
                
                // Verify users were saved
                long finalCount = userRepository.count();
                System.out.println("Sample users created successfully! Final count: " + finalCount);
                
                // List created users
                userRepository.findAll().forEach(user -> 
                    System.out.println("Created user: " + user.getEmail() + " (" + user.getUserType() + ")")
                );
                
            } catch (Exception e) {
                System.err.println("Error creating sample users: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("Users already exist, skipping initialization");
            // List existing users
            userRepository.findAll().forEach(user -> 
                System.out.println("Existing user: " + user.getEmail() + " (" + user.getUserType() + ")")
            );
        }
    }
    
    private void initializeMenuItems() {
        if (menuItemRepository.count() == 0) {
            List<MenuItem> menuItems = Arrays.asList(
                // Breakfast Items
                createMenuItem("Idli Sambar", "Steamed rice cakes with lentil curry", new BigDecimal("25.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.MAIN_COURSE, true, true),
                createMenuItem("Dosa", "Crispy rice pancake", new BigDecimal("30.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.MAIN_COURSE, true, true),
                createMenuItem("Upma", "Semolina breakfast dish", new BigDecimal("20.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.MAIN_COURSE, true, true),
                createMenuItem("Poha", "Flattened rice with vegetables", new BigDecimal("22.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.MAIN_COURSE, true, true),
                createMenuItem("Tea", "Hot milk tea", new BigDecimal("10.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.BEVERAGE, true, true),
                
                // Lunch Items
                createMenuItem("Rice", "Steamed white rice", new BigDecimal("15.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.RICE, true, true),
                createMenuItem("Dal Tadka", "Tempered lentil curry", new BigDecimal("25.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.CURRY, true, true),
                createMenuItem("Vegetable Curry", "Mixed vegetable curry", new BigDecimal("30.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.CURRY, true, true),
                createMenuItem("Chicken Curry", "Spicy chicken curry", new BigDecimal("45.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.CURRY, true, false),
                createMenuItem("Roti", "Indian flatbread", new BigDecimal("8.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.BREAD, true, true),
                createMenuItem("Salad", "Fresh vegetable salad", new BigDecimal("15.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.SALAD, true, true),
                createMenuItem("Curd Rice", "Rice with yogurt", new BigDecimal("20.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.RICE, true, true),
                
                // Snacks
                createMenuItem("Samosa", "Fried pastry with filling", new BigDecimal("12.00"), 
                    MenuItem.MealType.SNACKS, MenuItem.FoodCategory.SNACK, true, true),
                createMenuItem("Pakora", "Vegetable fritters", new BigDecimal("15.00"), 
                    MenuItem.MealType.SNACKS, MenuItem.FoodCategory.SNACK, true, true),
                createMenuItem("Sandwich", "Vegetable sandwich", new BigDecimal("25.00"), 
                    MenuItem.MealType.SNACKS, MenuItem.FoodCategory.SNACK, true, true),
                createMenuItem("Coffee", "Hot coffee", new BigDecimal("12.00"), 
                    MenuItem.MealType.SNACKS, MenuItem.FoodCategory.BEVERAGE, true, true),
                
                // Dinner Items
                createMenuItem("Chapati", "Whole wheat flatbread", new BigDecimal("8.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.BREAD, true, true),
                createMenuItem("Paneer Curry", "Cottage cheese curry", new BigDecimal("40.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.CURRY, true, true),
                createMenuItem("Fish Curry", "Spicy fish curry", new BigDecimal("50.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.CURRY, true, false),
                createMenuItem("Jeera Rice", "Cumin flavored rice", new BigDecimal("18.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.RICE, true, true),
                createMenuItem("Ice Cream", "Vanilla ice cream", new BigDecimal("25.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.DESSERT, true, true)
            );
            
            menuItemRepository.saveAll(menuItems);
            System.out.println("Sample menu items initialized successfully!");
        }
    }
    
    private MenuItem createMenuItem(String name, String description, BigDecimal price, 
                                  MenuItem.MealType mealType, MenuItem.FoodCategory category, 
                                  boolean isAvailable, boolean isVegetarian) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setMealType(mealType);
        item.setCategory(category);
        item.setIsAvailable(isAvailable);
        item.setIsVegetarian(isVegetarian);
        return item;
    }
}
