# PostgreSQL Database Setup for MessMate

## Prerequisites
1. Install PostgreSQL on your system
2. Start PostgreSQL service

## Database Setup Commands

Connect to PostgreSQL as superuser:
```bash
psql -U postgres
```

Create database and user:
```sql
CREATE DATABASE messmate_db;
CREATE USER messmate_user WITH PASSWORD 'messmate_password';
GRANT ALL PRIVILEGES ON DATABASE messmate_db TO messmate_user;
\q
```

## Configuration
Update `application.properties` if you want to use different credentials:
- Database URL: `jdbc:postgresql://localhost:5432/messmate_db`
- Username: `postgres` (or `messmate_user`)
- Password: `password` (or `messmate_password`)

## Running the Application
1. Navigate to MessMate directory: `cd "d:\New folder (8)\MessMate"`
2. Run the application: `mvnw.cmd spring-boot:run`
3. Access the application at: `http://localhost:8080`

## Testing the Integration
1. Go to `http://localhost:8080` - should show landing page
2. Click "Get Started" - should go to signup page
3. Fill out signup form and submit
4. Go to login page and login with created credentials
5. Check PostgreSQL database to see if data is persisted

## Troubleshooting
- Ensure PostgreSQL is running
- Check that database `messmate_db` exists
- Verify connection credentials in `application.properties`
- Check console logs for any connection errors