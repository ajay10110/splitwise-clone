# Splitwise Clone Web Application

A modern, full-stack Splitwise-like application for splitting expenses and settling balances with friends. Built with the MERN stack (MongoDB, Express, React, Node.js) and styled beautifully with Tailwind CSS.

## Features
- **User Authentication**: Secure login and registration with JWT.
- **Friend Management**: Add friends easily.
- **Expense Tracking**: Add expenses, record who paid, and split them using flexible methods (Equal, Exact Amounts, or Percentages).
- **Dashboard**: Modern glassmorphism UI showing net balances, total owed, and total to receive.
- **Settle Up**: Easily record payments off-platform to settle debts.
- **Responsive Design**: Mobile-friendly, beautiful aesthetic styling.

## Pre-requisites
- Node.js installed
- MongoDB running locally on `localhost:27017`

## How to Run Locally

### 1. Start the Backend server
```bash
cd backend
npm install
npm run dev
# OR: npx nodemon server.js
```
The server will run on `http://localhost:5000`.

### 2. Start the Frontend dev server
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173` (or another port if busy).

## Usage Guide
1. Create a new account.
2. Add a few friends using the sidebar.
3. Click **Add Expense** to record a bill. Try the different split modes.
4. Watch the net balance recalculate dynamically.
5. Click **Settle Up** to record a payment to or from a friend.
