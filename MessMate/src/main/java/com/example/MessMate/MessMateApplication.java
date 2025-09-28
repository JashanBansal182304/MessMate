package com.example.MessMate;

import com.example.MessMate.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MessMateApplication implements CommandLineRunner {

	@Autowired
	private UserService userService;

	public static void main(String[] args) {
		SpringApplication.run(MessMateApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Initialize default admin user on application startup
		userService.initializeDefaultAdmin();
		System.out.println("=== MessMate Application Started Successfully ===");
		System.out.println("Server running on: http://localhost:8080");
		System.out.println("Database: PostgreSQL (messmate_db_chit)");
		System.out.println("Default Admin - Email: admin@messmate.com, Password: admin123");
	}
}
    