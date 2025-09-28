package com.example.MessMate.repository;

import com.example.MessMate.entity.Feedback;
import com.example.MessMate.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class FeedbackRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private FeedbackRepository feedbackRepository;

    private User testStudent;
    private Feedback testFeedback1;
    private Feedback testFeedback2;

    @BeforeEach
    void setUp() {
        // Create test student
        testStudent = new User();
        testStudent.setName("Test Student");
        testStudent.setEmail("student@test.com");
        testStudent.setPassword("password123");
        testStudent.setUserType(User.UserType.STUDENT);
        testStudent.setRollNumber("STU001");
        entityManager.persistAndFlush(testStudent);

        // Create test feedback
        testFeedback1 = new Feedback();
        testFeedback1.setStudent(testStudent);
        testFeedback1.setFeedbackType(Feedback.FeedbackType.FOOD_QUALITY);
        testFeedback1.setMessage("The food quality is excellent");
        testFeedback1.setRating(5);
        testFeedback1.setStatus(Feedback.FeedbackStatus.PENDING);
        entityManager.persistAndFlush(testFeedback1);

        testFeedback2 = new Feedback();
        testFeedback2.setStudent(testStudent);
        testFeedback2.setFeedbackType(Feedback.FeedbackType.SERVICE);
        testFeedback2.setMessage("Service could be faster");
        testFeedback2.setRating(3);
        testFeedback2.setStatus(Feedback.FeedbackStatus.RESOLVED);
        entityManager.persistAndFlush(testFeedback2);
    }

    @Test
    void testFindByStudentOrderByCreatedAtDesc_ShouldReturnFeedbackForStudent() {
        // When
        List<Feedback> feedbacks = feedbackRepository.findByStudentOrderByCreatedAtDesc(testStudent);

        // Then
        assertThat(feedbacks).hasSize(2);
        assertThat(feedbacks).extracting(Feedback::getMessage)
                .containsExactlyInAnyOrder("The food quality is excellent", "Service could be faster");
    }

    @Test
    void testFindByStatusOrderByCreatedAtDesc_ShouldReturnFeedbackByStatus() {
        // When
        List<Feedback> pendingFeedbacks = feedbackRepository.findByStatusOrderByCreatedAtDesc(Feedback.FeedbackStatus.PENDING);
        List<Feedback> resolvedFeedbacks = feedbackRepository.findByStatusOrderByCreatedAtDesc(Feedback.FeedbackStatus.RESOLVED);

        // Then
        assertThat(pendingFeedbacks).hasSize(1);
        assertThat(pendingFeedbacks.get(0).getMessage()).isEqualTo("The food quality is excellent");
        
        assertThat(resolvedFeedbacks).hasSize(1);
        assertThat(resolvedFeedbacks.get(0).getMessage()).isEqualTo("Service could be faster");
    }

    @Test
    void testFindByFeedbackTypeOrderByCreatedAtDesc_ShouldReturnFeedbackByType() {
        // When
        List<Feedback> foodQualityFeedbacks = feedbackRepository.findByFeedbackTypeOrderByCreatedAtDesc(Feedback.FeedbackType.FOOD_QUALITY);
        List<Feedback> serviceFeedbacks = feedbackRepository.findByFeedbackTypeOrderByCreatedAtDesc(Feedback.FeedbackType.SERVICE);

        // Then
        assertThat(foodQualityFeedbacks).hasSize(1);
        assertThat(foodQualityFeedbacks.get(0).getMessage()).isEqualTo("The food quality is excellent");
        
        assertThat(serviceFeedbacks).hasSize(1);
        assertThat(serviceFeedbacks.get(0).getMessage()).isEqualTo("Service could be faster");
    }

    @Test
    void testFindByRatingOrderByCreatedAtDesc_ShouldReturnFeedbackByRating() {
        // When
        List<Feedback> fiveStarFeedbacks = feedbackRepository.findByRatingOrderByCreatedAtDesc(5);
        List<Feedback> threeStarFeedbacks = feedbackRepository.findByRatingOrderByCreatedAtDesc(3);

        // Then
        assertThat(fiveStarFeedbacks).hasSize(1);
        assertThat(fiveStarFeedbacks.get(0).getMessage()).isEqualTo("The food quality is excellent");
        
        assertThat(threeStarFeedbacks).hasSize(1);
        assertThat(threeStarFeedbacks.get(0).getMessage()).isEqualTo("Service could be faster");
    }

    @Test
    void testCountByStatus_ShouldReturnCorrectCount() {
        // When
        Long pendingCount = feedbackRepository.countByStatus(Feedback.FeedbackStatus.PENDING);
        Long resolvedCount = feedbackRepository.countByStatus(Feedback.FeedbackStatus.RESOLVED);

        // Then
        assertThat(pendingCount).isEqualTo(1);
        assertThat(resolvedCount).isEqualTo(1);
    }

    @Test
    void testGetAverageRatingByType_ShouldReturnCorrectAverage() {
        // When
        Double avgFoodQualityRating = feedbackRepository.getAverageRatingByType(Feedback.FeedbackType.FOOD_QUALITY);
        Double avgServiceRating = feedbackRepository.getAverageRatingByType(Feedback.FeedbackType.SERVICE);

        // Then
        assertThat(avgFoodQualityRating).isEqualTo(5.0);
        assertThat(avgServiceRating).isEqualTo(3.0);
    }

    @Test
    void testFindByStudentEmailOrderByCreatedAtDesc_ShouldReturnFeedbackByEmail() {
        // When
        List<Feedback> feedbacks = feedbackRepository.findByStudentEmailOrderByCreatedAtDesc("student@test.com");

        // Then
        assertThat(feedbacks).hasSize(2);
        assertThat(feedbacks).extracting(Feedback::getMessage)
                .containsExactlyInAnyOrder("The food quality is excellent", "Service could be faster");
    }

    @Test
    void testFindAllByOrderByCreatedAtDesc_ShouldReturnAllFeedbackOrderedByDate() {
        // When
        List<Feedback> allFeedbacks = feedbackRepository.findAllByOrderByCreatedAtDesc();

        // Then
        assertThat(allFeedbacks).hasSize(2);
        assertThat(allFeedbacks).extracting(Feedback::getMessage)
                .containsExactlyInAnyOrder("The food quality is excellent", "Service could be faster");
    }
}
