import { getDatabase } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// -------------------- REGISTER USER --------------------
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = getDatabase();

    // Check if email or username already exists
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ error: 'Email or username already exists' });

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert new user
      db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          // Generate JWT token
          const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
          res.status(201).json({ message: 'User registered successfully', token });
        }
      );
    });
  } catch (error) {
    console.error('Register User Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- LOGIN USER --------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const db = getDatabase();

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(400).json({ error: 'Invalid email or password' });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(400).json({ error: 'Invalid email or password' });

      // Update last login
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      res.json({ message: 'Login successful', token });
    });
  } catch (error) {
    console.error('Login User Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- GET USER INFO --------------------
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();

    db.get('SELECT id, username, email, created_at, last_login, is_active FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ user });
    });
  } catch (error) {
    console.error('Get User Info Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- UPDATE USER INFO --------------------
export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;
    const db = getDatabase();

    // Hash password if provided
    let passwordHash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Update user record
    db.run(
      `UPDATE users SET 
        username = COALESCE(?, username),
        email = COALESCE(?, email),
        password_hash = COALESCE(?, password_hash),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [username, email, passwordHash, userId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated successfully' });
      }
    );
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
