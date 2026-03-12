# 📖 Smart Expense Tracker — User Guide

Welcome! This guide walks you through every feature of Smart Expense Tracker, step by step. No prior technical knowledge required.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Adding Expenses](#adding-expenses)
4. [Viewing & Managing History](#expense-history)
5. [Analytics](#analytics)
6. [Budgets](#budgets)
7. [AI Insights](#ai-insights)
8. [Understanding Your Health Score](#health-score)
9. [Tips for Best Results](#tips)

---

## 1. Getting Started {#getting-started}

### Creating Your Account

1. Open the app in your browser (default: http://localhost:5173)
2. Click **"Create one"** below the Sign In button
3. Fill in:
   - **Full Name** — Your display name
   - **Email** — Used to log in
   - **Password** — Minimum 6 characters, must include a number
4. Click **"Create Account"**
5. You're automatically logged in and taken to your Dashboard

### Logging In

1. Enter your email and password
2. Click **"Sign In"**
3. Use the 👁 icon to show/hide your password

### Logging Out

- Desktop: Click **"Sign out"** at the bottom of the sidebar
- Mobile: No logout button visible (clear browser data to log out)

---

## 2. Dashboard Overview {#dashboard-overview}

The Dashboard is your financial command center. Here's what you'll see:

### Stats Cards (top row)

| Card | What it shows |
|------|--------------|
| **This Month** | Total amount spent in the current calendar month |
| **Transactions** | Number of expense entries this month |
| **Predicted** | AI's estimate of what you'll spend next month |
| **Health Score** | Your financial health rating (0–100) |

### Spending Trend Chart

- Shows your monthly spending over the last 6 months
- Hover over any point to see the exact amount
- An upward line means spending is increasing — time to review!

### By Category Pie Chart

- Visual breakdown of where your money goes this month
- Hover segments to see category totals

### AI Insights Panel

- Real-time insights generated from your spending data
- Updates automatically as you add more expenses
- Shows your biggest spending category, trends, and personalized tips

### Recent Expenses

- Your 5 most recent transactions
- Click **"View all"** to go to the full history

---

## 3. Adding Expenses {#adding-expenses}

### How to Add an Expense

1. Click the **"Add Expense"** button (top right on desktop, or the **"+"** icon in the bottom nav on mobile)
2. Fill in the form:

| Field | Required? | Notes |
|-------|-----------|-------|
| **Amount** | ✅ Yes | Enter in dollars (e.g., 45.50) |
| **Category** | ✅ Yes | Select from 14 categories |
| **Description** | ✅ Yes | Brief note (e.g., "Grocery run") |
| **Date** | ✅ Yes | Defaults to today |
| **Recurring** | ❌ Optional | Check if this repeats |
| **Frequency** | ❌ Optional | Weekly, monthly, or yearly (if recurring) |
| **Notes** | ❌ Optional | Extra details |

3. Click **"Add Expense"**
4. You'll see a green success screen and be redirected to History

### Budget Alerts

After adding an expense, if you have a budget set for that category, you may see:
- 🟡 **Warning** — You've used 80%+ of your budget
- 🔴 **Exceeded** — You've gone over your budget

### Available Categories

- 🍔 Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 🏥 Healthcare
- 🏠 Housing
- 💡 Utilities
- 📚 Education
- ✈️ Travel
- 💆 Personal Care
- 🛡️ Insurance
- 📈 Investments
- 🎁 Gifts & Donations
- 📦 Other

---

## 4. Expense History {#expense-history}

### Viewing All Expenses

Click **"History"** in the navigation bar.

You'll see a list of all your expenses, newest first.

### Searching

Use the search bar to find expenses by description. For example, typing "coffee" will show all expenses with "coffee" in the description.

### Filtering by Category

Use the category dropdown to view only expenses from a specific category (e.g., only "Food & Dining" expenses).

### Editing an Expense

1. Hover over any expense item
2. Click the ✏️ pencil icon that appears
3. Update any fields in the popup form
4. Click **"Save Changes"**

### Deleting an Expense

1. Hover over any expense item
2. Click the 🗑️ trash icon
3. Confirm the deletion in the popup
4. The expense is permanently removed

### Pagination

If you have more than 20 expenses, use the **Previous / Next** buttons at the bottom to navigate pages.

---

## 5. Analytics {#analytics}

Click **"Analytics"** in the navigation bar.

### Monthly Bar Chart

- Compares your spending across the last 12 months
- Each bar = one month's total spending
- Hover for exact amounts

### Spending by Category

- Shows each category as a horizontal progress bar
- Displays: total spent, percentage of overall spending, and number of transactions

### Budget Status Cards

If you've set budgets (see Budgets section), you'll see colored status cards:
- 🟢 Green — Under budget (good!)
- 🟡 Yellow — Near limit (>80% used)
- 🔴 Red — Over budget

### AI Prediction Panel

Shows the ML model's prediction for next month along with:
- Predicted dollar amount
- Budget suggestion
- Trend direction (↑ increasing / ↓ decreasing / → stable)
- Confidence percentage

---

## 6. Budgets {#budgets}

*Note: Budget management is done via the API. A budget UI page is on the roadmap.*

### How Budgets Work

- Set a monthly spending limit for any category
- The system tracks your current month's spending vs the limit
- You get alerts when adding expenses that push you over the threshold

### Setting a Budget via API

Send a POST request to `/api/budgets`:

```json
{
  "category": "Food & Dining",
  "limit": 500,
  "period": "monthly",
  "alertThreshold": 80
}
```

- `alertThreshold`: Alert you when X% of budget is used (default: 80%)

---

## 7. AI Insights {#ai-insights}

The AI panel generates several types of insights:

### 💡 Top Spending Category

Tells you which category is consuming the most of your budget, with the percentage and dollar amount.

### 📈 / 📉 Spending Trend

Compares recent months to your overall average:
- 📈 **Increasing** — Spending is going up. Consider reviewing your habits.
- 📉 **Decreasing** — Great job! You're spending less.

### 🏆 Financial Health Score

A 0-100 score based on:
- Diversity of spending (tracking more categories = better)
- Month-over-month trend
- Whether any single category dominates your spending

### 💰 Saving Tips

Personalized suggestions based on your actual spending patterns:
- High food spending → Meal prep suggestion
- High entertainment → Free alternatives suggestion
- General → Subscription audit reminder

### AI Prediction

Based on your last 6 months of data, the ML model predicts:
1. How much you'll spend next month
2. A suggested budget to stay on track
3. The confidence level of the prediction (higher = more data = more accurate)

*Tip: The more expenses you track, the more accurate the AI becomes!*

---

## 8. Understanding Your Health Score {#health-score}

Your Financial Health Score (0-100) is calculated based on multiple factors:

| Score Range | Status | Meaning |
|------------|--------|---------|
| 80–100 | 🟢 Excellent | Great spending habits! |
| 60–79 | 🟢 Good | Minor improvements possible |
| 40–59 | 🟡 Fair | Review your spending habits |
| 0–39 | 🔴 Needs Attention | Time for a budget overhaul |

### How to Improve Your Score

1. **Track consistently** — Log expenses daily for accuracy
2. **Diversify categories** — Tracking 5+ categories shows financial awareness
3. **Reduce trend** — Decreasing month-over-month spending improves score
4. **Avoid dominance** — No single category should be >50% of spending

---

## 9. Tips for Best Results {#tips}

### For Accurate AI Predictions

- Add at least **2 months** of expense data before expecting predictions
- The more data, the better — aim for 6+ months of history

### For Useful Analytics

- Be consistent with categories (e.g., always use "Food & Dining" for groceries)
- Add expenses on the same day you spend (don't let them pile up)
- Use descriptions clearly so you can search later

### For Budget Management

- Start by tracking without budgets for 1 month to understand your baseline
- Then set realistic budgets based on your actual spending patterns
- Set the alert threshold to 80% so you get advance warning

### Security Best Practices

- Use a strong, unique password
- Don't share your account credentials
- Log out when using shared computers

---

## 🔧 Troubleshooting

### "Something went wrong" error

- Check that the backend server is running (port 5000)
- Check that MongoDB is running
- Try refreshing the page

### AI Insights show "Add more expenses"

- You need at least 2-3 expenses before insights generate
- For predictions, you need spending across at least 2 different months

### Expense not showing up

- Check if you accidentally applied a category or search filter
- Click "Clear" button to reset all filters

### Forgot password

- Currently: delete your account and create a new one
- Password reset via email is a planned future feature

---

*Last updated: 2026 | Smart Expense Tracker v1.0*