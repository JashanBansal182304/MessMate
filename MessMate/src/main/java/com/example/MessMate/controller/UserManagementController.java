package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.entity.User;
import com.example.MessMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserManagementController {
    
    private final UserRepository userRepository;
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllUsers() {
        try {
            System.out.println("📋 Getting all users from database...");
            List<User> users = userRepository.findAll();
            System.out.println("📋 Found " + users.size() + " total users");
            
            // Log each user
            users.forEach(user -> 
                System.out.println("   - " + user.getName() + " (" + user.getEmail() + ") - " + user.getUserType())
            );
            
            // Convert users to DTOs (without passwords)
            List<Map<String, Object>> userDTOs = users.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
            
            System.out.println("📋 Returning " + userDTOs.size() + " user DTOs");
            
            return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", userDTOs)
            );
            
        } catch (Exception e) {
            System.err.println("❌ Error retrieving all users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to retrieve users: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getUserStats() {
        try {
            long totalUsers = userRepository.count();
            long studentCount = userRepository.countByUserType(User.UserType.STUDENT);
            long staffCount = userRepository.countByUserType(User.UserType.STAFF);
            long adminCount = userRepository.countByUserType(User.UserType.ADMIN);
            
            Map<String, Object> stats = Map.of(
                "total", totalUsers,
                "students", studentCount,
                "staff", staffCount,
                "admins", adminCount
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("User statistics retrieved successfully", stats)
            );
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to retrieve user statistics: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/by-type/{userType}")
    public ResponseEntity<ApiResponse> getUsersByType(@PathVariable String userType) {
        try {
            System.out.println("🔍 Filter request received for userType: " + userType);
            
            User.UserType type = User.UserType.valueOf(userType.toUpperCase());
            System.out.println("🔍 Converted to enum: " + type);
            
            List<User> users = userRepository.findByUserType(type);
            System.out.println("🔍 Found " + users.size() + " users of type " + type);
            
            // Log each user found
            users.forEach(user -> 
                System.out.println("   - " + user.getName() + " (" + user.getEmail() + ") - " + user.getUserType())
            );
            
            List<Map<String, Object>> userDTOs = users.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
            
            System.out.println("🔍 Returning " + userDTOs.size() + " user DTOs");
            
            return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", userDTOs)
            );
            
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Invalid user type: " + userType + " - " + e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Invalid user type: " + userType)
            );
        } catch (Exception e) {
            System.err.println("❌ Error retrieving users by type: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to retrieve users: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable Long id) {
        try {
            return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(
                    ApiResponse.success("User retrieved successfully", convertToUserDTO(user))
                ))
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Failed to retrieve user: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchUsers(@RequestParam String query) {
        try {
            List<User> users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
            
            List<Map<String, Object>> userDTOs = users.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(
                ApiResponse.success("Search completed successfully", userDTOs)
            );
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("Search failed: " + e.getMessage())
            );
        }
    }
    
    private Map<String, Object> convertToUserDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("name", user.getName());
        dto.put("email", user.getEmail());
        dto.put("userType", user.getUserType().name());
        dto.put("rollNumber", user.getRollNumber());
        dto.put("hostel", user.getHostel());
        dto.put("room", user.getRoom());
        dto.put("phone", user.getPhone());
        dto.put("createdAt", user.getCreatedAt());
        dto.put("updatedAt", user.getUpdatedAt());
        return dto;
    }
}
