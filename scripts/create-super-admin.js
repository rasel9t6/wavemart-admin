import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

async function createSuperAdmin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    console.log('Checking environment variables...');
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    if (!superAdminEmail || !superAdminPassword) {
      throw new Error(
        'Super admin credentials not found in environment variables'
      );
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI || '', {
      dbName: 'wavemart-admin',
    });
    console.log('Connected to MongoDB successfully');

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Check if super admin already exists
    console.log('Checking if super admin exists...');
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });
    if (existingSuperAdmin) {
      console.log('Super admin already exists with email:', superAdminEmail);
      await mongoose.disconnect();
      return;
    }

    // Create super admin
    console.log('Creating super admin...');
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: superAdminEmail,
      password: hashedPassword,
      role: 'super_admin',
    });

    console.log('Super admin created successfully with details:');
    console.log({
      id: superAdmin._id,
      email: superAdmin.email,
      role: superAdmin.role,
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
