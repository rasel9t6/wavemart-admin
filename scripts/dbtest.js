// dbtest.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('MongoDB connected successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
}

testConnection();
