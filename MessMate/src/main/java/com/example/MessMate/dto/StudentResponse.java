package com.example.MessMate.dto;

import com.example.MessMate.entity.Student;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String name;
    private String email;
    private String rollNumber;
    private String hostel;
    private String room;
    private String phone;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static StudentResponse fromStudent(Student student) {
        return new StudentResponse(
            student.getId(),
            student.getName(),
            student.getEmail(),
            student.getRollNumber(),
            student.getHostel(),
            student.getRoom(),
            student.getPhone(),
            student.getIsActive(),
            student.getCreatedAt(),
            student.getUpdatedAt()
        );
    }
}
