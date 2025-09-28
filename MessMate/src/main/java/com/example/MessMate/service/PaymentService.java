package com.example.MessMate.service;

import com.example.MessMate.entity.MessPass;
import com.example.MessMate.entity.Payment;
import com.example.MessMate.entity.User;
import com.example.MessMate.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final MessPassService messPassService;
    
    public Payment createPayment(User user, BigDecimal amount, Payment.PaymentType paymentType, String description) {
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setAmount(amount);
        payment.setPaymentType(paymentType);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setTransactionId(generateTransactionId());
        payment.setDescription(description);
        
        return paymentRepository.save(payment);
    }
    
    public Payment processMessPassRecharge(User user, MessPass messPass, BigDecimal amount) {
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setMessPass(messPass);
        payment.setAmount(amount);
        payment.setPaymentType(Payment.PaymentType.MESS_PASS_RECHARGE);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setTransactionId(generateTransactionId());
        payment.setDescription("Mess pass recharge");
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Update mess pass balance
        messPassService.rechargePass(messPass.getId(), amount);
        
        return savedPayment;
    }
    
    public List<Payment> getUserPayments(User user) {
        return paymentRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<Payment> getPaymentsByStatus(Payment.PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }
    
    public Optional<Payment> getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId);
    }
    
    public Payment updatePaymentStatus(Long paymentId, Payment.PaymentStatus status) {
        Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);
        if (paymentOptional.isPresent()) {
            Payment payment = paymentOptional.get();
            payment.setStatus(status);
            return paymentRepository.save(payment);
        }
        throw new RuntimeException("Payment not found");
    }
    
    public List<Payment> getPaymentsByTypeAndDateRange(Payment.PaymentType paymentType, LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByPaymentTypeAndCreatedAtBetween(paymentType, start, end);
    }
    
    private String generateTransactionId() {
        return "TXN" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
    }
}
