# National Connect Platform - Backend API

🇮🇳 Backend API for connecting people across India through server frequencies, photo sharing, and real-time communication.

## Features

- ✅ User Registration & Authentication
- 📡 Server Frequency Connection System
- 📸 Photo Upload & Sharing
- 💬 Real-time Messaging
- 👥 Connection Management
- 📊 Statistics & Analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **File Upload**: Multer
- **CORS**: Enabled for cross-origin requests
- **Database**: In-memory (upgrade to MongoDB recommended)

## Installation

```bash
# Clone the repository
git clone https://github.com/rahul700raj/national-connect-backend.git

# Navigate to project directory
cd national-connect-backend

# Install dependencies
npm install

# Start the server
npm start

# For development with auto-reload
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/national-connect
JWT_SECRET=your_jwt_secret_key
```

## API Endpoints

### Health Check
```
GET /api/health
```

### User Management

**Register User**
```
POST /api/users/register
Body: {
  "name": "John Doe",
  "state": "Maharashtra",
  "city": "Mumbai",
  "phone": "+91 9876543210"
}
```

**Get All Users**
```
GET /api/users?state=Maharashtra&city=Mumbai&status=online
```

**Get User by ID**
```
GET /api/users/:id
```

### Frequency Connection

**Connect to Frequency**
```
POST /api/frequency/connect
Body: {
  "userId": "user_id",
  "targetFrequency": "456.789"
}
```

**Get User Connections**
```
GET /api/connections/:userId
```

### Photo Management

**Upload Photo**
```
POST /api/photos/upload
Content-Type: multipart/form-data
Fields:
  - photo: [file]
  - userId: string
  - caption: string
```

**Get All Photos**
```
GET /api/photos?userId=user_id
```

**Like Photo**
```
POST /api/photos/:id/like
```

### Messaging

**Send Message**
```
POST /api/messages/send
Body: {
  "senderId": "sender_id",
  "receiverId": "receiver_id",
  "content": "Hello!"
}
```

**Get Messages**
```
GET /api/messages/:userId?withUserId=other_user_id
```

### Statistics

**Get Platform Stats**
```
GET /api/stats
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## File Upload

- **Max File Size**: 10MB
- **Allowed Formats**: JPEG, JPG, PNG, GIF
- **Upload Directory**: `/uploads`

## Deployment

### Deploy to Heroku
```bash
heroku create national-connect-api
git push heroku main
```

### Deploy to Railway
```bash
railway login
railway init
railway up
```

### Deploy to Render
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`

## Upgrade to MongoDB

Replace in-memory storage with MongoDB:

```javascript
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  state: String,
  city: String,
  phone: String,
  frequency: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
```

## Security Recommendations

1. Add JWT authentication
2. Implement rate limiting
3. Add input validation
4. Use HTTPS in production
5. Sanitize user inputs
6. Add password hashing for user accounts

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Author

**Rahul Mishra**
- Email: rm2778643@gmail.com
- GitHub: [@rahul700raj](https://github.com/rahul700raj)

## Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for connecting India 🇮🇳