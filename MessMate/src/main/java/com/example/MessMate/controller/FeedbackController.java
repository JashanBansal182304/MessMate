package com.example.MessMate.controller;

import com.example.MessMate.dto.ApiResponse;
import com.example.MessMate.dto.FeedbackResponseDTO;
import com.example.MessMate.entity.Feedback;
import com.example.MessMate.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse> submitFeedback(@RequestBody Map<String, Object> request) {
        try {
            String studentEmail = (String) request.get("studentEmail");
            String feedbackTypeStr = (String) request.get("feedbackType");
            Integer rating = (Integer) request.get("rating");
            String message = (String) request.get("message");
            
            if (studentEmail == null || feedbackTypeStr == null || rating == null || message == null) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Missing required fields: studentEmail, feedbackType, rating, message")
                );
            }
            
            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Rating must be between 1 and 5")
                );
            }
            
            Feedback.FeedbackType feedbackType = Feedback.FeedbackType.valueOf(feedbackTypeStr.toUpperCase());
            
            Feedback feedback = feedbackService.submitFeedback(studentEmail, feedbackType, rating, message);
            FeedbackResponseDTO responseDTO = FeedbackResponseDTO.fromEntity(feedback);
            
            return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", responseDTO));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid feedback type: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to submit feedback"));
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllFeedback() {
        try {
            List<Feedback> feedbackList = feedbackService.getAllFeedback();
            List<FeedbackResponseDTO> responseDTOs = feedbackList.stream()
                .map(FeedbackResponseDTO::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Feedback retrieved successfully", responseDTOs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve feedback"));
        }
    }
    
    @GetMapping("/student/{email}")
    public ResponseEntity<ApiResponse> getFeedbackByStudent(@PathVariable String email) {
        try {
            List<Feedback> feedbackList = feedbackService.getFeedbackByStudent(email);
            List<FeedbackResponseDTO> responseDTOs = feedbackList.stream()
                .map(FeedbackResponseDTO::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Student feedback retrieved successfully", responseDTOs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve student feedback"));
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse> getFeedbackByStatus(@PathVariable String status) {
        try {
            Feedback.FeedbackStatus feedbackStatus = Feedback.FeedbackStatus.valueOf(status.toUpperCase());
            List<Feedback> feedbackList = feedbackService.getFeedbackByStatus(feedbackStatus);
            List<FeedbackResponseDTO> responseDTOs = feedbackList.stream()
                .map(FeedbackResponseDTO::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Feedback by status retrieved successfully", responseDTOs));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid status: " + status));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve feedback by status"));
        }
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse> getFeedbackByType(@PathVariable String type) {
        try {
            Feedback.FeedbackType feedbackType = Feedback.FeedbackType.valueOf(type.toUpperCase());
            List<Feedback> feedbackList = feedbackService.getFeedbackByType(feedbackType);
            List<FeedbackResponseDTO> responseDTOs = feedbackList.stream()
                .map(FeedbackResponseDTO::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Feedback by type retrieved successfully", responseDTOs));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid feedback type: " + type));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve feedback by type"));
        }
    }
    
    @GetMapping("/rating/{rating}")
    public ResponseEntity<ApiResponse> getFeedbackByRating(@PathVariable Integer rating) {
        try {
            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Rating must be between 1 and 5"));
            }
            
            List<Feedback> feedbackList = feedbackService.getFeedbackByRating(rating);
            List<FeedbackResponseDTO> responseDTOs = feedbackList.stream()
                .map(FeedbackResponseDTO::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Feedback by rating retrieved successfully", responseDTOs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve feedback by rating"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getFeedbackById(@PathVariable Long id) {
        try {
            Optional<Feedback> feedbackOpt = feedbackService.getFeedbackById(id);
            if (feedbackOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            FeedbackResponseDTO responseDTO = FeedbackResponseDTO.fromEntity(feedbackOpt.get());
            return ResponseEntity.ok(ApiResponse.success("Feedback retrieved successfully", responseDTO));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve feedback"));
        }
    }
    
    @PostMapping("/{id}/reply")
    public ResponseEntity<ApiResponse> replyToFeedback(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String staffEmail = request.get("staffEmail");
            String reply = request.get("reply");
            
            if (staffEmail == null || reply == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Missing required fields: staffEmail, reply"));
            }
            
            Feedback feedback = feedbackService.replyToFeedback(id, staffEmail, reply);
            FeedbackResponseDTO responseDTO = FeedbackResponseDTO.fromEntity(feedback);
            
            return ResponseEntity.ok(ApiResponse.success("Reply added successfully", responseDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to add reply"));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateFeedbackStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Missing required field: status"));
            }
            
            Feedback.FeedbackStatus status = Feedback.FeedbackStatus.valueOf(statusStr.toUpperCase());
            Feedback feedback = feedbackService.updateFeedbackStatus(id, status);
            FeedbackResponseDTO responseDTO = FeedbackResponseDTO.fromEntity(feedback);
            
            return ResponseEntity.ok(ApiResponse.success("Feedback status updated successfully", responseDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid status: " + request.get("status")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to update feedback status"));
        }
    }
    
    @GetMapping("/stats/pending-count")
    public ResponseEntity<ApiResponse> getPendingFeedbackCount() {
        try {
            Long count = feedbackService.getPendingFeedbackCount();
            return ResponseEntity.ok(ApiResponse.success("Pending feedback count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve pending feedback count"));
        }
    }
    
    @GetMapping("/stats/recent/{days}")
    public ResponseEntity<ApiResponse> getRecentFeedback(@PathVariable int days) {
        try {
            List<Feedback> feedbackList = feedbackService.getRecentFeedback(days);
            List<FeedbackResponseDTO> responseDTOs = feedbackList.stream()
                .map(FeedbackResponseDTO::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Recent feedback retrieved successfully", responseDTOs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve recent feedback"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackService.deleteFeedback(id);
            return ResponseEntity.ok(ApiResponse.success("Feedback deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to delete feedback"));
        }
    }
}