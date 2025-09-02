# Mental Health AI Companion - Backend

A secure, scalable backend API for the Mental Health AI Companion application, built with Node.js, Express, and SQLite.

## Features

- 🔐 **User Authentication**: JWT-based authentication with secure password hashing
- 💬 **Chat System**: Real-time chat with AI responses and message history
- 📊 **Mood Tracking**: Comprehensive mood tracking with statistics and trends
- 👤 **User Management**: Profile management and user statistics
- 🛡️ **Security**: Rate limiting, CORS, input validation, and security headers
- 📈 **Analytics**: User activity tracking and mood analytics
- 🤖 **AI Integration**: Ready for OpenAI GPT integration (placeholder implementation)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, express-rate-limit
- **Logging**: morgan

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   DB_PATH=./data/mental_health.db
   FRONTEND_URL=http://localhost:5173
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### Chat
- `POST /api/chat/send` - Send message and get AI response
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/sessions` - Get chat sessions
- `DELETE /api/chat/message/:id` - Delete specific message
- `DELETE /api/chat/clear` - Clear chat history

### Mood Tracking
- `POST /api/mood/entry` - Add mood entry
- `GET /api/mood/history` - Get mood history
- `GET /api/mood/stats` - Get mood statistics
- `PUT /api/mood/entry/:id` - Update mood entry
- `DELETE /api/mood/entry/:id` - Delete mood entry

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Change password
- `GET /api/user/stats` - Get user statistics
- `DELETE /api/user/account` - Delete user account

### Health Check
- `GET /health` - Server health check

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  sender ENUM('user', 'ai') NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Mood Entries Table
```sql
CREATE TABLE mood_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  reflection TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Rate Limiting**: Configurable rate limiting per IP
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Parameterized queries
- **Session Management**: Secure session tracking

## AI Integration

The backend includes a placeholder AI service that can be easily replaced with OpenAI GPT or other AI providers:

1. Install OpenAI package: `npm install openai`
2. Add your OpenAI API key to `.env`
3. Update `services/aiService.js` to use the OpenAI integration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `DB_PATH` | Database file path | `./data/mental_health.db` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database tables

### Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── chat.js              # Chat routes
│   ├── mood.js              # Mood tracking routes
│   └── user.js              # User management routes
├── services/
│   └── aiService.js         # AI response generation
├── data/                    # Database files (auto-created)
├── server.js                # Main server file
├── package.json
└── README.md
```

## Testing

Test the API endpoints using tools like Postman or curl:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

## Production Deployment

1. **Set environment variables for production**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-very-secure-production-secret
   PORT=5000
   ```

2. **Install production dependencies**
   ```bash
   npm install --production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues

1. **Database connection error**
   - Ensure the `data` directory exists
   - Check file permissions
   - Verify `DB_PATH` in `.env`

2. **CORS errors**
   - Verify `FRONTEND_URL` in `.env`
   - Check if frontend is running on the correct port

3. **JWT errors**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration settings

4. **Rate limiting**
   - Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`
   - Check if requests are coming from the same IP

### Logs

The server uses Morgan for logging. Check the console output for:
- Request logs
- Error messages
- Database connection status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation 