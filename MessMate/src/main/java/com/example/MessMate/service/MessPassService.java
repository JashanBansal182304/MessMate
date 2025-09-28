package com.example.MessMate.service;

import com.example.MessMate.entity.MessPass;
import com.example.MessMate.entity.User;
import com.example.MessMate.repository.MessPassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessPassService {
    
    private final MessPassRepository messPassRepository;
    
    public MessPass createMessPass(User user, MessPass.PassType passType, LocalDate validFrom, LocalDate validUntil) {
        // Check if user already has an active pass
        if (messPassRepository.existsByUserAndIsActiveTrue(user)) {
            throw new RuntimeException("User already has an active mess pass");
        }
        
        MessPass messPass = new MessPass();
        messPass.setUser(user);
        messPass.setPassNumber(generatePassNumber());
        messPass.setPassType(passType);
        messPass.setValidFrom(validFrom);
        messPass.setValidUntil(validUntil);
        messPass.setBalance(BigDecimal.ZERO);
        messPass.setIsActive(true);
        
        return messPassRepository.save(messPass);
    }
    
    public Optional<MessPass> getUserMessPass(User user) {
        return messPassRepository.findByUser(user);
    }
    
    public Optional<MessPass> getMessPassByNumber(String passNumber) {
        return messPassRepository.findByPassNumber(passNumber);
    }
    
    public MessPass rechargePass(Long passId, BigDecimal amount) {
        Optional<MessPass> passOptional = messPassRepository.findById(passId);
        if (passOptional.isPresent()) {
            MessPass messPass = passOptional.get();
            messPass.setBalance(messPass.getBalance().add(amount));
            return messPassRepository.save(messPass);
        }
        throw new RuntimeException("Mess pass not found");
    }
    
    public MessPass deductBalance(Long passId, BigDecimal amount) {
        Optional<MessPass> passOptional = messPassRepository.findById(passId);
        if (passOptional.isPresent()) {
            MessPass messPass = passOptional.get();
            if (messPass.getBalance().compareTo(amount) >= 0) {
                messPass.setBalance(messPass.getBalance().subtract(amount));
                return messPassRepository.save(messPass);
            } else {
                throw new RuntimeException("Insufficient balance");
            }
        }
        throw new RuntimeException("Mess pass not found");
    }
    
    public List<MessPass> getExpiredPasses() {
        return messPassRepository.findByValidUntilBeforeAndIsActiveTrue(LocalDate.now());
    }
    
    public void deactivatePass(Long passId) {
        Optional<MessPass> passOptional = messPassRepository.findById(passId);
        if (passOptional.isPresent()) {
            MessPass messPass = passOptional.get();
            messPass.setIsActive(false);
            messPassRepository.save(messPass);
        }
    }
    
    private String generatePassNumber() {
        return "MP" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
