package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.entity.User;
import com.example.MessMate.repository.UserRepository;
import com.example.MessMate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            // Validate input
            if (email == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Missing required fields: email, currentPassword, newPassword")
                );
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("New password must be at least 6 characters long")
                );
            }
            
            // Find the admin user
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("User not found")
                );
            }
            
            User user = userOpt.get();
            
            // Verify user is admin
            if (user.getUserType() != User.UserType.ADMIN) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Access denied. Admin privileges required.")
                );
            }
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Current password is incorrect")
                );
            }
            
            // Update password
            String encodedNewPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedNewPassword);
            userRepository.save(user);
            
            return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully", null)
            );
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to change password: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/profile/{email}")
    public ResponseEntity<ApiResponse> getAdminProfile(@PathVariable String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("User not found")
                );
            }
            
            User user = userOpt.get();
            
            if (user.getUserType() != User.UserType.ADMIN) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Access denied. Admin privileges required.")
                );
            }
            
            // Return user profile without password
            Map<String, Object> profile = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "userType", user.getUserType().name(),
                "createdAt", user.getCreatedAt()
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("Admin profile retrieved successfully", profile)
            );
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to retrieve profile: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/debug/{email}")
    public ResponseEntity<ApiResponse> debugAdminUser(@PathVariable String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                // Try to create admin if not exists
                return ResponseEntity.ok(
                    ApiResponse.error("Admin user not found in database. Please check if the application initialized properly.")
                );
            }
            
            User user = userOpt.get();
            
            // Return debug info (without actual password)
            Map<String, Object> debugInfo = Map.of(
                "exists", true,
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "userType", user.getUserType().name(),
                "rollNumber", user.getRollNumber(),
                "passwordExists", user.getPassword() != null && !user.getPassword().isEmpty(),
                "passwordLength", user.getPassword() != null ? user.getPassword().length() : 0,
                "createdAt", user.getCreatedAt()
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("Admin debug info retrieved", debugInfo)
            );
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Debug failed: " + e.getMessage())
            );
        }
    }
    
    @PostMapping("/verify-password")
    public ResponseEntity<ApiResponse> verifyPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Missing email or password")
                );
            }
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(
                    ApiResponse.error("User not found")
                );
            }
            
            User user = userOpt.get();
            boolean matches = passwordEncoder.matches(password, user.getPassword());
            
            Map<String, Object> result = Map.of(
                "email", email,
                "passwordMatches", matches,
                "userType", user.getUserType().name()
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("Password verification completed", result)
            );
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Verification failed: " + e.getMessage())
            );
        }
    }
    
    @PostMapping("/ensure-admin-exists")
    public ResponseEntity<ApiResponse> ensureAdminExists() {
        try {
            // Force initialization of default admin
            userService.initializeDefaultAdmin();
            
            // Check if admin exists now
            Optional<User> adminOpt = userRepository.findByEmail("admin@messmate.com");
            
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                Map<String, Object> info = Map.of(
                    "exists", true,
                    "email", admin.getEmail(),
                    "name", admin.getName(),
                    "userType", admin.getUserType().name(),
                    "message", "Admin user exists and is ready"
                );
                return ResponseEntity.ok(
                    ApiResponse.success("Admin user verified", info)
                );
            } else {
                return ResponseEntity.ok(
                    ApiResponse.error("Failed to create admin user")
                );
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to ensure admin exists: " + e.getMessage())
            );
        }
    }
}
