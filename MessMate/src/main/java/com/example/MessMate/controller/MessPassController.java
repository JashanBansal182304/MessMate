package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.entity.MessPass;
import com.example.MessMate.entity.User;
import com.example.MessMate.service.MessPassService;
import com.example.MessMate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/mess-pass")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessPassController {
    
    private final MessPassService messPassService;
    private final UserService userService;
    
    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createMessPass(
            @RequestParam String userEmail,
            @RequestParam MessPass.PassType passType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate validFrom,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate validUntil) {
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
            
            MessPass messPass = messPassService.createMessPass(userOptional.get(), passType, validFrom, validUntil);
            return ResponseEntity.ok(ApiResponse.success("Mess pass created successfully", messPass));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/user/{email}")
    public ResponseEntity<ApiResponse> getUserMessPass(@PathVariable String email) {
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
            
            return messPassService.getUserMessPass(userOptional.get())
                    .map(pass -> ResponseEntity.ok(ApiResponse.success("Mess pass retrieved successfully", pass)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/number/{passNumber}")
    public ResponseEntity<ApiResponse> getMessPassByNumber(@PathVariable String passNumber) {
        return messPassService.getMessPassByNumber(passNumber)
                .map(pass -> ResponseEntity.ok(ApiResponse.success("Mess pass retrieved successfully", pass)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/recharge")
    public ResponseEntity<ApiResponse> rechargePass(@PathVariable Long id, @RequestParam BigDecimal amount) {
        try {
            MessPass updated = messPassService.rechargePass(id, amount);
            return ResponseEntity.ok(ApiResponse.success("Mess pass recharged successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/deduct")
    public ResponseEntity<ApiResponse> deductBalance(@PathVariable Long id, @RequestParam BigDecimal amount) {
        try {
            MessPass updated = messPassService.deductBalance(id, amount);
            return ResponseEntity.ok(ApiResponse.success("Balance deducted successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse> deactivatePass(@PathVariable Long id) {
        try {
            messPassService.deactivatePass(id);
            return ResponseEntity.ok(ApiResponse.success("Mess pass deactivated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/expired")
    public ResponseEntity<ApiResponse> getExpiredPasses() {
        return ResponseEntity.ok(ApiResponse.success("Expired passes retrieved successfully", 
                messPassService.getExpiredPasses()));
    }
}
