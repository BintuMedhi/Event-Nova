# EventNova 🎟️

EventNova is a modern, premium full-stack event marketplace that allows users to discover, book, and manage events. Designed with dynamic aesthetics, AI-powered recommendations, and a seamless booking experience.

## Description

EventNova connects organizers and attendees through a sleek, glassmorphic UI. It features real-time seat mapping, AI event concierges (powered by Groq), and secure UPI/Card payments. EventNova is built for scale, supporting dynamic event categorization, featured listings, and an integrated promoter dashboard.

## Features

- **Dynamic Event Discovery**: Filter by categories (Music, Hackathons, Tech Conferences, etc.), cities, and prices.
- **Interactive Seat Mapping**: Real-time selection of general admission and VIP tiers.
- **AI Event Concierge**: Get personalized event recommendations based on your vibe, budget, and location.
- **Secure Payments Flow**: Integrated payment simulation with UPI/QR codes and persistent demo ticketing.
- **Promoter Dashboard**: Track ticket sales, revenue, and audience demographics.
- **Premium Aesthetics**: Glassmorphism, smooth animations, and a responsive mobile-first design.

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **AI Integration**: Groq API (Llama 3)
- **Payments**: Razorpay (Mocked in demo mode)

## Installation

```bash
# Clone the repository
git clone https://github.com/BintuMedhi/Event-Nova.git
cd Event-Nova

# Install dependencies for both frontend and backend
cd frontend && npm install
cd ../backend && npm install
```

## Environment Variables

Copy the `.env.example` file to `.env` in the root (or in both `frontend/` and `backend/` as needed) and fill in your credentials:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
EMAIL_USER=your_smtp_email
EMAIL_PASSWORD=your_smtp_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Local Development

Start both the frontend and backend development servers.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Access the application at `http://localhost:3000`.

## Production Deployment

### MongoDB Setup
1. Create a MongoDB cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist `0.0.0.0/0` (allow access from anywhere) in network access.
3. Get your connection string and add it to `MONGODB_URI`.

### AI Integration Setup
1. Go to the [Groq Console](https://console.groq.com/).
2. Generate an API Key.
3. Set the key as `GROQ_API_KEY`.

### Vercel Deployment Steps

EventNova is configured as a monorepo. The included `vercel.json` maps frontend to Next.js and backend API routes to Node.js.

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the `Event-Nova` repository.
4. **Important**: If you only want to deploy the frontend, set the **Root Directory** to `frontend`.
5. Add all required **Environment Variables** in the Vercel dashboard.
6. Click **Deploy**.

## Screenshots

*(Add your high-quality screenshots here once deployed)*

- Homepage & Discover
- Interactive Seat Booking
- AI Chat Interface
- Success & QR Demo Checkout
