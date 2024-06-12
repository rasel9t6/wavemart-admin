import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDB = () => {
  mongoose.set('strictQuery', true);

  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }
};
