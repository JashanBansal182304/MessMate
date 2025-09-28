package com.example.MessMate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "daily_menus", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"menu_date", "meal_type"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyMenu {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDate menuDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MenuItem.MealType mealType;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "daily_menu_items",
        joinColumns = @JoinColumn(name = "daily_menu_id"),
        inverseJoinColumns = @JoinColumn(name = "menu_item_id")
    )
    private List<MenuItem> menuItems;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
