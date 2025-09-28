package com.example.MessMate.dto;

import com.example.MessMate.entity.User;
import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String userType;
    private String rollNumber;
    private String hostel;
    private String room;
    private String phone;
    
    public static UserResponse fromUser(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setUserType(user.getUserType().name());
        response.setRollNumber(user.getRollNumber());
        response.setHostel(user.getHostel());
        response.setRoom(user.getRoom());
        response.setPhone(user.getPhone());
        return response;
    }
}