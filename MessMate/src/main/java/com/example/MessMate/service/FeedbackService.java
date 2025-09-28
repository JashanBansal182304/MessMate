package com.example.MessMate.service;

import com.example.MessMate.entity.Feedback;
import com.example.MessMate.entity.User;
import com.example.MessMate.entity.Student;
import com.example.MessMate.repository.FeedbackRepository;
import com.example.MessMate.repository.UserRepository;
import com.example.MessMate.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    
    public Feedback submitFeedback(String studentEmail, Feedback.FeedbackType feedbackType, 
                                 Integer rating, String message) {
        System.out.println("Submitting feedback for email: " + studentEmail);
        
        // First try to find user in users table
        Optional<User> userOpt = userRepository.findByEmail(studentEmail);
        User student = null;
        
        if (userOpt.isPresent()) {
            System.out.println("Found user in users table: " + userOpt.get().getName());
            student = userOpt.get();
        } else {
            System.out.println("User not found in users table, checking students table...");
            // If not found in users table, check students table and create user record
            Optional<Student> studentOpt = studentRepository.findByEmail(studentEmail);
            if (studentOpt.isEmpty()) {
                System.out.println("Student not found in students table either!");
                throw new RuntimeException("Student not found with email: " + studentEmail);
            }
            
            System.out.println("Found student in students table: " + studentOpt.get().getName());
            
            // Create a User record from Student data
            Student studentEntity = studentOpt.get();
            System.out.println("Creating user record for student: " + studentEntity.getName());
            
            student = new User();
            student.setName(studentEntity.getName());
            student.setEmail(studentEntity.getEmail());
            student.setPassword(studentEntity.getPassword());
            student.setUserType(User.UserType.STUDENT);
            student.setRollNumber(studentEntity.getRollNumber());
            student.setHostel(studentEntity.getHostel());
            student.setRoom(studentEntity.getRoom());
            student.setPhone(studentEntity.getPhone());
            
            // Save the user record for future use
            student = userRepository.save(student);
            System.out.println("Created user record with ID: " + student.getId());
        }
        
        Feedback feedback = new Feedback();
        feedback.setStudent(student);
        feedback.setFeedbackType(feedbackType);
        feedback.setRating(rating);
        feedback.setMessage(message);
        feedback.setStatus(Feedback.FeedbackStatus.PENDING);
        feedback.setCreatedAt(LocalDateTime.now());
        
        return feedbackRepository.save(feedback);
    }
    
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<Feedback> getFeedbackByStudent(String studentEmail) {
        return feedbackRepository.findByStudentEmailOrderByCreatedAtDesc(studentEmail);
    }
    
    public List<Feedback> getFeedbackByStatus(Feedback.FeedbackStatus status) {
        return feedbackRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    public List<Feedback> getFeedbackByType(Feedback.FeedbackType type) {
        return feedbackRepository.findByFeedbackTypeOrderByCreatedAtDesc(type);
    }
    
    public List<Feedback> getFeedbackByRating(Integer rating) {
        return feedbackRepository.findByRatingOrderByCreatedAtDesc(rating);
    }
    
    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }
    
    public Feedback replyToFeedback(Long feedbackId, String staffEmail, String reply) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
        if (feedbackOpt.isEmpty()) {
            throw new RuntimeException("Feedback not found with id: " + feedbackId);
        }
        
        Optional<User> staffOpt = userRepository.findByEmail(staffEmail);
        if (staffOpt.isEmpty()) {
            throw new RuntimeException("Staff not found with email: " + staffEmail);
        }
        
        Feedback feedback = feedbackOpt.get();
        User staff = staffOpt.get();
        
        feedback.setStaffReply(reply);
        feedback.setRepliedBy(staff);
        feedback.setRepliedAt(LocalDateTime.now());
        feedback.setStatus(Feedback.FeedbackStatus.REVIEWED);
        feedback.setUpdatedAt(LocalDateTime.now());
        
        return feedbackRepository.save(feedback);
    }
    
    public Feedback updateFeedbackStatus(Long feedbackId, Feedback.FeedbackStatus status) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
        if (feedbackOpt.isEmpty()) {
            throw new RuntimeException("Feedback not found with id: " + feedbackId);
        }
        
        Feedback feedback = feedbackOpt.get();
        feedback.setStatus(status);
        feedback.setUpdatedAt(LocalDateTime.now());
        
        return feedbackRepository.save(feedback);
    }
    
    public Long getPendingFeedbackCount() {
        return feedbackRepository.countByStatus(Feedback.FeedbackStatus.PENDING);
    }
    
    public Double getAverageRatingByType(Feedback.FeedbackType type) {
        return feedbackRepository.getAverageRatingByType(type);
    }
    
    public List<Feedback> getRecentFeedback(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return feedbackRepository.findRecentFeedback(startDate);
    }
    
    public void deleteFeedback(Long feedbackId) {
        if (!feedbackRepository.existsById(feedbackId)) {
            throw new RuntimeException("Feedback not found with id: " + feedbackId);
        }
        feedbackRepository.deleteById(feedbackId);
    }
}