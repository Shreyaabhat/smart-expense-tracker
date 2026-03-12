# 💸 Smart Expense Tracker with AI Insights

A production-grade full-stack expense tracking application with AI-powered financial insights, spending predictions, and budget management.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![Python](https://img.shields.io/badge/Python-3.11-yellow) ![MongoDB](https://img.shields.io/badge/MongoDB-7-darkgreen)

---

## 🏗️ Architecture

```
User → React Frontend (Vite + Tailwind)
           ↓
    Node.js API (Express)
           ↓
      MongoDB Atlas
           ↓
  Python ML Service (FastAPI)
```

---

## ✨ Features

- **User Authentication** — Secure JWT login/registration with bcrypt password hashing
- **Expense CRUD** — Add, edit, delete, and search expenses
- **14 Categories** — Food, Transport, Shopping, Healthcare, and more
- **Recurring Expenses** — Mark expenses as weekly/monthly/yearly
- **Budget Limits** — Set per-category budgets with threshold alerts
- **Analytics Dashboard** — Monthly trends, category breakdowns, pie charts
- **AI Predictions** — ML model predicts next month's spending
- **Financial Health Score** — 0-100 score based on spending patterns
- **Smart Insights** — AI-generated tips and alerts
- **Pagination & Search** — Efficient expense browsing
- **Responsive Design** — Works on mobile and desktop

---

## 📁 Project Structure

```
smart-expense-tracker/
│
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, StatCard, Toast, Spinner
│   │   │   ├── dashboard/       # InsightCard
│   │   │   └── expenses/        # ExpenseForm, ExpenseItem, categoryConfig
│   │   ├── pages/               # Login, Register, Dashboard, AddExpense, History, Analytics
│   │   ├── hooks/               # useExpenses, useToast
│   │   ├── services/            # api.js (Axios)
│   │   ├── context/             # AuthContext
│   │   └── utils/               # helpers.js
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/                     # Node.js + Express API
│   ├── controllers/             # authController, expenseController, budgetController, aiController
│   ├── routes/                  # authRoutes, expenseRoutes, budgetRoutes, aiRoutes
│   ├── models/                  # User, Expense, Budget (Mongoose schemas)
│   ├── middleware/              # auth.js (JWT), errorHandler.js, validate.js
│   ├── config/                  # database.js
│   ├── utils/                   # logger.js (Winston)
│   ├── server.js                # Express app entry point
│   ├── package.json
│   └── Dockerfile
│
├── ml-service/                  # Python FastAPI ML microservice
│   ├── model/                   # Saved model files (auto-generated)
│   ├── train_model.py           # Model training script
│   ├── predict.py               # Prediction engine
│   ├── main.py                  # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml           # Run everything with one command
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Step-by-Step)

**Estimated time: 20-30 minutes for first-time setup**

### Prerequisites

Install these first:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.9+ | https://python.org |
| MongoDB | Any | https://www.mongodb.com/try/download/community |
| Git | Any | https://git-scm.com |

---

### Option A: Run with Docker (Easiest — 3 commands)

```bash
# 1. Clone / navigate to project
cd smart-expense-tracker

# 2. Start everything
docker compose up --build

# 3. Open browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# ML API:   http://localhost:8000
```

---

### Option B: Run Manually (Step-by-Step)

#### Step 1 — Start MongoDB

**Option 1: MongoDB Atlas (cloud, free)**
1. Go to https://www.mongodb.com/atlas
2. Create free account → Create cluster (free tier)
3. Get your connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/`)

**Option 2: Local MongoDB**
```bash
# Install MongoDB Community Edition from mongodb.com
# Then start it:
mongod --dbpath /data/db   # Mac/Linux
# or just run "mongod" if MongoDB is in PATH
```

---

#### Step 2 — Set Up & Run Backend

```bash
# Navigate to backend folder
cd smart-expense-tracker/backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Now open `.env` in any text editor and fill in:
```
MONGODB_URI=mongodb://localhost:27017/smart-expense-tracker
JWT_SECRET=myverysecretkey12345
ML_SERVICE_URL=http://localhost:8000
```

```bash
# Start the backend
npm run dev
# You should see: ✅ MongoDB Connected and 🚀 Server running on http://localhost:5000
```

---

#### Step 3 — Set Up & Run ML Service

```bash
# Navigate to ml-service folder
cd smart-expense-tracker/ml-service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Train the initial model (only needed once)
python train_model.py

# Start the ML service
python main.py
# You should see: 🚀 Uvicorn running on http://0.0.0.0:8000
```

---

#### Step 4 — Set Up & Run Frontend

```bash
# Navigate to frontend folder
cd smart-expense-tracker/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# You should see: Local: http://localhost:5173
```

---

#### Step 5 — Open the App

Open your browser and go to: **http://localhost:5173**

1. Click **"Create one"** to register
2. Fill in your name, email, and password
3. You're in! Start adding expenses.

---

## 🔗 API Reference

### Auth Endpoints
```
POST /api/auth/register     — Create account
POST /api/auth/login        — Login
GET  /api/auth/profile      — Get profile (requires JWT)
PUT  /api/auth/profile      — Update profile
```

### Expense Endpoints
```
GET    /api/expenses                — List expenses (pagination, filters)
POST   /api/expenses                — Create expense
PUT    /api/expenses/:id            — Update expense
DELETE /api/expenses/:id            — Delete expense
GET    /api/expenses/data/analytics — Analytics summary
```

### Budget Endpoints
```
GET    /api/budgets     — List budgets
POST   /api/budgets     — Create/update budget
DELETE /api/budgets/:id — Delete budget
```

### AI Endpoints
```
GET /api/ai/prediction  — Spending prediction
GET /api/ai/insights    — AI financial insights
```

### ML Service Endpoints
```
GET  /health            — Health check
POST /predict           — Predict spending (internal use)
POST /retrain           — Retrain model
```

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# ML service tests
cd ml-service
python -m pytest
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Backend → Render.com
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect your repo, set environment variables
4. Deploy

### ML Service → Railway
1. railway.app → New Project → Deploy from GitHub
2. Set `START_COMMAND=python main.py`
3. Deploy

---

## 🔒 Security Features

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with configurable expiry
- Rate limiting (100 req/15 min per IP)
- Helmet.js security headers
- CORS protection
- Input validation with express-validator
- MongoDB query injection prevention

---

## 🛠️ Future Improvements

- [ ] Redis caching for analytics queries
- [ ] Role-based access control (admin/user)
- [ ] Email notifications (nodemailer)
- [ ] CSV/PDF export
- [ ] Multi-currency support
- [ ] Unit tests (Jest + pytest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Bank import (Plaid integration)
- [ ] Mobile app (React Native)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection failed` | Make sure MongoDB is running. Check MONGODB_URI in .env |
| `Cannot find module` | Run `npm install` in the backend or frontend folder |
| `ML service unreachable` | The backend will use rule-based fallback automatically |
| `CORS error` | Check FRONTEND_URL in backend .env matches your frontend URL |
| `Port already in use` | Kill the process using that port or change PORT in .env |
| `401 Unauthorized` | Token expired — log out and log back in |

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Built with ❤️ using React, Node.js, Python, and MongoDB.