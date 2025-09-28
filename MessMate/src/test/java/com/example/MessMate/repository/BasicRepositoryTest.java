package com.example.MessMate.repository;

import com.example.MessMate.entity.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Basic unit tests for repository entities without Spring context
 * These tests verify entity creation and basic functionality
 */
class BasicRepositoryTest {

    @Test
    void testUserEntityCreation() {
        // Given
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setUserType(User.UserType.STUDENT);
        user.setRollNumber("STU001");
        user.setHostel("Hostel A");
        user.setRoom("101");
        user.setPhone("1234567890");

        // Then
        assertThat(user.getName()).isEqualTo("Test User");
        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getUserType()).isEqualTo(User.UserType.STUDENT);
        assertThat(user.getRollNumber()).isEqualTo("STU001");
        assertThat(user.getHostel()).isEqualTo("Hostel A");
        assertThat(user.getRoom()).isEqualTo("101");
        assertThat(user.getPhone()).isEqualTo("1234567890");
    }

    @Test
    void testUserTypeEnum() {
        // Test all user types
        assertThat(User.UserType.ADMIN).isNotNull();
        assertThat(User.UserType.STAFF).isNotNull();
        assertThat(User.UserType.STUDENT).isNotNull();
        
        // Test enum values
        User.UserType[] userTypes = User.UserType.values();
        assertThat(userTypes).hasSize(3);
        assertThat(userTypes).containsExactlyInAnyOrder(
            User.UserType.ADMIN, 
            User.UserType.STAFF, 
            User.UserType.STUDENT
        );
    }

    @Test
    void testUserEntityDefaults() {
        // Given
        User user = new User();
        
        // Then - verify initial state
        assertThat(user.getId()).isNull();
        assertThat(user.getName()).isNull();
        assertThat(user.getEmail()).isNull();
        assertThat(user.getUserType()).isNull();
        assertThat(user.getCreatedAt()).isNull();
        assertThat(user.getUpdatedAt()).isNull();
    }

    @Test
    void testUserEntityEquality() {
        // Given
        User user1 = createTestUser("Test User", "test@example.com", User.UserType.STUDENT);
        User user2 = createTestUser("Test User", "test@example.com", User.UserType.STUDENT);
        User user3 = createTestUser("Different User", "different@example.com", User.UserType.STAFF);

        // Then - verify basic properties
        assertThat(user1.getName()).isEqualTo(user2.getName());
        assertThat(user1.getEmail()).isEqualTo(user2.getEmail());
        assertThat(user1.getUserType()).isEqualTo(user2.getUserType());
        
        assertThat(user1.getName()).isNotEqualTo(user3.getName());
        assertThat(user1.getEmail()).isNotEqualTo(user3.getEmail());
        assertThat(user1.getUserType()).isNotEqualTo(user3.getUserType());
    }

    @Test
    void testUserEntityValidation() {
        // Test required fields
        User user = new User();
        
        // Set required fields
        user.setName("Valid User");
        user.setEmail("valid@example.com");
        user.setPassword("validPassword123");
        user.setUserType(User.UserType.STUDENT);
        
        // Verify required fields are set
        assertThat(user.getName()).isNotNull().isNotEmpty();
        assertThat(user.getEmail()).isNotNull().contains("@");
        assertThat(user.getPassword()).isNotNull().isNotEmpty();
        assertThat(user.getUserType()).isNotNull();
    }

    @Test
    void testUserTypeStringConversion() {
        // Test enum to string conversion
        assertThat(User.UserType.ADMIN.toString()).isEqualTo("ADMIN");
        assertThat(User.UserType.STAFF.toString()).isEqualTo("STAFF");
        assertThat(User.UserType.STUDENT.toString()).isEqualTo("STUDENT");
        
        // Test string to enum conversion
        assertThat(User.UserType.valueOf("ADMIN")).isEqualTo(User.UserType.ADMIN);
        assertThat(User.UserType.valueOf("STAFF")).isEqualTo(User.UserType.STAFF);
        assertThat(User.UserType.valueOf("STUDENT")).isEqualTo(User.UserType.STUDENT);
    }

    @Test
    void testUserEntityBuilder() {
        // Test creating users with different types
        User admin = createTestUser("Admin User", "admin@example.com", User.UserType.ADMIN);
        User staff = createTestUser("Staff User", "staff@example.com", User.UserType.STAFF);
        User student = createTestUser("Student User", "student@example.com", User.UserType.STUDENT);
        
        assertThat(admin.getUserType()).isEqualTo(User.UserType.ADMIN);
        assertThat(staff.getUserType()).isEqualTo(User.UserType.STAFF);
        assertThat(student.getUserType()).isEqualTo(User.UserType.STUDENT);
        
        // Verify each has unique email
        assertThat(admin.getEmail()).isNotEqualTo(staff.getEmail());
        assertThat(staff.getEmail()).isNotEqualTo(student.getEmail());
        assertThat(admin.getEmail()).isNotEqualTo(student.getEmail());
    }

    @Test
    void testUserEntityFieldLimits() {
        // Test with various field values
        User user = new User();
        
        // Test long name
        String longName = "Very Long Name That Might Exceed Normal Limits";
        user.setName(longName);
        assertThat(user.getName()).isEqualTo(longName);
        
        // Test email format
        user.setEmail("test.email+tag@example.com");
        assertThat(user.getEmail()).contains("@").contains(".");
        
        // Test roll number formats
        user.setRollNumber("2023CSE001");
        assertThat(user.getRollNumber()).isEqualTo("2023CSE001");
        
        user.setRollNumber("STF-001");
        assertThat(user.getRollNumber()).isEqualTo("STF-001");
    }

    private User createTestUser(String name, String email, User.UserType userType) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword("password123");
        user.setUserType(userType);
        user.setRollNumber("TEST001");
        return user;
    }
}
