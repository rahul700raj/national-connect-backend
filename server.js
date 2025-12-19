const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// In-memory database (replace with MongoDB in production)
let users = [];
let connections = [];
let photos = [];
let messages = [];

// Helper function to generate frequency
function generateFrequency() {
    return (Math.random() * 900 + 100).toFixed(3);
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'National Connect API is running',
        timestamp: new Date().toISOString()
    });
});

// Register user
app.post('/api/users/register', (req, res) => {
    try {
        const { name, state, city, phone } = req.body;
        
        if (!name || !state || !city || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const frequency = generateFrequency();
        const user = {
            id: Date.now().toString(),
            name,
            state,
            city,
            phone,
            frequency,
            status: 'online',
            createdAt: new Date().toISOString()
        };

        users.push(user);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users
app.get('/api/users', (req, res) => {
    try {
        const { state, city, status } = req.query;
        let filteredUsers = [...users];

        if (state) {
            filteredUsers = filteredUsers.filter(u => u.state === state);
        }
        if (city) {
            filteredUsers = filteredUsers.filter(u => u.city === city);
        }
        if (status) {
            filteredUsers = filteredUsers.filter(u => u.status === status);
        }

        res.json({
            success: true,
            count: filteredUsers.length,
            users: filteredUsers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
    try {
        const user = users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Connect to frequency
app.post('/api/frequency/connect', (req, res) => {
    try {
        const { userId, targetFrequency } = req.body;
        
        if (!userId || !targetFrequency) {
            return res.status(400).json({ error: 'userId and targetFrequency are required' });
        }

        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const targetUser = users.find(u => u.frequency === targetFrequency);
        
        if (targetUser) {
            const connection = {
                id: Date.now().toString(),
                user1: userId,
                user2: targetUser.id,
                frequency: targetFrequency,
                status: 'active',
                createdAt: new Date().toISOString()
            };
            
            connections.push(connection);
            
            res.json({
                success: true,
                message: 'Connected successfully',
                connection,
                connectedUser: targetUser
            });
        } else {
            res.json({
                success: false,
                message: 'No user found on this frequency'
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user connections
app.get('/api/connections/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        const userConnections = connections.filter(
            c => c.user1 === userId || c.user2 === userId
        );

        const connectedUsers = userConnections.map(conn => {
            const otherUserId = conn.user1 === userId ? conn.user2 : conn.user1;
            const otherUser = users.find(u => u.id === otherUserId);
            return {
                connection: conn,
                user: otherUser
            };
        });

        res.json({
            success: true,
            count: connectedUsers.length,
            connections: connectedUsers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload photo
app.post('/api/photos/upload', upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No photo uploaded' });
        }

        const { userId, caption } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const photo = {
            id: Date.now().toString(),
            userId,
            userName: user.name,
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            caption: caption || '',
            likes: 0,
            createdAt: new Date().toISOString()
        };

        photos.push(photo);

        res.status(201).json({
            success: true,
            message: 'Photo uploaded successfully',
            photo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all photos
app.get('/api/photos', (req, res) => {
    try {
        const { userId } = req.query;
        let filteredPhotos = [...photos];

        if (userId) {
            filteredPhotos = filteredPhotos.filter(p => p.userId === userId);
        }

        res.json({
            success: true,
            count: filteredPhotos.length,
            photos: filteredPhotos.reverse() // Latest first
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like photo
app.post('/api/photos/:id/like', (req, res) => {
    try {
        const photo = photos.find(p => p.id === req.params.id);
        
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        photo.likes += 1;

        res.json({
            success: true,
            message: 'Photo liked',
            photo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message
app.post('/api/messages/send', (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        
        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ error: 'senderId, receiverId, and content are required' });
        }

        const sender = users.find(u => u.id === senderId);
        const receiver = users.find(u => u.id === receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ error: 'User not found' });
        }

        const message = {
            id: Date.now().toString(),
            senderId,
            senderName: sender.name,
            receiverId,
            receiverName: receiver.name,
            content,
            read: false,
            createdAt: new Date().toISOString()
        };

        messages.push(message);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages
app.get('/api/messages/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        const { withUserId } = req.query;

        let userMessages = messages.filter(
            m => m.senderId === userId || m.receiverId === userId
        );

        if (withUserId) {
            userMessages = userMessages.filter(
                m => (m.senderId === userId && m.receiverId === withUserId) ||
                     (m.senderId === withUserId && m.receiverId === userId)
            );
        }

        res.json({
            success: true,
            count: userMessages.length,
            messages: userMessages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get statistics
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'online').length,
            totalConnections: connections.length,
            totalPhotos: photos.length,
            totalMessages: messages.length,
            timestamp: new Date().toISOString()
        };

        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 National Connect API Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;