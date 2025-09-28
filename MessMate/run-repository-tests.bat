@echo off
echo ========================================
echo Running MessMate Repository Tests
echo ========================================
echo.

echo Cleaning and compiling project...
mvn clean compile test-compile

echo.
echo Running Repository Tests...
mvn test -Dtest="*RepositoryTest" -Dspring.profiles.active=test

echo.
echo ========================================
echo Repository Tests Completed!
echo ========================================
pause
