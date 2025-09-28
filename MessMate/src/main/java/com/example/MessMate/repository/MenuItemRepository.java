package com.example.MessMate.repository;

import com.example.MessMate.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    List<MenuItem> findByMealTypeAndIsAvailableTrue(MenuItem.MealType mealType);
    
    List<MenuItem> findByCategoryAndIsAvailableTrue(MenuItem.FoodCategory category);
    
    List<MenuItem> findByIsVegetarianAndIsAvailableTrue(Boolean isVegetarian);
    
    List<MenuItem> findByNameContainingIgnoreCaseAndIsAvailableTrue(String name);
}
