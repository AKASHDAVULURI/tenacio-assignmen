import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log('process.env.MONGO_URI', process.env.MONGO_URI);
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/billing_db';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};