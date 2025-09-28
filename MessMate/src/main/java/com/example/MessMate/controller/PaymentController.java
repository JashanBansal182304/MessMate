package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.entity.MessPass;
import com.example.MessMate.entity.Payment;
import com.example.MessMate.entity.User;
import com.example.MessMate.service.MessPassService;
import com.example.MessMate.service.PaymentService;
import com.example.MessMate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private final PaymentService paymentService;
    private final UserService userService;
    private final MessPassService messPassService;
    
    @PostMapping
    public ResponseEntity<ApiResponse> createPayment(@RequestBody Payment payment) {
        try {
            Payment created = paymentService.createPayment(
                payment.getUser(), 
                payment.getAmount(), 
                payment.getPaymentType(), 
                payment.getDescription()
            );
            return ResponseEntity.ok(ApiResponse.success("Payment created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/recharge")
    public ResponseEntity<ApiResponse> processMessPassRecharge(
            @RequestParam String userEmail,
            @RequestParam BigDecimal amount) {
        try {
            Optional<User> userOptional = userService.getUserByEmail(userEmail)
                    .map(userResponse -> {
                        User user = new User();
                        user.setId(userResponse.getId());
                        user.setEmail(userResponse.getEmail());
                        return user;
                    });
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
            }
            
            Optional<MessPass> messPassOptional = messPassService.getUserMessPass(userOptional.get());
            if (messPassOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Mess pass not found"));
            }
            
            Payment payment = paymentService.processMessPassRecharge(userOptional.get(), messPassOptional.get(), amount);
            return ResponseEntity.ok(ApiResponse.success("Mess pass recharged successfully", payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/user/{email}")
    public ResponseEntity<ApiResponse> getUserPayments(@PathVariable String email) {
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
            
            List<Payment> payments = paymentService.getUserPayments(userOptional.get());
            return ResponseEntity.ok(ApiResponse.success("User payments retrieved successfully", payments));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse> getPaymentsByStatus(@PathVariable Payment.PaymentStatus status) {
        List<Payment> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", payments));
    }
    
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ApiResponse> getPaymentByTransactionId(@PathVariable String transactionId) {
        return paymentService.getPaymentByTransactionId(transactionId)
                .map(payment -> ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updatePaymentStatus(@PathVariable Long id, @RequestParam Payment.PaymentStatus status) {
        try {
            Payment updated = paymentService.updatePaymentStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Payment status updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/report")
    public ResponseEntity<ApiResponse> getPaymentReport(
            @RequestParam Payment.PaymentType paymentType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Payment> payments = paymentService.getPaymentsByTypeAndDateRange(paymentType, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Payment report retrieved successfully", payments));
    }
}
