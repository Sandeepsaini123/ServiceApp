# 🏠 ServiceApp — Home Services Booking Platform

A full-stack home services booking application with Stripe payment integration.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Stripe.js  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT Auth  
**Payment:** Stripe (test & live mode)

## Features

- 🔐 JWT Authentication (Register / Login)
- 🛠 Browse & book home services
- 💳 Stripe payment gateway
- 👤 User booking history with payment status
- 🛡 Admin dashboard — manage services & bookings
- 🔒 Protected routes (user & admin)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/        # MongoDB connection
│   │   ├── controllers/   # Auth, Booking, Service, Payment
│   │   ├── middleware/     # JWT auth middleware
│   │   ├── models/        # User, Service, Booking
│   │   ├── routes/        # API routes
│   │   └── index.js       # Entry point
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, ServiceCard, CheckoutModal, ProtectedRoute
    │   ├── context/       # AuthContext
    │   ├── pages/         # Home, Services, Booking, Login, Register, Admin
    │   ├── routes/        # AppRoutes
    │   └── services/      # API service functions
    └── .env.example
```

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/serviceapp.git
cd serviceapp
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env   # Fill in your Stripe publishable key
npm run dev
```

### 4. Create admin user
```bash
cd backend
node src/scripts/createAdmin.js
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | Server port (default: 5000) |
| `JWT_SECRET` | Secret key for JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login user |
| GET | `/api/services` | — | Get all services |
| POST | `/api/services` | Admin | Create service |
| PUT | `/api/services/:id` | Admin | Update service |
| DELETE | `/api/services/:id` | Admin | Delete service |
| POST | `/api/bookings` | User | Create booking |
| GET | `/api/bookings` | User | Get my bookings |
| GET | `/api/bookings/all` | Admin | Get all bookings |
| PATCH | `/api/bookings/:id/status` | Admin | Update booking status |
| POST | `/api/payment/create-intent` | User | Create Stripe PaymentIntent |
| POST | `/api/payment/confirm-booking` | User | Confirm booking after payment |

## Deployment

- **Backend** → [Render](https://render.com) or [Railway](https://railway.app)
- **Frontend** → [Vercel](https://vercel.com)

See deployment guide below.

## Test Card (Stripe Test Mode)
```
Card Number : 4242 4242 4242 4242
Expiry      : 12/29
CVC         : 123
```
