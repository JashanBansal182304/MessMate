package com.example.MessMate.repository;

import com.example.MessMate.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    // Find student by email
    Optional<Student> findByEmail(String email);
    
    // Find student by roll number
    Optional<Student> findByRollNumber(String rollNumber);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Check if roll number exists
    boolean existsByRollNumber(String rollNumber);
    
    // Find students by hostel
    List<Student> findByHostel(String hostel);
    
    // Find active students
    List<Student> findByIsActiveTrue();
    
    // Find students by hostel and active status
    List<Student> findByHostelAndIsActiveTrue(String hostel);
    
    // Search students by name (case insensitive)
    @Query("SELECT s FROM Student s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Student> findByNameContainingIgnoreCase(@Param("name") String name);
    
    // Count active students
    long countByIsActiveTrue();
    
    // Count students by hostel
    long countByHostel(String hostel);
}
