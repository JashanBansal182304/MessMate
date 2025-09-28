package com.example.MessMate.repository;

import com.example.MessMate.entity.MealOrder;
import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MealOrderRepository extends JpaRepository<MealOrder, Long> {
    
    List<MealOrder> findByUserOrderByCreatedAtDesc(User user);
    
    List<MealOrder> findByStatus(MealOrder.OrderStatus status);
    
    List<MealOrder> findByMealTypeAndCreatedAtBetween(MenuItem.MealType mealType, LocalDateTime start, LocalDateTime end);
    
    List<MealOrder> findByUserAndStatus(User user, MealOrder.OrderStatus status);
    
    long countByUserAndCreatedAtBetween(User user, LocalDateTime start, LocalDateTime end);
}
