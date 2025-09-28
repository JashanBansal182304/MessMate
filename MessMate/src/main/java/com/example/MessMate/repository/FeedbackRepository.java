package com.example.MessMate.repository;

import com.example.MessMate.entity.Feedback;
import com.example.MessMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findByStudentOrderByCreatedAtDesc(User student);
    
    List<Feedback> findByStatusOrderByCreatedAtDesc(Feedback.FeedbackStatus status);
    
    List<Feedback> findByFeedbackTypeOrderByCreatedAtDesc(Feedback.FeedbackType feedbackType);
    
    List<Feedback> findByRatingOrderByCreatedAtDesc(Integer rating);
    
    @Query("SELECT f FROM Feedback f WHERE f.createdAt >= :startDate ORDER BY f.createdAt DESC")
    List<Feedback> findRecentFeedback(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.status = :status")
    Long countByStatus(@Param("status") Feedback.FeedbackStatus status);
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.feedbackType = :type")
    Double getAverageRatingByType(@Param("type") Feedback.FeedbackType type);
    
    @Query("SELECT f FROM Feedback f WHERE f.student.email = :email ORDER BY f.createdAt DESC")
    List<Feedback> findByStudentEmailOrderByCreatedAtDesc(@Param("email") String email);
    
    List<Feedback> findAllByOrderByCreatedAtDesc();
}