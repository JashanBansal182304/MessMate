package com.example.MessMate.repository;

import com.example.MessMate.entity.Payment;
import com.example.MessMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByUserOrderByCreatedAtDesc(User user);
    
    List<Payment> findByStatus(Payment.PaymentStatus status);
    
    Optional<Payment> findByTransactionId(String transactionId);
    
    List<Payment> findByPaymentTypeAndCreatedAtBetween(Payment.PaymentType paymentType, LocalDateTime start, LocalDateTime end);
    
    List<Payment> findByUserAndPaymentType(User user, Payment.PaymentType paymentType);
}
