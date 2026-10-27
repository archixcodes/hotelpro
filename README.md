# HotelPro

HotelPro is a MERN hotel booking and management starter with customer and administrator workflows. The repository contains a Vite/React client and an Express/Mongoose API.

## Requirements

- Node.js 20+
- MongoDB configured as a replica set (MongoDB Atlas works)

MongoDB transactions keep bookings and nightly inventory claims consistent. A unique (room, night) index is the final concurrency guard against double booking. Check-in is inclusive and check-out is exclusive.

## Run locally

1. Copy server/.env.example to server/.env and set MONGODB_URI and JWT_SECRET.
2. Install dependencies from the repository root with npm install.
3. Start the API and client together with npm run dev.
4. Create an administrator with npm run seed:admin -- --email admin@example.com --password 'a-long-password'.

The API listens on port 5000 by default and the client on port 5173. API routes are under /api. The client uses VITE_API_URL or defaults to http://localhost:5000/api.

## API overview

- POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- GET /api/rooms (supports minPrice, maxPrice, capacity, checkIn, checkOut, q)
- GET /api/rooms/:id
- Admin: POST /api/rooms, PATCH /api/rooms/:id, DELETE /api/rooms/:id
- Customer: POST /api/bookings, GET /api/bookings/mine, PATCH /api/bookings/:id/cancel
- Admin: GET /api/bookings

Booking payload: { roomId, checkIn: YYYY-MM-DD, checkOut: YYYY-MM-DD, guests }.

## Production notes

Use HTTPS, a strong secret manager value for JWT_SECRET, a restricted CLIENT_URL, backups, and monitoring. Configure deployment-specific logging, email verification, and password recovery before exposing this starter publicly. Admin access is provisioned only by the seed command; public registration always creates customer accounts.
