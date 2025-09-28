package com.example.MessMate.repository;

import com.example.MessMate.entity.MessPass;
import com.example.MessMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessPassRepository extends JpaRepository<MessPass, Long> {
    
    Optional<MessPass> findByUser(User user);
    
    Optional<MessPass> findByPassNumber(String passNumber);
    
    List<MessPass> findByPassTypeAndIsActiveTrue(MessPass.PassType passType);
    
    List<MessPass> findByValidUntilBeforeAndIsActiveTrue(LocalDate date);
    
    boolean existsByUserAndIsActiveTrue(User user);
}
