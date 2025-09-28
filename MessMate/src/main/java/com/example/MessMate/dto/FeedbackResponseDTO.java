package com.example.MessMate.dto;

import com.example.MessMate.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDTO {
    
    private Long id;
    private String studentName;
    private String studentEmail;
    private String feedbackType;
    private Integer rating;
    private String message;
    private String status;
    private String staffReply;
    private String repliedBy;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static FeedbackResponseDTO fromEntity(Feedback feedback) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO();
        dto.setId(feedback.getId());
        dto.setStudentName(feedback.getStudent().getName());
        dto.setStudentEmail(feedback.getStudent().getEmail());
        dto.setFeedbackType(feedback.getFeedbackType().name());
        dto.setRating(feedback.getRating());
        dto.setMessage(feedback.getMessage());
        dto.setStatus(feedback.getStatus().name());
        dto.setStaffReply(feedback.getStaffReply());
        
        if (feedback.getRepliedBy() != null) {
            dto.setRepliedBy(feedback.getRepliedBy().getName());
        }
        
        dto.setRepliedAt(feedback.getRepliedAt());
        dto.setCreatedAt(feedback.getCreatedAt());
        dto.setUpdatedAt(feedback.getUpdatedAt());
        
        return dto;
    }
}