package com.example.MessMate.service;

import com.example.MessMate.dto.OrderRequest;
import com.example.MessMate.entity.MealOrder;
import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.entity.User;
import com.example.MessMate.repository.MealOrderRepository;
import com.example.MessMate.repository.MenuItemRepository;
import com.example.MessMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final MealOrderRepository mealOrderRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    
    public MealOrder createOrder(MealOrder order) {
        // Validate order and menu items
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }
        
        if (order.getMenuItems() == null || order.getMenuItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one menu item");
        }
        
        // Calculate total amount with null safety
        BigDecimal totalAmount = order.getMenuItems().stream()
                .filter(item -> item != null) // Filter out null items
                .map(MenuItem::getPrice)
                .filter(price -> price != null) // Filter out null prices
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        order.setTotalAmount(totalAmount);
        order.setStatus(MealOrder.OrderStatus.PENDING);
        
        return mealOrderRepository.save(order);
    }
    
    public List<MealOrder> getUserOrders(User user) {
        return mealOrderRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<MealOrder> getOrdersByStatus(MealOrder.OrderStatus status) {
        return mealOrderRepository.findByStatus(status);
    }
    
    public List<MealOrder> getTodaysOrders(MenuItem.MealType mealType) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return mealOrderRepository.findByMealTypeAndCreatedAtBetween(mealType, startOfDay, endOfDay);
    }
    
    public Optional<MealOrder> getOrderById(Long id) {
        return mealOrderRepository.findById(id);
    }
    
    public MealOrder updateOrderStatus(Long orderId, MealOrder.OrderStatus status) {
        Optional<MealOrder> orderOptional = mealOrderRepository.findById(orderId);
        if (orderOptional.isPresent()) {
            MealOrder order = orderOptional.get();
            order.setStatus(status);
            return mealOrderRepository.save(order);
        }
        throw new RuntimeException("Order not found");
    }
    
    public long getUserOrderCount(User user, LocalDateTime start, LocalDateTime end) {
        return mealOrderRepository.countByUserAndCreatedAtBetween(user, start, end);
    }
    
    public void cancelOrder(Long orderId) {
        updateOrderStatus(orderId, MealOrder.OrderStatus.CANCELLED);
    }
    
    public MealOrder createOrderFromRequest(OrderRequest orderRequest) {
        // Validate order request
        if (orderRequest == null) {
            throw new IllegalArgumentException("Order request cannot be null");
        }
        
        if (orderRequest.getUserEmail() == null || orderRequest.getUserEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("User email is required");
        }
        
        if (orderRequest.getMenuItemIds() == null || orderRequest.getMenuItemIds().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one menu item");
        }
        
        // Look up the actual user from database
        User user = userRepository.findByEmail(orderRequest.getUserEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + orderRequest.getUserEmail()));
        
        // Look up the menu items from database
        List<MenuItem> menuItems = menuItemRepository.findAllById(orderRequest.getMenuItemIds());
        if (menuItems.size() != orderRequest.getMenuItemIds().size()) {
            throw new IllegalArgumentException("One or more menu items not found");
        }
        
        // Calculate total amount from actual menu items
        BigDecimal totalAmount = menuItems.stream()
                .map(MenuItem::getPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Create MealOrder
        MealOrder order = new MealOrder();
        order.setUser(user);
        order.setMenuItems(menuItems);
        order.setTotalAmount(totalAmount);
        order.setMealType(orderRequest.getMealType());
        order.setSpecialInstructions(orderRequest.getSpecialInstructions());
        order.setStatus(MealOrder.OrderStatus.PENDING);
        
        return mealOrderRepository.save(order);
    }
}
