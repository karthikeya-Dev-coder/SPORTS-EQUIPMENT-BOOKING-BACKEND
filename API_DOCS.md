# SportSync API Documentation

This guide provides the necessary details to test all **27 endpoints** using Postman.

**Base URL**: `http://localhost:5000/api`

---

## 🛠️ Postman Configuration

| Component | Value | Notes |
| :--- | :--- | :--- |
| **Headers** | `Content-Type: application/json` | Required for all POST/PATCH requests |
| **Auth Header** | `Authorization: Bearer <your_token>` | Required for locked routes. Get token from `/auth/login`. |

---

## 🔐 Authentication

| Method | Endpoint | Auth | Body (JSON) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | None | `{ "email": "...", "password": "..." }` | Login to get JWT Token |
| `POST` | `/auth/forgot-password` | None | `{ "email": "..." }` | Trigger password reset email |

---

## 📦 Equipment Management

| Method | Endpoint | Auth | Body (JSON) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/equipment` | User | None | List all items |
| `GET` | `/equipment/assigned` | Staff | None | View items assigned to you |
| `POST` | `/equipment` | Admin | `{ "name": "Bat", "category": "Cricket", "totalQuantity": 20 }` | Add new inventory |
| `PATCH` | `/equipment/:id` | Admin | `{ "totalQuantity": 25, "available": 20 }` | Update details/stock |
| `DELETE` | `/equipment/:id` | Admin | None | Remove item |

---

## 👤 User Management

| Method | Endpoint | Auth | Body (JSON) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users` | Admin/Staff | None | Search and list all users |
| `GET` | `/users/students` | Admin/Staff | None | List only student accounts |
| `POST` | `/users` | Admin | `{ "name": "Karthik", "email": "k@u.com", "role": "staff" }` | Manual user creation |
| `POST` | `/users/bulk-import` | Admin | `{ "students": [{ "name": "S1", "email": "s1@u.com" }], "sendEmail": true }` | CSV Import logic |
| `PATCH` | `/users/:id` | Admin | `{ "isActive": false }` | Update user status/details |
| `DELETE` | `/users/:id` | Admin | None | Delete user |

---

## 📅 Bookings

| Method | Endpoint | Auth | Body (JSON) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/bookings` | Admin/Staff | None | Global booking history |
| `GET` | `/bookings/my-bookings` | Student | None | View personal booking status |
| `POST` | `/bookings` | Student | `{ "equipmentId": "...", "date": "2024-04-16", "timeSlot": "09:00 - 10:00", "quantity": 1 }` | Book an item |
| `PATCH` | `/bookings/:id/status` | Admin/Staff | `{ "status": "approved" }` | Status: `approved`, `rejected`, `returned` |
| `POST` | `/bookings/:id/return` | Staff | None | Log equipment return |

---

## ⚠️ Warnings & Penalties

| Method | Endpoint | Auth | Body (JSON) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/warnings` | Admin/Staff | None | View all penalties |
| `POST` | `/warnings` | Admin/Staff | `{ "studentId": "...", "reason": "Late", "level": 1, "amount": 100 }` | Issue a fine |
| `POST` | `/warnings/:id/pay` | Admin/Staff | None | Mark penalty as paid |

---

## 📊 Analytics & Dashboard

| Method | Endpoint | Auth | Body (JSON) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Admin/Staff | None | Analytics overview cards |
| `GET` | `/dashboard/activities` | Admin/Staff | None | Activity log stream |
| `GET` | `/health` | None | None | Server status check |
