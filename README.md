# 💸 SpendSmart — Smart Expense Tracker

> A full-stack expense tracking app with AI-powered insights, savings goals, bill reminders, and spending challenges — built with React, Node.js, MongoDB, and Python.

---

## 🌟 Features

### 💰 Expense Management
- Add, edit, and delete expenses with category tagging
- Support for recurring expenses (weekly / monthly / yearly)
- Multi-currency support (14 world currencies)
- Full expense history with filters and pagination

### 📊 Analytics & Insights
- Monthly spending bar charts and category breakdowns
- AI-powered spending insights and predictions
- Budget status tracking per category

### 🗓️ Expense Heatmap
- GitHub-style daily spending heatmap
- Dark color = high spending, light color = low spending
- Hover any day to see exact spend
- Monthly breakdown bar chart

### 🔔 Bill Reminders
- Add recurring bills (Rent, Electricity, Internet, etc.)
- Auto-detects days until due date
- Alerts for overdue and upcoming bills

### 🎯 Savings Challenges
- 30 Day, 52 Week, 100 Day, or Custom challenges
- Daily check-ins with progress tracking
- Emoji milestone rewards 🎯 ⚡ 💪 🔥 🏆

### 🐷 Piggy Bank
- Personal savings vault with a savings goal
- Track deposits and goal progress
- Single-currency design with zero rounding loss

### 💱 Currency Converter
- Live conversion across 14 currencies
- Quick pair buttons and rate table

### 👤 Profile & Preferences
- Set preferred currency (saved across all pages)
- Personalize your display name

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Recharts |
| Backend     | Node.js, Express, MongoDB, Mongoose  |
| Auth        | JWT (JSON Web Tokens)                |
| ML Service  | Python, FastAPI, Scikit-learn        |
| Dev Tools   | Docker, ESLint                       |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/shreyaabhat/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-expense-tracker
JWT_SECRET=mysupersecretjwtkey123changethis
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

Start MongoDB (Windows):
```bash
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the ML Service
```bash
cd ml-service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python train_model.py
python main.py
```

### 4. Set up the Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
smart-expense-tracker/
├── backend/
│   ├── controllers/       # Route logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, validation, error handling
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/         # All page components
│       ├── components/    # Reusable UI components
│       ├── context/       # Auth context
│       ├── hooks/         # Custom hooks
│       └── services/      # API calls
└── ml-service/
    ├── main.py            # FastAPI server
    ├── predict.py         # Prediction logic
    └── train_model.py     # Model training
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET/PUT | `/api/auth/profile` | Get/update profile |
| GET/POST | `/api/expenses` | List/create expenses |
| PUT/DELETE | `/api/expenses/:id` | Update/delete expense |
| GET | `/api/expenses/data/analytics` | Analytics data |
| GET/POST | `/api/budgets` | List/create budgets |
| DELETE | `/api/budgets/:id` | Delete budget |
| GET | `/api/piggybank` | Get piggy bank |
| POST | `/api/piggybank/deposit` | Add deposit |
| PUT | `/api/piggybank/settings` | Update settings |
| GET | `/api/ai/prediction` | AI spending prediction |
| GET | `/api/ai/insights` | AI insights |

---

## 📸 Pages

- `/dashboard` — Overview with charts and recent expenses
- `/add-expense` — Add a new expense
- `/expenses` — Full expense history
- `/analytics` — Detailed analytics and AI insights
- `/heatmap` — GitHub-style spending heatmap
- `/bills` — Bill reminders
- `/challenge` — Savings challenges
- `/piggybank` — Personal savings vault
- `/converter` — Currency converter
- `/profile` — User preferences

---

## 👩‍💻 Author

**Shreya Bhat**
GitHub: [@shreyaabhat](https://github.com/shreyaabhat)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
