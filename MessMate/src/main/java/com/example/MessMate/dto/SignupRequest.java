package com.example.MessMate.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String rollNumber;
    private String hostel;
    private String room;
    private String phone;
    private String userType;
}