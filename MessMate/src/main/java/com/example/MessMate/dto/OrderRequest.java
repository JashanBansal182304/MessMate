package com.example.MessMate.dto;

import com.example.MessMate.entity.MenuItem;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private String userEmail;
    private List<Long> menuItemIds;
    private BigDecimal totalAmount;
    private MenuItem.MealType mealType;
    private String specialInstructions;
}