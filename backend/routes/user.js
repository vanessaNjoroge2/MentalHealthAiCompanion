import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateUser } from '../middleware/authenticateUser.js';
import { getDatabase } from '../config/database.js';

const router = express.Router();

// Validation middleware
const validateProfileUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const database = getDatabase();

    const user = await new Promise((resolve, reject) => {
      database.get(
        'SELECT id, username, email, created_at, last_login FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', validateProfileUpdate, authenticateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { username, email } = req.body;
    const userId = req.user.id;
    const database = getDatabase();

    // Check if username or email already exists
    if (username || email) {
      let checkQuery = 'SELECT id FROM users WHERE (';
      const checkParams = [];
      
      if (username) {
        checkQuery += 'username = ?';
        checkParams.push(username);
      }
      
      if (email) {
        if (username) checkQuery += ' OR ';
        checkQuery += 'email = ?';
        checkParams.push(email);
      }
      
      checkQuery += ') AND id != ?';
      checkParams.push(userId);

      const existingUser = await new Promise((resolve, reject) => {
        database.get(checkQuery, checkParams, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
    }

    // Build update query
    let updateQuery = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const updateParams = [];

    if (username) {
      updateQuery += ', username = ?';
      updateParams.push(username);
    }

    if (email) {
      updateQuery += ', email = ?';
      updateParams.push(email);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(userId);

    await new Promise((resolve, reject) => {
      database.run(updateQuery, updateParams, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get updated user data
    const updatedUser = await new Promise((resolve, reject) => {
      database.get(
        'SELECT id, username, email, created_at, last_login FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', validatePasswordChange, authenticateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const database = getDatabase();

    // Get current password hash
    const user = await new Promise((resolve, reject) => {
      database.get(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await new Promise((resolve, reject) => {
      database.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const database = getDatabase();

    // Get chat statistics
    const chatStats = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT session_id) as total_sessions,
          MAX(timestamp) as last_message_time
        FROM chat_messages 
        WHERE user_id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Get mood statistics
    const moodStats = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          COUNT(*) as total_entries,
          AVG(mood_score) as average_mood,
          MAX(timestamp) as last_entry_time
        FROM mood_entries 
        WHERE user_id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Get user activity
    const activityStats = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          created_at,
          last_login,
          (SELECT COUNT(*) FROM chat_messages WHERE user_id = users.id AND timestamp >= datetime('now', '-7 days')) as messages_this_week,
          (SELECT COUNT(*) FROM mood_entries WHERE user_id = users.id AND timestamp >= datetime('now', '-7 days')) as mood_entries_this_week
        FROM users 
        WHERE id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      chat: {
        totalMessages: chatStats.total_messages || 0,
        totalSessions: chatStats.total_sessions || 0,
        lastMessageTime: chatStats.last_message_time
      },
      mood: {
        totalEntries: moodStats.total_entries || 0,
        averageMood: moodStats.average_mood || 0,
        lastEntryTime: moodStats.last_entry_time
      },
      activity: {
        joinedAt: activityStats.created_at,
        lastLogin: activityStats.last_login,
        messagesThisWeek: activityStats.messages_this_week || 0,
        moodEntriesThisWeek: activityStats.mood_entries_this_week || 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

// Delete user account
router.delete('/account', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const database = getDatabase();

    // Delete all user data (cascade will handle related data)
    await new Promise((resolve, reject) => {
      database.run(
        'DELETE FROM users WHERE id = ?',
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router; 