# 🧠 MentalHealth AI Companion

An AI-powered companion app designed to support mental health and wellness.  
The system helps users track their moods, interact with an AI chatbot for emotional support, and access personalized recommendations.

---

## 🚀 Features

- ✅ **User Authentication** – Secure signup/login with JWT authentication
- ✅ **Mood Tracking** – Log daily moods and emotions
- ✅ **AI Chatbot** – Chat with an AI companion for emotional support
- ✅ **Secure API** – Protected endpoints for sensitive data
- ✅ **Frontend + Backend Integration** – Full MERN stack setup

---

## 🛠️ Tech Stack

**Frontend**

- React.js
- TailwindCSS (for styling)

**Backend**

- Node.js + Express.js
- MongoDB (Mongoose ODM)
- JWT Authentication

---

## 📂 Project Structure

```bash
MentalHealthAICompanion/
├── backend/                # Express.js backend (API + controllers + routes)
│   ├── controllers/        # Handles request logic (User, Mood, Chatbot)
│   ├── models/             # MongoDB models (User, Mood)
│   ├── routes/             # API routes
│   ├── middleware/         # JWT authentication middleware
│   └── server.js           # Entry point for backend
│
├── frontend/               # React.js frontend
│   ├── src/                # Components, pages, context
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
│
├── README.md               # Project documentation
└── package.json            # Root config
```
