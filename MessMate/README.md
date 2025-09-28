# MessMate - Mess Management System

A comprehensive mess management system built with Spring Boot and PostgreSQL, featuring both backend APIs and frontend web interface.

## Features

### User Management
- Multi-role authentication (Admin, Staff, Student)
- User registration and login
- Profile management

### Menu Management
- Daily menu creation and management
- Menu item categorization (Breakfast, Lunch, Dinner, Snacks)
- Food category classification (Main Course, Rice, Curry, Bread, Salad, Dessert, Beverage, Snack)
- Vegetarian/Non-vegetarian filtering

### Order Management
- Meal ordering system
- Order status tracking (Pending, Confirmed, Preparing, Ready, Delivered, Cancelled)
- Order history and analytics

### Digital Mess Pass
- Digital pass generation with unique pass numbers
- Balance management and recharge functionality
- Pass validity tracking
- Multiple pass types (Monthly, Semester, Annual, Daily)

### Payment System
- Payment processing for mess pass recharge
- Transaction history
- Payment status tracking
- Refund management

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.5
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security
- **Build Tool**: Maven
- **Java Version**: 21

### Frontend
- **HTML5** with modern CSS3
- **JavaScript** for interactivity
- **Responsive Design** for mobile compatibility

## Database Schema

### Core Entities
1. **User** - User information with role-based access
2. **MenuItem** - Food items with pricing and categorization
3. **DailyMenu** - Daily menu configuration
4. **MealOrder** - Order management
5. **MessPass** - Digital pass system
6. **Payment** - Payment and transaction tracking

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user/{email}` - Get user details

### Menu Management
- `GET /api/menu/items` - Get all menu items
- `GET /api/menu/items/meal-type/{mealType}` - Get items by meal type
- `GET /api/menu/daily/today` - Get today's menu
- `POST /api/menu/items` - Create menu item (Admin)
- `POST /api/menu/daily` - Create daily menu (Admin)

### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders/user/{email}` - Get user orders
- `GET /api/orders/status/{status}` - Get orders by status
- `PUT /api/orders/{id}/status` - Update order status

### Mess Pass Management
- `POST /api/mess-pass/create` - Create mess pass
- `GET /api/mess-pass/user/{email}` - Get user's mess pass
- `PUT /api/mess-pass/{id}/recharge` - Recharge pass balance

### Payment Management
- `POST /api/payments/recharge` - Process mess pass recharge
- `GET /api/payments/user/{email}` - Get user payment history
- `GET /api/payments/status/{status}` - Get payments by status

## Setup Instructions

### Prerequisites
- Java 21 or higher
- PostgreSQL 12 or higher
- Maven 3.6 or higher

### Database Setup
1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE messmate_db_chit;
   ```

2. Update database credentials in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/messmate_db_chit
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### Running the Application

1. **Backend (Spring Boot)**:
   ```bash
   cd MessMate
   mvn clean install
   mvn spring-boot:run
   ```
   Server will start on `http://localhost:8080`

2. **Frontend**:
   Access the application at `http://localhost:8080` (served by Spring Boot).

### Default Admin Account
- **Email**: admin@messmate.com
- **Password**: admin123

## Project Structure

```
MessMate/
├── src/main/java/com/example/MessMate/
│   ├── controller/          # REST Controllers
│   ├── entity/             # JPA Entities
│   ├── repository/         # Data Access Layer
│   ├── service/            # Business Logic
│   ├── dto/                # Data Transfer Objects
│   └── config/             # Configuration Classes
├── src/main/resources/
│   ├── application.properties
│   └── data.sql            # Database initialization
└── src/main/resources/static/  # Frontend Files (served by Spring Boot)
    ├── css/                # Stylesheets
    ├── js/                 # JavaScript files
    └── *.html              # HTML pages
```

## Key Features Implementation

### Database Connectivity
- **Connection Pooling**: HikariCP for optimal performance
- **Transaction Management**: Spring's declarative transactions
- **Data Validation**: JPA validation annotations
- **Indexing**: Optimized database indexes for better query performance

### Security
- **Password Encryption**: BCrypt hashing
- **Role-based Access**: Admin, Staff, Student roles
- **CORS Configuration**: Cross-origin resource sharing enabled

### Data Initialization
- **Automatic Setup**: Default admin user creation
- **Sample Data**: Pre-loaded menu items for testing
- **Database Indexes**: Performance optimization

## Development Notes

### Database Configuration
- Uses PostgreSQL as primary database
- H2 in-memory database available for testing
- Hibernate DDL auto-update for schema management
- Connection pooling configured for production use

### API Design
- RESTful API design principles
- Consistent response format with ApiResponse wrapper
- Proper HTTP status codes
- Cross-origin resource sharing (CORS) enabled

### Error Handling
- Global exception handling
- Meaningful error messages
- Transaction rollback on failures

## Future Enhancements

1. **Mobile App**: React Native or Flutter mobile application
2. **Real-time Notifications**: WebSocket integration for order updates
3. **Analytics Dashboard**: Advanced reporting and analytics
4. **Payment Gateway**: Integration with payment providers
5. **Inventory Management**: Stock tracking and management
6. **Nutritional Information**: Calorie and nutrition tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
