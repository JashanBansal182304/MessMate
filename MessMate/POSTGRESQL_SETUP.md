# PostgreSQL Setup Guide for MessMate

## Prerequisites
- PostgreSQL installed on your system
- pgAdmin 4 installed and configured
- Java 21 or higher
- Maven 3.6 or higher

## Database Setup Steps

### 1. Create Database in pgAdmin
1. Open pgAdmin 4
2. Connect to your PostgreSQL server (usually localhost)
3. Right-click on "Databases" → "Create" → "Database..."
4. Enter database name: `messmate_db_chit`
5. Click "Save"

### 2. Verify Database Connection
In pgAdmin, you can run this query to test the connection:
```sql
SELECT version();
```

### 3. Current Database Configuration
The application is configured to connect to:
- **Host**: localhost
- **Port**: 5432
- **Database**: messmate_db_chit
- **Username**: postgres
- **Password**: manki123

### 4. Update Database Credentials (if needed)
If your PostgreSQL setup uses different credentials, update the following in `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/messmate_db_chit
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 5. Database Schema Creation
The application will automatically create all required tables when you first run it:
- users
- menu_items
- daily_menus
- daily_menu_items (junction table)
- meal_orders
- order_menu_items (junction table)
- mess_passes
- payments

### 6. Sample Data
The application will automatically populate sample menu items and create a default admin user:
- **Admin Email**: admin@messmate.com
- **Admin Password**: admin123

## Running the Application

1. Ensure PostgreSQL service is running
2. Verify the database `messmate_db_chit` exists in pgAdmin
3. Run the Spring Boot application:
   ```bash
   cd MessMate
   mvn spring-boot:run
   ```

## Verifying Database Connection

### Check Application Logs
Look for these log messages when the application starts:
```
=== MessMate Application Started Successfully ===
Server running on: http://localhost:8080
Database: PostgreSQL (messmate_db_chit)
Default Admin - Email: admin@messmate.com, Password: admin123
```

### Check Tables in pgAdmin
After running the application, refresh your database in pgAdmin and verify these tables exist:
- users
- menu_items
- daily_menus
- daily_menu_items
- meal_orders
- order_menu_items
- mess_passes
- payments

### Test API Endpoints
Once the application is running, test the database connection by accessing:
- http://localhost:8080/api/menu/items (should return sample menu items)
- http://localhost:8080/api/auth/user/admin@messmate.com (should return admin user details)

## Troubleshooting

### Connection Issues
1. **Database doesn't exist**: Create `messmate_db_chit` database in pgAdmin
2. **Authentication failed**: Check username/password in application.properties
3. **Connection refused**: Ensure PostgreSQL service is running
4. **Port issues**: Verify PostgreSQL is running on port 5432

### Common PostgreSQL Commands
```sql
-- Check if database exists
SELECT datname FROM pg_database WHERE datname = 'messmate_db_chit';

-- List all tables in the database
\dt

-- Check table structure
\d users
\d menu_items
```

## Database Features Configured
- **Connection Pooling**: HikariCP with optimized settings
- **Transaction Management**: Spring's declarative transactions
- **Schema Management**: Hibernate DDL auto-update
- **Performance Optimization**: Database indexes for key queries
- **Data Validation**: JPA validation annotations
- **Logging**: SQL query logging enabled for debugging

## Security Notes
- Change default passwords in production
- Use environment variables for database credentials
- Enable SSL for production database connections
- Regularly backup your database

## Next Steps
1. Create the database in pgAdmin
2. Update credentials if needed
3. Run the application
4. Verify tables are created
5. Test API endpoints
6. Access the frontend at http://localhost:8080 (served by Spring Boot)
