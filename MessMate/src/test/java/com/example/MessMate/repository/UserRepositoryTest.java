package com.example.MessMate.repository;

import com.example.MessMate.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testStudent;
    private User testStaff;
    private User testAdmin;

    @BeforeEach
    void setUp() {
        // Create test users
        testStudent = new User();
        testStudent.setName("Test Student");
        testStudent.setEmail("student@test.com");
        testStudent.setPassword("password123");
        testStudent.setUserType(User.UserType.STUDENT);
        testStudent.setRollNumber("STU001");
        testStudent.setHostel("Hostel A");
        testStudent.setRoom("101");
        testStudent.setPhone("1234567890");

        testStaff = new User();
        testStaff.setName("Test Staff");
        testStaff.setEmail("staff@test.com");
        testStaff.setPassword("password123");
        testStaff.setUserType(User.UserType.STAFF);
        testStaff.setRollNumber("STF001");
        testStaff.setPhone("0987654321");

        testAdmin = new User();
        testAdmin.setName("Test Admin");
        testAdmin.setEmail("admin@test.com");
        testAdmin.setPassword("password123");
        testAdmin.setUserType(User.UserType.ADMIN);
        testAdmin.setRollNumber("ADM001");
        testAdmin.setPhone("5555555555");

        // Persist test data
        entityManager.persistAndFlush(testStudent);
        entityManager.persistAndFlush(testStaff);
        entityManager.persistAndFlush(testAdmin);
    }

    @Test
    void testFindByEmail_ShouldReturnUser_WhenEmailExists() {
        // When
        Optional<User> found = userRepository.findByEmail("student@test.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Student");
        assertThat(found.get().getUserType()).isEqualTo(User.UserType.STUDENT);
    }

    @Test
    void testFindByEmail_ShouldReturnEmpty_WhenEmailDoesNotExist() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@test.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void testFindByUserType_ShouldReturnStudents() {
        // When
        List<User> students = userRepository.findByUserType(User.UserType.STUDENT);

        // Then
        assertThat(students).hasSize(1);
        assertThat(students.get(0).getName()).isEqualTo("Test Student");
        assertThat(students.get(0).getUserType()).isEqualTo(User.UserType.STUDENT);
    }

    @Test
    void testCountByUserType_ShouldReturnCorrectCount() {
        // When
        long studentCount = userRepository.countByUserType(User.UserType.STUDENT);
        long staffCount = userRepository.countByUserType(User.UserType.STAFF);
        long adminCount = userRepository.countByUserType(User.UserType.ADMIN);

        // Then
        assertThat(studentCount).isEqualTo(1);
        assertThat(staffCount).isEqualTo(1);
        assertThat(adminCount).isEqualTo(1);
    }

    @Test
    void testExistsByEmail_ShouldReturnTrue_WhenEmailExists() {
        // When
        boolean exists = userRepository.existsByEmail("admin@test.com");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByEmail_ShouldReturnFalse_WhenEmailDoesNotExist() {
        // When
        boolean exists = userRepository.existsByEmail("notfound@test.com");

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void testFindByRollNumber_ShouldReturnUser() {
        // When
        Optional<User> found = userRepository.findByRollNumber("STU001");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Student");
        assertThat(found.get().getRollNumber()).isEqualTo("STU001");
    }

    @Test
    void testFindByNameContainingIgnoreCase_ShouldReturnMatchingUsers() {
        // When
        List<User> found = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase("test", "test");

        // Then
        assertThat(found).hasSize(3); // All test users contain "test"
        assertThat(found).extracting(User::getName)
                .containsExactlyInAnyOrder("Test Student", "Test Staff", "Test Admin");
    }
}
