import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateUser } from '../middleware/auth.js';
import { getDatabase } from '../config/database.js';

const router = express.Router();

// Validation middleware
const validateMoodEntry = [
  body('moodScore')
    .isInt({ min: 1, max: 5 })
    .withMessage('Mood score must be between 1 and 5'),
  body('reflection')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Reflection must be less than 1000 characters')
];

// Add a new mood entry
router.post('/entry', validateMoodEntry, authenticateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { moodScore, reflection } = req.body;
    const userId = req.user.id;
    const database = getDatabase();

    const result = await new Promise((resolve, reject) => {
      database.run(
        'INSERT INTO mood_entries (user_id, mood_score, reflection) VALUES (?, ?, ?)',
        [userId, moodScore, reflection || null],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    res.status(201).json({
      message: 'Mood entry saved successfully',
      entry: {
        id: result.lastID,
        moodScore,
        reflection,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Save mood entry error:', error);
    res.status(500).json({ error: 'Failed to save mood entry' });
  }
});

// Get mood history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30, offset = 0, startDate, endDate } = req.query;
    const database = getDatabase();

    let query = `
      SELECT id, mood_score, reflection, timestamp 
      FROM mood_entries 
      WHERE user_id = ?
    `;
    const params = [userId];

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const entries = await new Promise((resolve, reject) => {
      database.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM mood_entries WHERE user_id = ?';
    const countParams = [userId];

    if (startDate) {
      countQuery += ' AND timestamp >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ' AND timestamp <= ?';
      countParams.push(endDate);
    }

    const totalResult = await new Promise((resolve, reject) => {
      database.get(countQuery, countParams, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      entries: entries.reverse(), // Reverse to get chronological order
      pagination: {
        total: totalResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalResult.total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get mood history error:', error);
    res.status(500).json({ error: 'Failed to get mood history' });
  }
});

// Get mood statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days
    const database = getDatabase();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get average mood for the period
    const avgMood = await new Promise((resolve, reject) => {
      database.get(`
        SELECT AVG(mood_score) as average_mood, COUNT(*) as total_entries
        FROM mood_entries 
        WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
      `, [userId, startDate.toISOString(), endDate.toISOString()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Get mood distribution
    const moodDistribution = await new Promise((resolve, reject) => {
      database.all(`
        SELECT mood_score, COUNT(*) as count
        FROM mood_entries 
        WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
        GROUP BY mood_score
        ORDER BY mood_score
      `, [userId, startDate.toISOString(), endDate.toISOString()], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get recent trend (last 7 days vs previous 7 days)
    const recentTrend = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          (SELECT AVG(mood_score) FROM mood_entries 
           WHERE user_id = ? AND timestamp >= datetime('now', '-7 days')) as recent_avg,
          (SELECT AVG(mood_score) FROM mood_entries 
           WHERE user_id = ? AND timestamp >= datetime('now', '-14 days') AND timestamp < datetime('now', '-7 days')) as previous_avg
      `, [userId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      period: parseInt(period),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      averageMood: avgMood.average_mood || 0,
      totalEntries: avgMood.total_entries || 0,
      moodDistribution,
      recentTrend: {
        current: recentTrend.recent_avg || 0,
        previous: recentTrend.previous_avg || 0,
        change: recentTrend.recent_avg && recentTrend.previous_avg 
          ? recentTrend.recent_avg - recentTrend.previous_avg 
          : 0
      }
    });
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ error: 'Failed to get mood statistics' });
  }
});

// Update a mood entry
router.put('/entry/:entryId', validateMoodEntry, authenticateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { entryId } = req.params;
    const { moodScore, reflection } = req.body;
    const userId = req.user.id;
    const database = getDatabase();

    // Check if entry belongs to user
    const entry = await new Promise((resolve, reject) => {
      database.get(
        'SELECT id FROM mood_entries WHERE id = ? AND user_id = ?',
        [entryId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!entry) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }

    // Update entry
    await new Promise((resolve, reject) => {
      database.run(
        'UPDATE mood_entries SET mood_score = ?, reflection = ? WHERE id = ? AND user_id = ?',
        [moodScore, reflection || null, entryId, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Mood entry updated successfully' });
  } catch (error) {
    console.error('Update mood entry error:', error);
    res.status(500).json({ error: 'Failed to update mood entry' });
  }
});

// Delete a mood entry
router.delete('/entry/:entryId', authenticateUser, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;
    const database = getDatabase();

    // Check if entry belongs to user
    const entry = await new Promise((resolve, reject) => {
      database.get(
        'SELECT id FROM mood_entries WHERE id = ? AND user_id = ?',
        [entryId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!entry) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }

    // Delete entry
    await new Promise((resolve, reject) => {
      database.run(
        'DELETE FROM mood_entries WHERE id = ? AND user_id = ?',
        [entryId, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    console.error('Delete mood entry error:', error);
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
});

export default router; 