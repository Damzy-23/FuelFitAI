# 🔐 Authentication Setup Guide

## Database: MongoDB

We're using **MongoDB with Mongoose** for the database. This is perfect for hackathons because:
- ✅ Easy to set up (local or cloud)
- ✅ No schema migrations needed
- ✅ Flexible data structure
- ✅ Works great with Node.js

## Setup Options

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB locally:**
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   mongod
   ```

3. **Update `.env`:**
   ```
   MONGODB_URI=mongodb://localhost:27017/fuelfit
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create free account:** [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a cluster** (free tier available)
3. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/fuelfit
   ```
4. **Update `.env`:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fuelfit
   ```

## Environment Variables

Create `server/.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/fuelfit

# JWT Secret (change in production!)
JWT_SECRET=fuelfit-secret-key-change-in-production
JWT_EXPIRE=7d

# Optional: OpenAI API Key
OPENAI_API_KEY=your_key_here

# Server Port
PORT=3030
```

## Authentication Flow

1. **Register:** User creates account → Password hashed with bcrypt → JWT token returned
2. **Login:** User provides credentials → Password verified → JWT token returned
3. **Protected Routes:** Token sent in `Authorization: Bearer <token>` header
4. **Token Verification:** Middleware verifies token and attaches user to request

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/verify` - Verify token (requires auth)

### Protected Endpoints (Future)
- `POST /api/analyze` - Can be protected with auth middleware
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  fitnessGoal: 'fat_loss' | 'muscle_gain' | 'endurance',
  createdAt: Date
}
```

## Security Features

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens with expiration (7 days default)
- ✅ Password validation (min 6 characters)
- ✅ Email validation
- ✅ Token verification middleware

## Testing Auth

1. **Register:**
   ```bash
   curl -X POST http://localhost:3030/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","password":"password123","fitnessGoal":"fat_loss"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3030/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"password123"}'
   ```

3. **Verify Token:**
   ```bash
   curl -X GET http://localhost:3030/api/auth/verify \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Frontend Pages

- `/login` - Sign in page
- `/register` - Sign up page
- `/` - Main app (shows user menu if authenticated)

## Notes

- App works **without authentication** - users can still use the meal analyzer
- Authentication is **optional** for the hackathon demo
- User's fitness goal is saved and used as default
- Tokens stored in localStorage (can be upgraded to httpOnly cookies for production)

---

**Ready to use!** Just set up MongoDB and you're good to go! 🚀

