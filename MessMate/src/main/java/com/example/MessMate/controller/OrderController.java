package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.dto.OrderRequest;
import com.example.MessMate.entity.MealOrder;
import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.entity.User;
import com.example.MessMate.service.OrderService;
import com.example.MessMate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    private final UserService userService;
    
    @PostMapping
    public ResponseEntity<ApiResponse> createOrder(@RequestBody MealOrder order) {
        try {
            MealOrder created = orderService.createOrder(order);
            return ResponseEntity.ok(ApiResponse.success("Order created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createOrderFromRequest(@RequestBody OrderRequest orderRequest) {
        try {
            MealOrder created = orderService.createOrderFromRequest(orderRequest);
            return ResponseEntity.ok(ApiResponse.success("Order created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/user/{email}")
    public ResponseEntity<ApiResponse> getUserOrders(@PathVariable String email) {
        try {
            Optional<User> userOptional = userService.getUserByEmail(email)
                    .map(userResponse -> {
                        User user = new User();
                        user.setId(userResponse.getId());
                        user.setEmail(userResponse.getEmail());
                        return user;
                    });
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
            }
            
            List<MealOrder> orders = orderService.getUserOrders(userOptional.get());
            return ResponseEntity.ok(ApiResponse.success("User orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse> getOrdersByStatus(@PathVariable MealOrder.OrderStatus status) {
        List<MealOrder> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }
    
    @GetMapping("/today/{mealType}")
    public ResponseEntity<ApiResponse> getTodaysOrders(@PathVariable MenuItem.MealType mealType) {
        List<MealOrder> orders = orderService.getTodaysOrders(mealType);
        return ResponseEntity.ok(ApiResponse.success("Today's orders retrieved successfully", orders));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(@PathVariable Long id, @RequestParam MealOrder.OrderStatus status) {
        try {
            MealOrder updated = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(@PathVariable Long id) {
        try {
            orderService.cancelOrder(id);
            return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
