// controllers/MoodController.js
import { getDatabase } from '../config/database.js';

// Add a new mood entry
export const addMoodEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mood_score, reflection } = req.body;

    if (!mood_score || mood_score < 1 || mood_score > 5) {
      return res.status(400).json({ error: 'Mood score must be between 1 and 5' });
    }

    const database = getDatabase();

    await new Promise((resolve, reject) => {
      database.run(
        'INSERT INTO mood_entries (user_id, mood_score, reflection, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [userId, mood_score, reflection || ''],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({ message: 'Mood entry added successfully' });
  } catch (error) {
    console.error('Add mood entry error:', error);
    res.status(500).json({ error: 'Failed to add mood entry' });
  }
};

// Get all mood entries for the logged-in user
export const getMoodEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const database = getDatabase();

    const entries = await new Promise((resolve, reject) => {
      database.all(
        'SELECT id, mood_score, reflection, timestamp FROM mood_entries WHERE user_id = ? ORDER BY timestamp DESC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ entries });
  } catch (error) {
    console.error('Get mood entries error:', error);
    res.status(500).json({ error: 'Failed to fetch mood entries' });
  }
};

// Update a mood entry
export const updateMoodEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { mood_score, reflection } = req.body;

    if (mood_score && (mood_score < 1 || mood_score > 5)) {
      return res.status(400).json({ error: 'Mood score must be between 1 and 5' });
    }

    const database = getDatabase();

    await new Promise((resolve, reject) => {
      database.run(
        'UPDATE mood_entries SET mood_score = COALESCE(?, mood_score), reflection = COALESCE(?, reflection) WHERE id = ? AND user_id = ?',
        [mood_score, reflection, id, userId],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) reject('No entry found or unauthorized');
          else resolve();
        }
      );
    });

    res.json({ message: 'Mood entry updated successfully' });
  } catch (error) {
    console.error('Update mood entry error:', error);
    res.status(500).json({ error: 'Failed to update mood entry' });
  }
};

// Delete a mood entry
export const deleteMoodEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const database = getDatabase();

    await new Promise((resolve, reject) => {
      database.run(
        'DELETE FROM mood_entries WHERE id = ? AND user_id = ?',
        [id, userId],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) reject('No entry found or unauthorized');
          else resolve();
        }
      );
    });

    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    console.error('Delete mood entry error:', error);
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
};
