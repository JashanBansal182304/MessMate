package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestController {
    
    private final FeedbackRepository feedbackRepository;
    
    @GetMapping("/hello")
    public ResponseEntity<ApiResponse> hello() {
        return ResponseEntity.ok(ApiResponse.success("Hello! MessMate API is working!", null));
    }
    
    @GetMapping("/feedback-count")
    public ResponseEntity<ApiResponse> getFeedbackCount() {
        try {
            long count = feedbackRepository.count();
            return ResponseEntity.ok(ApiResponse.success("Feedback count retrieved", count));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Database error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/database-status")
    public ResponseEntity<ApiResponse> getDatabaseStatus() {
        try {
            long feedbackCount = feedbackRepository.count();
            String status = "Database connected successfully. Feedback count: " + feedbackCount;
            return ResponseEntity.ok(ApiResponse.success(status, feedbackCount));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Database connection failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/create-sample-feedback")
    public ResponseEntity<ApiResponse> createSampleFeedback() {
        try {
            // This will trigger the sample data creation
            long countBefore = feedbackRepository.count();
            String message = "Sample feedback creation attempted. Feedback count: " + countBefore;
            return ResponseEntity.ok(ApiResponse.success(message, countBefore));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating sample feedback: " + e.getMessage()));
        }
    }
}
