# Library Book Borrowing System (LBBS)

**IST 3205 — Software Testing | Group 3 | Makerere University**

A full-stack MERN application implementing a library book borrowing system with REST API, React frontend, and 25+ integration tests.

---

## 📁 Project Structure

```
lbbs/
├── backend/          # Node.js + Express.js REST API
│   ├── models/       # Mongoose schemas (Book, Member)
│   ├── routes/       # API route handlers
│   ├── middleware/   # Error handling
│   ├── tests/        # Jest + Supertest integration tests
│   ├── server.js     # Entry point
│   ├── seed.js       # Database seeder
│   └── .env.example
└── frontend/         # React.js SPA
    ├── src/
    │   ├── pages/    # Route pages
    │   ├── utils/    # Axios API client
    │   └── index.css # Design system
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB 6.0+ (local or [MongoDB Atlas](https://cloud.mongodb.com))
- npm

### 1. Backend

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env: set MONGO_URI to your MongoDB connection string

# Seed sample data (8 books, 5 members)
npm run seed

# Start development server
npm run dev
# → API running at http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

# Start dev server
npm start
# → App running at http://localhost:3000
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests cover all 10 functional requirements (FR-01 to FR-10) plus atomicity requirements (NFR-02). Uses `supertest` for HTTP-level integration testing and `mongodb-memory-server` for isolated in-memory database.

---

## 🔌 API Reference

### Books
| Method | Endpoint | FR | Description |
|--------|----------|----|-------------|
| `POST` | `/api/books` | FR-01, FR-02 | Add a book |
| `GET` | `/api/books` | FR-09 | List/search books (`?q=keyword`) |
| `GET` | `/api/books/:bookId` | — | Get single book |
| `PUT` | `/api/books/:bookId` | — | Update book metadata |
| `DELETE` | `/api/books/:bookId` | — | Remove a book |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/members` | Register member |
| `GET` | `/api/members` | List members (`?q=search`) |
| `GET` | `/api/members/:memberId` | Get member |
| `DELETE` | `/api/members/:memberId` | Remove member |

### Borrows
| Method | Endpoint | FR | Description |
|--------|----------|----|-------------|
| `POST` | `/api/borrows/borrow` | FR-03–06 | Borrow a book |
| `POST` | `/api/borrows/return` | FR-07–08 | Return a book |
| `GET` | `/api/borrows/member/:memberId` | FR-10 | View member's borrowed books |

---

## 📋 HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / validation error |
| `404` | Resource not found |
| `409` | Conflict (duplicate, already borrowed, no copies) |

---

## 👥 Group 3

| Name | Reg. No | Student No. |
|------|---------|-------------|
| MUGISHA RAYAN | 23/U/24192/EVE | 2300724192 |
| AKULE ROBERT | 23/U/05785/EVE | 2300705785 |
| AINEBYOONA EVANS | 23/U/25474/EVE | 2300725474 |
| MUSIIME MARTHA TRISHA | 23/U/24223/PS | 2300724223 |
| SSESSANGA NEHEMIAH | 23/U/17751/PS | 2300717751 |
