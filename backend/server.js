const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        // Remove the connection string from logs for security
        const connectionString = process.env.MONGODB_URI;
        
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5
        });
        
        console.log('Connected to MongoDB Atlas successfully');
        
        // Verify the connection
        const db = mongoose.connection;
        
        db.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });
        
        db.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        db.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
        db.once('open', () => {
            console.log('MongoDB connection is open');
        });
        
    } catch (error) {
        console.error('MongoDB connection error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        process.exit(1);
    }
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Routes
const imageRoutes = require('./routes/images');
app.use('/api/images', imageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start the server only after MongoDB connection is established
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}); 