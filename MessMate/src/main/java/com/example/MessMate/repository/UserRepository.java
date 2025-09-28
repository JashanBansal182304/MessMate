package com.example.MessMate.repository;

import com.example.MessMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByRollNumber(String rollNumber);
    
    boolean existsByEmail(String email);
    
    boolean existsByRollNumber(String rollNumber);
    
    // New methods for user management
    List<User> findByUserType(User.UserType userType);
    
    long countByUserType(User.UserType userType);
    
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
}