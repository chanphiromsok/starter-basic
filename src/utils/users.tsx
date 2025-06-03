import { eq } from "drizzle-orm";
import { db } from "~/libs/drizzleClient";
import { InsertUser, users } from "~/libs/schema/users";

export const DEPLOY_URL = "http://localhost:3000";

// Hash password using Web Crypto API (available in browsers and Cloudflare Workers)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Use SHA-256 for hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

// Verify password against hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
};

// Create user with hashed password
export const createUser = async (userData: {
  email: string;
  password: string;
}) => {
  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(userData.password);
    
    const userToInsert: InsertUser = {
      email: userData.email,
      password: hashedPassword,
      createdAt: Date.now(), // Using timestamp for integer field
      updatedAt: Date.now(),
      isActive: 1, // 1 for true, 0 for false in SQLite
    };

    const prepareUser = db.insert(users).values(userToInsert).returning().prepare();
    const result = await prepareUser.all();
    
    // Remove password from returned result for security
    if (result.length > 0) {
      const { password, ...userWithoutPassword } = result[0];
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Find user by email (since you only have email field)
export const findUserByEmail = async (email: string) => {
  try {
    const prepareUser = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .prepare();
    
    const result = await prepareUser.all();
    return result[0] || null;
  } catch (error) {
    console.error('Error finding user:', error);
    throw new Error('Failed to find user');
  }
};

// Updated to work with email only (since you don't have username field)
export const findUserByEmailOrUsername = async (emailOrUsername: string) => {
  // Since you only have email field, treat everything as email
  return await findUserByEmail(emailOrUsername);
};

// Authenticate user
export const authenticateUser = async (emailOrUsername: string, password: string) => {
  try {
    const user = await findUserByEmailOrUsername(emailOrUsername);
    
    if (!user) {
      return null; // User not found
    }
    
    // Check if user is active
    if (!user.isActive) {
      return null; // User is inactive
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return null; // Invalid password
    }
    
    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw new Error('Authentication failed');
  }
};

export const selectUser = async () => {
  try {
    const prepareUser = db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        isActive: users.isActive,
        // Explicitly exclude password
      })
      .from(users)
      .prepare();
    
    const result = await prepareUser.all();
    return result;
  } catch (error) {
    console.error('Error selecting users:', error);
    throw new Error('Failed to fetch users');
  }
};

// Client-side login function
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernameOrEmail: email, // API expects this field name
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
