# Backend Setup Guide - Express + MySQL

## Quick Start

### Prerequisites
- Node.js 14+
- MySQL Server installed and running
- npm or yarn

### Installation

1. **Navigate to Backend Directory**
   ```bash
   cd Backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create `.env` file in the Backend folder:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=otobook_saas
   DB_PORT=3306
   NODE_ENV=development
   ```

4. **Start the Server**
   ```bash
   npm start
   # or npm run dev
   ```

   You should see:
   ```
   🚀 Backend server running on http://localhost:3001
   📚 API Documentation available at http://localhost:3001/api
   💾 Database: otobook_saas
   ```

## API Endpoints

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/stats` | Get user statistics |
| POST | `/api/users/seed-demo` | Seed demo users |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documentation` | Get all documentation |
| GET | `/api/documentation/:type` | Get docs by type (OCR/RPA) |
| POST | `/api/documentation/seed` | Seed documentation data |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role ENUM('Admin', 'Editor', 'User') DEFAULT 'User',
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  phone VARCHAR(20),
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Documentation Table
```sql
CREATE TABLE documentation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(50),
  content LONGTEXT,
  code_examples JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## Testing API with cURL

### Seed Demo Users
```bash
curl -X POST http://localhost:3001/api/users/seed-demo
```

### Get All Users
```bash
curl http://localhost:3001/api/users
```

### Get User Stats
```bash
curl http://localhost:3001/api/users/stats
```

### Create New User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "company": "Tech Corp",
    "role": "Admin"
  }'
```

### Update User
```bash
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "status": "Inactive"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:3001/api/users/1
```

## Project Structure

```
Backend/
├── config/
│   └── database.js          # MySQL connection & initialization
├── controllers/
│   ├── userController.js    # User CRUD operations
│   └── documentationController.js  # Documentation operations
├── routes/
│   ├── users.js             # User endpoints
│   └── documentation.js     # Documentation endpoints
├── server.js                # Express server setup
├── package.json
├── .env                     # Environment variables
└── .gitignore
```

## Features

✅ **User Management**
- CRUD operations for users
- Search and filter users
- Role management (Admin, Editor, User)
- Status tracking (Active, Inactive)

✅ **Documentation**
- Dynamic documentation storage in DB
- Support for multiple types (OCR, RPA)
- Filterable by type and platform

✅ **Scalability**
- Connection pooling
- Error handling
- JSON responses
- CORS enabled

## Troubleshooting

### Port Already in Use
```bash
# Use different port in .env
PORT=3002
```

### Database Connection Failed
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `.env`
- Ensure `DB_NAME` exists or auto-create is enabled

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | empty |
| DB_NAME | Database name | otobook_saas |
| DB_PORT | MySQL port | 3306 |
| NODE_ENV | Environment | development |

## Next Steps

1. Integrate with frontend API client
2. Add authentication/JWT tokens
3. Implement data validation
4. Add unit tests
5. Deploy to production
# saas_otobook-backend
