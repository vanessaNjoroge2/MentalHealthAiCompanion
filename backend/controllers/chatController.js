// backend/controllers/ChatController.js
import { getDatabase } from '../config/database.js';

// Insert a chat message
export const insertChatMessage = (userId, sessionId, sender, content) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO chat_messages (user_id, session_id, sender, content)
       VALUES (?, ?, ?, ?)`,
      [userId, sessionId || null, sender, content],
      function (err) {
        if (err) return reject(err);
        resolve({
          id: this.lastID,
          user_id: userId,
          session_id: sessionId || null,
          sender,
          content,
          timestamp: new Date().toISOString()
        });
      }
    );
  });
};

// Get chat history
export const getChatHistory = (userId, sessionId) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM chat_messages WHERE user_id = ?`;
    const params = [userId];
    if (sessionId) {
      query += ` AND session_id = ?`;
      params.push(sessionId);
    }
    query += ` ORDER BY timestamp ASC`;
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Get user chat sessions
export const getUserChatSessions = (userId) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    const query = `
      SELECT session_id,
             MIN(timestamp) AS start_time,
             MAX(timestamp) AS last_message_time,
             COUNT(*) AS message_count
      FROM chat_messages
      WHERE user_id = ? AND session_id IS NOT NULL
      GROUP BY session_id
      ORDER BY last_message_time DESC
    `;
    db.all(query, [userId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Delete a chat message
export const deleteChatMessage = (userId, messageId) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM chat_messages WHERE id = ? AND user_id = ?`,
      [messageId, userId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return resolve({ message: 'Message not found' });
        resolve({ message: 'Message deleted successfully' });
      }
    );
  });
};

// Clear chat history
export const clearChatHistory = (userId, sessionId) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    let query = `DELETE FROM chat_messages WHERE user_id = ?`;
    const params = [userId];
    if (sessionId) {
      query += ` AND session_id = ?`;
      params.push(sessionId);
    }
    db.run(query, params, function (err) {
      if (err) return reject(err);
      resolve({ message: 'Chat history cleared successfully' });
    });
  });
};
