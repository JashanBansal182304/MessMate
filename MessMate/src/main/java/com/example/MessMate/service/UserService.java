package com.example.MessMate.service;

import com.example.MessMate.dto.LoginRequest;
import com.example.MessMate.dto.SignupRequest;
import com.example.MessMate.dto.UserResponse;
import com.example.MessMate.entity.User;
import com.example.MessMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserResponse signup(SignupRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        if (userRepository.existsByRollNumber(request.getRollNumber())) {
            throw new RuntimeException("Roll number already exists");
        }
        
        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Set user type from request, default to STUDENT if not provided
        if (request.getUserType() != null && !request.getUserType().isEmpty()) {
            user.setUserType(User.UserType.valueOf(request.getUserType().toUpperCase()));
        } else {
            user.setUserType(User.UserType.STUDENT);
        }
        
        user.setRollNumber(request.getRollNumber());
        user.setHostel(request.getHostel());
        user.setRoom(request.getRoom());
        user.setPhone(request.getPhone());
        
        User savedUser = userRepository.save(user);
        return UserResponse.fromUser(savedUser);
    }
    
    public UserResponse login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOptional.get();
        
        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        // Check user type
        if (!user.getUserType().name().equalsIgnoreCase(request.getUserType())) {
            throw new RuntimeException("Invalid user type");
        }
        
        return UserResponse.fromUser(user);
    }
    
    public Optional<UserResponse> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserResponse::fromUser);
    }
    
    public void initializeDefaultAdmin() {
        // Check if admin already exists
        if (!userRepository.existsByEmail("admin@messmate.com")) {
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail("admin@messmate.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setUserType(User.UserType.ADMIN);
            admin.setRollNumber("ADMIN001");
            admin.setHostel("Admin Quarter");
            admin.setRoom("AQ01");
            admin.setPhone("9999999999");
            
            userRepository.save(admin);
            System.out.println("Default admin user created:");
            System.out.println("Email: admin@messmate.com");
            System.out.println("Password: admin123");
        }
        
        // Check if staff user already exists
        if (!userRepository.existsByEmail("staff@messmate.com")) {
            User staff = new User();
            staff.setName("Mess Staff");
            staff.setEmail("staff@messmate.com");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setUserType(User.UserType.STAFF);
            staff.setRollNumber("STAFF001");
            staff.setHostel("Staff Quarter");
            staff.setRoom("SQ01");
            staff.setPhone("8888888888");
            
            userRepository.save(staff);
            System.out.println("Default staff user created:");
            System.out.println("Email: staff@messmate.com");
            System.out.println("Password: staff123");
        }
    }
}