package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.dto.StudentLoginRequest;
import com.example.MessMate.dto.StudentSignupRequest;
import com.example.MessMate.dto.StudentResponse;
import com.example.MessMate.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {
    
    private final StudentService studentService;
    
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> signup(@RequestBody StudentSignupRequest request) {
        try {
            StudentResponse student = studentService.signup(request);
            return ResponseEntity.ok(ApiResponse.success("Student registered successfully", student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody StudentLoginRequest request) {
        try {
            StudentResponse student = studentService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse> getStudentByEmail(@PathVariable String email) {
        return studentService.getStudentByEmail(email)
                .map(student -> ResponseEntity.ok(ApiResponse.success("Student found", student)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/roll/{rollNumber}")
    public ResponseEntity<ApiResponse> getStudentByRollNumber(@PathVariable String rollNumber) {
        return studentService.getStudentByRollNumber(rollNumber)
                .map(student -> ResponseEntity.ok(ApiResponse.success("Student found", student)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllActiveStudents() {
        List<StudentResponse> students = studentService.getAllActiveStudents();
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", students));
    }
    
    @GetMapping("/hostel/{hostel}")
    public ResponseEntity<ApiResponse> getStudentsByHostel(@PathVariable String hostel) {
        List<StudentResponse> students = studentService.getStudentsByHostel(hostel);
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", students));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchStudentsByName(@RequestParam String name) {
        List<StudentResponse> students = studentService.searchStudentsByName(name);
        return ResponseEntity.ok(ApiResponse.success("Students found", students));
    }
    
    @GetMapping("/count")
    public ResponseEntity<ApiResponse> getTotalActiveStudents() {
        long count = studentService.getTotalActiveStudents();
        return ResponseEntity.ok(ApiResponse.success("Total active students", count));
    }
    
    @GetMapping("/count/hostel/{hostel}")
    public ResponseEntity<ApiResponse> getStudentCountByHostel(@PathVariable String hostel) {
        long count = studentService.getStudentCountByHostel(hostel);
        return ResponseEntity.ok(ApiResponse.success("Student count for hostel", count));
    }
    
    @PutMapping("/deactivate/{email}")
    public ResponseEntity<ApiResponse> deactivateStudent(@PathVariable String email) {
        try {
            studentService.deactivateStudent(email);
            return ResponseEntity.ok(ApiResponse.success("Student deactivated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/activate/{email}")
    public ResponseEntity<ApiResponse> activateStudent(@PathVariable String email) {
        try {
            studentService.activateStudent(email);
            return ResponseEntity.ok(ApiResponse.success("Student activated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
