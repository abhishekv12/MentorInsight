# 🎓 MentorInsight — Mentor Mentee Monitoring Portal

A full-stack web application designed to streamline mentor-mentee relationships in academic institutions. MentorInsight provides dedicated dashboards for students, faculty mentors, and parents — enabling real-time tracking of attendance, academics, and mentoring sessions.

---

## 🚀 Live Demo

> Coming soon / [Deploy link here]

---

## 📌 Features

### 👨‍🎓 Student Portal
- Secure login via Firebase Authentication
- View personal academic profile (CGPA, attendance, batch info)
- Track semester-wise performance
- View mentor session history and notes
- Access broadcast announcements from faculty

### 👨‍🏫 Faculty / Mentor Dashboard
- Login with faculty credentials
- View and manage assigned mentees
- Record and update mentor sessions
- Monitor student attendance and CGPA at a glance
- Send broadcast messages to students/parents
- Identify at-risk students (low attendance alerts)

### 👨‍👩‍👦 Parent Connect Portal
- Dedicated parent login using student roll number + registered mobile number
- Read-only view of their child's academic data
- Real-time attendance alerts (red alert below 60%, yellow below 75%)
- View CGPA, semester results, and mentor session summaries
- No separate registration required

### 📊 Attendance & Academic Tracking
- Semester-wise CGPA breakdown
- Attendance percentage with visual indicators
- Automatic flagging of students below attendance threshold
- Historical session logs between mentor and mentee

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | Firebase Auth (students), Custom JWT (faculty/parents) |
| Styling | Tailwind CSS / Custom CSS |
| State Management | React Hooks + Context |

---

## 📁 Project Structure

```
MentorInsight/
├── src/
│   ├── pages/
│   │   ├── StudentLogin.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── FacultyLogin.jsx
│   │   ├── FacultyDashboard.jsx
│   │   ├── ParentLogin.jsx
│   │   └── ParentDashboard.jsx
│   ├── components/
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── routes/
│   │   ├── studentRoutes.js
│   │   ├── facultyRoutes.js
│   │   └── parentRoutes.js
│   ├── models/
│   │   ├── User.js
│   │   └── Batch.js
│   └── server.js
├── .env               ← NOT included (see setup)
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Firebase project (for student auth)

### 1. Clone the repository
```bash
git clone https://github.com/abhishekv12/MentorInsight.git
cd MentorInsight
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Create a `.env` for Firebase in the frontend (if separate):
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_API_URL=http://localhost:5000
```

### 4. Run the application

```bash
# Start backend
cd server
node server.js

# Start frontend (in a new terminal)
cd ..
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

---

## 🔐 Login Credentials (For Testing)

| Role | Login Method |
|---|---|
| Student | Firebase Email/Password |
| Faculty | Username + Password (JWT) |
| Parent | Student Roll No + Registered Mobile Number |

---

## 📸 Screenshots

> Add screenshots of your dashboards here

| Student Dashboard | Faculty Dashboard | Parent Portal |
|---|---|---|
| ![Student](#) | ![Faculty](#) | ![Parent](#) |

---

## 🤝 Contributing

This is an academic project. Pull requests are welcome for improvements.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Abhishek V**  
GitHub: [@abhishekv12](https://github.com/abhishekv12)

---

## 📄 License

This project is for academic/educational purposes.

---

> Built with ❤️ for better mentor-mentee relationships in academic institutions.
