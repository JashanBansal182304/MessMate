# MessMate Repository Tests

## Overview
This document describes the repository layer tests for the MessMate application. The tests focus on testing the data access layer using Spring Boot's `@DataJpaTest` annotation.

## Test Structure

### 1. UserRepositoryTest (8 tests)
Tests the `UserRepository` functionality:
- ✅ `testFindByEmail_ShouldReturnUser_WhenEmailExists`
- ✅ `testFindByEmail_ShouldReturnEmpty_WhenEmailDoesNotExist`
- ✅ `testFindByUserType_ShouldReturnStudents`
- ✅ `testCountByUserType_ShouldReturnCorrectCount`
- ✅ `testExistsByEmail_ShouldReturnTrue_WhenEmailExists`
- ✅ `testExistsByEmail_ShouldReturnFalse_WhenEmailDoesNotExist`
- ✅ `testFindByRollNumber_ShouldReturnUser`
- ✅ `testFindByNameContainingIgnoreCase_ShouldReturnMatchingUsers`

### 2. FeedbackRepositoryTest (8 tests)
Tests the `FeedbackRepository` functionality:
- ✅ `testFindByStudentOrderByCreatedAtDesc_ShouldReturnFeedbackForStudent`
- ✅ `testFindByStatusOrderByCreatedAtDesc_ShouldReturnFeedbackByStatus`
- ✅ `testFindByFeedbackTypeOrderByCreatedAtDesc_ShouldReturnFeedbackByType`
- ✅ `testFindByRatingOrderByCreatedAtDesc_ShouldReturnFeedbackByRating`
- ✅ `testCountByStatus_ShouldReturnCorrectCount`
- ✅ `testGetAverageRatingByType_ShouldReturnCorrectAverage`
- ✅ `testFindByStudentEmailOrderByCreatedAtDesc_ShouldReturnFeedbackByEmail`
- ✅ `testFindAllByOrderByCreatedAtDesc_ShouldReturnAllFeedbackOrderedByDate`

### 3. MenuItemRepositoryTest (5 tests)
Tests the `MenuItemRepository` functionality:
- ✅ `testFindByMealTypeAndIsAvailableTrue_ShouldReturnAvailableItemsForMealType`
- ✅ `testFindByCategoryAndIsAvailableTrue_ShouldReturnAvailableItemsByCategory`
- ✅ `testFindByIsVegetarianAndIsAvailableTrue_ShouldReturnVegetarianItems`
- ✅ `testFindByNameContainingIgnoreCaseAndIsAvailableTrue_ShouldReturnMatchingItems`
- ✅ `testFindAll_ShouldReturnAllItems`

## Total Tests: 21 Repository Tests

## Technology Stack
- **Spring Boot Test**: `@DataJpaTest` for repository testing
- **H2 Database**: In-memory database for testing
- **JUnit 5**: Testing framework
- **AssertJ**: Fluent assertions
- **TestEntityManager**: For managing test data

## How to Run Tests

### Option 1: Using Maven Command
```bash
cd C:\Users\NEW\OneDrive\Desktop\SmartMessManager-main\MessMate
mvn test -Dtest="*RepositoryTest"
```

### Option 2: Using Batch Script
```bash
cd C:\Users\NEW\OneDrive\Desktop\SmartMessManager-main\MessMate
run-repository-tests.bat
```

### Option 3: Using IDE
- Right-click on `src/test/java/com/example/MessMate/repository` folder
- Select "Run All Tests"

## Test Configuration
- **Test Database**: H2 in-memory database
- **Test Profile**: `application-test.properties`
- **DDL**: `create-drop` (creates fresh schema for each test)
- **SQL Logging**: Enabled for debugging

## Test Data
Each test class uses `@BeforeEach` to set up clean test data:
- **UserRepositoryTest**: Creates 3 users (Student, Staff, Admin)
- **FeedbackRepositoryTest**: Creates 1 student and 2 feedback entries
- **MenuItemRepositoryTest**: Creates 4 menu items with different properties

## Key Features Tested
1. **CRUD Operations**: Basic create, read, update, delete
2. **Custom Query Methods**: Repository methods with custom queries
3. **Filtering**: Finding entities by specific criteria
4. **Counting**: Counting entities by status/type
5. **Aggregation**: Average calculations
6. **Search**: Case-insensitive text search
7. **Ordering**: Results ordered by date/criteria
8. **Relationships**: Entity relationships and joins

## Benefits
- ✅ **Fast Execution**: In-memory H2 database
- ✅ **Isolated Tests**: Each test runs in isolation
- ✅ **Clean Data**: Fresh database for each test
- ✅ **Comprehensive Coverage**: Tests all repository methods
- ✅ **Real Database Operations**: Tests actual SQL queries
- ✅ **Easy Maintenance**: Simple and focused tests
