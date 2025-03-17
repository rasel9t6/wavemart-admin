import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/mongoDB';
import User from '@/models/User';


// Define custom types for NextAuth

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            throw new Error('Invalid credentials');
          }

          await connectToDB();
          console.log('Attempting login for email:', credentials.email);

          const user = await User.findOne({ email: credentials.email }).select(
            '+password'
          );
          if (!user) {
            console.log('User not found:', credentials.email);
            throw new Error('Invalid credentials');
          }

          if (!user.password) {
            console.log('User has no password');
            throw new Error('Invalid credentials');
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            console.log('Password incorrect for user:', credentials.email);
            throw new Error('Invalid credentials');
          }

          console.log('Login successful for user:', {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          });

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Only set role if it exists on user
        if ('role' in user) {
          token.role = user.role as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          ...token,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
