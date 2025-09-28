package com.example.MessMate.repository;

import com.example.MessMate.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ActiveProfiles("test")
class SimpleUserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindUser() {
        // Given
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setUserType(User.UserType.STUDENT);
        user.setRollNumber("TEST001");

        // When
        entityManager.persistAndFlush(user);
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test User");
        assertThat(found.get().getUserType()).isEqualTo(User.UserType.STUDENT);
    }

    @Test
    void testFindByUserType() {
        // Given
        User student = new User();
        student.setName("Student User");
        student.setEmail("student@example.com");
        student.setPassword("password123");
        student.setUserType(User.UserType.STUDENT);
        student.setRollNumber("STU001");

        User staff = new User();
        staff.setName("Staff User");
        staff.setEmail("staff@example.com");
        staff.setPassword("password123");
        staff.setUserType(User.UserType.STAFF);
        staff.setRollNumber("STF001");

        entityManager.persistAndFlush(student);
        entityManager.persistAndFlush(staff);

        // When
        var students = userRepository.findByUserType(User.UserType.STUDENT);
        var staffMembers = userRepository.findByUserType(User.UserType.STAFF);

        // Then
        assertThat(students).hasSize(1);
        assertThat(students.get(0).getName()).isEqualTo("Student User");
        
        assertThat(staffMembers).hasSize(1);
        assertThat(staffMembers.get(0).getName()).isEqualTo("Staff User");
    }

    @Test
    void testCountByUserType() {
        // Given
        User student1 = createUser("Student 1", "student1@example.com", User.UserType.STUDENT, "STU001");
        User student2 = createUser("Student 2", "student2@example.com", User.UserType.STUDENT, "STU002");
        User staff = createUser("Staff 1", "staff1@example.com", User.UserType.STAFF, "STF001");

        entityManager.persistAndFlush(student1);
        entityManager.persistAndFlush(student2);
        entityManager.persistAndFlush(staff);

        // When
        long studentCount = userRepository.countByUserType(User.UserType.STUDENT);
        long staffCount = userRepository.countByUserType(User.UserType.STAFF);

        // Then
        assertThat(studentCount).isEqualTo(2);
        assertThat(staffCount).isEqualTo(1);
    }

    @Test
    void testExistsByEmail() {
        // Given
        User user = createUser("Test User", "exists@example.com", User.UserType.STUDENT, "TEST001");
        entityManager.persistAndFlush(user);

        // When & Then
        assertThat(userRepository.existsByEmail("exists@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("notexists@example.com")).isFalse();
    }

    @Test
    void testFindByRollNumber() {
        // Given
        User user = createUser("Roll User", "roll@example.com", User.UserType.STUDENT, "ROLL001");
        entityManager.persistAndFlush(user);

        // When
        Optional<User> found = userRepository.findByRollNumber("ROLL001");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Roll User");
    }

    private User createUser(String name, String email, User.UserType userType, String rollNumber) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword("password123");
        user.setUserType(userType);
        user.setRollNumber(rollNumber);
        return user;
    }
}
