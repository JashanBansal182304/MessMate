package com.example.MessMate.repository;

import com.example.MessMate.entity.DailyMenu;
import com.example.MessMate.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyMenuRepository extends JpaRepository<DailyMenu, Long> {
    
    List<DailyMenu> findByMenuDateAndIsActiveTrue(LocalDate menuDate);
    
    Optional<DailyMenu> findByMenuDateAndMealTypeAndIsActiveTrue(LocalDate menuDate, MenuItem.MealType mealType);
    
    List<DailyMenu> findByMenuDateBetweenAndIsActiveTrue(LocalDate startDate, LocalDate endDate);
    
    List<DailyMenu> findByMealTypeAndIsActiveTrue(MenuItem.MealType mealType);
}
