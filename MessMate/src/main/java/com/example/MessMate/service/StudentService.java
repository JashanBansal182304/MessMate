package com.example.MessMate.service;

import com.example.MessMate.dto.StudentLoginRequest;
import com.example.MessMate.dto.StudentSignupRequest;
import com.example.MessMate.dto.StudentResponse;
import com.example.MessMate.entity.Student;
import com.example.MessMate.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    
    public StudentResponse signup(StudentSignupRequest request) {
        // Check if student already exists by email
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Check if roll number already exists
        if (studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new RuntimeException("Roll number already exists");
        }
        
        // Create new student
        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRollNumber(request.getRollNumber());
        student.setHostel(request.getHostel());
        student.setRoom(request.getRoom());
        student.setPhone(request.getPhone());
        student.setIsActive(true);
        
        Student savedStudent = studentRepository.save(student);
        return StudentResponse.fromStudent(savedStudent);
    }
    
    public StudentResponse login(StudentLoginRequest request) {
        Optional<Student> studentOptional = studentRepository.findByEmail(request.getEmail());
        
        if (studentOptional.isEmpty()) {
            throw new RuntimeException("Student not found with this email");
        }
        
        Student student = studentOptional.get();
        
        // Check if student is active
        if (!student.getIsActive()) {
            throw new RuntimeException("Student account is deactivated");
        }
        
        // Check password
        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        return StudentResponse.fromStudent(student);
    }
    
    public Optional<StudentResponse> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email)
                .map(StudentResponse::fromStudent);
    }
    
    public Optional<StudentResponse> getStudentByRollNumber(String rollNumber) {
        return studentRepository.findByRollNumber(rollNumber)
                .map(StudentResponse::fromStudent);
    }
    
    public List<StudentResponse> getAllActiveStudents() {
        return studentRepository.findByIsActiveTrue()
                .stream()
                .map(StudentResponse::fromStudent)
                .collect(Collectors.toList());
    }
    
    public List<StudentResponse> getStudentsByHostel(String hostel) {
        return studentRepository.findByHostelAndIsActiveTrue(hostel)
                .stream()
                .map(StudentResponse::fromStudent)
                .collect(Collectors.toList());
    }
    
    public List<StudentResponse> searchStudentsByName(String name) {
        return studentRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(StudentResponse::fromStudent)
                .collect(Collectors.toList());
    }
    
    public long getTotalActiveStudents() {
        return studentRepository.countByIsActiveTrue();
    }
    
    public long getStudentCountByHostel(String hostel) {
        return studentRepository.countByHostel(hostel);
    }
    
    public void deactivateStudent(String email) {
        Optional<Student> studentOptional = studentRepository.findByEmail(email);
        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();
            student.setIsActive(false);
            studentRepository.save(student);
        } else {
            throw new RuntimeException("Student not found");
        }
    }
    
    public void activateStudent(String email) {
        Optional<Student> studentOptional = studentRepository.findByEmail(email);
        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();
            student.setIsActive(true);
            studentRepository.save(student);
        } else {
            throw new RuntimeException("Student not found");
        }
    }
}
