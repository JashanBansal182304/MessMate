package com.example.MessMate.repository;

import com.example.MessMate.entity.MealBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealBookingRepository extends JpaRepository<MealBooking, Long> {
    
    List<MealBooking> findByCreatedAtBetween(LocalDate startDate, LocalDate endDate);
    
    List<MealBooking> findByDailyMenuId(Long dailyMenuId);
    
    @Query("SELECT mb FROM MealBooking mb WHERE mb.dailyMenu.id = :dailyMenuId")
    List<MealBooking> findByDailyMenuIdExplicit(@Param("dailyMenuId") Long dailyMenuId);
    
    List<MealBooking> findByStatus(MealBooking.BookingStatus status);
}