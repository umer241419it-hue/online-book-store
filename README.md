# MERN-Based Online Book Store

Assignment 2: Online Book Store developed with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Users can browse books with cover images, search by title and author, filter by category, view detailed information, and manage an interactive shopping cart. Administrators can manage the bookstore catalog with password protection and complete CRUD operations (Create, Read, Update, Delete).

---

## Technologies Used

- **MongoDB**: NoSQL database for storing books inventory (`online_book_store` database, `books` collection).
- **Express.js**: Backend REST API framework for handling routing, requests, and middleware.
- **React.js**: Frontend single-page application built with Vite and modern React functional components.
- **Node.js**: Asynchronous JavaScript runtime environment.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB validation and schema definition.
- **Axios**: HTTP client for seamless communication between React frontend and Express backend.
- **React Context API**: Global state management for shopping cart with `localStorage` persistence.
- **JSON Web Tokens (JWT)**: Lightweight token-based authentication for administrative operations.

---

## Features

### User Features
1. **Browse All Books with Images**: View books with matching cover images, category tags, title, author, price (₹), and live stock status.
2. **Search Books**: Real-time, case-insensitive search by book title or author handled via the backend API.
3. **Filter by Category**: Quick-select category filter (Programming, Web Development, Database, AI & ML, Fiction, Other).
4. **Combined Search & Filter**: Search and category filtering operate seamlessly together (`/api/books?search=React&category=Web%20Development`).
5. **View Book Details**: Dedicated modal displaying cover image and full details (Book ID, Title, Author, Category, Price, Stock, Description) fetched directly from `GET /api/books/:id`.
6. **Add to Cart**: Add books to shopping cart with real-time stock validation and cover thumbnails.
7. **Update Cart Quantity**: Increment and decrement items with `+` / `-` stepper buttons.
8. **Stock Guard**: Prevents adding quantities higher than available MongoDB stock and shows clear "Out of Stock" indicators.
9. **Calculate Total Price**: Automatic calculation of individual item subtotals and overall cart total.
10. **Cart Persistence**: Cart contents automatically persist in browser `localStorage` across page reloads.

### Admin Features (Password-Protected)
1. **Admin Password Authentication**: Access to the Admin Panel requires a password verified securely on the backend (`ADMIN_PASSWORD=admin123`).
2. **Protected Backend API**: `POST`, `PUT`, and `DELETE /api/books` are strictly protected with JWT Bearer token authentication middleware.
3. **Admin Dashboard**: Inventory view with summary metrics (Total Books, Total Stock Units, Low Stock, Out of Stock) and a searchable table with book cover thumbnails.
4. **Add New Book**: Add books with cover image URL and field validation (Book ID, Title, Author, Category, Price ≥ 0, Quantity integer ≥ 0, Description).
5. **Update Book**: Edit any existing book's details and image URL with duplicate ID protection.
6. **Delete Book**: Remove books from the database with a custom confirmation modal dialog (no native browser popups).
7. **Session Logout**: Secure logout button that removes the admin token and returns to customer view.

---

## Project Structure

```text
online-book-store/
│
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── bookController.js   # CRUD & search/filter API controller
│   │   └── adminController.js  # Admin password authentication controller
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT Admin protection middleware
│   │   └── errorHandler.js     # Centralized error handler
│   ├── models/
│   │   └── Book.js             # Mongoose Book schema (includes image field)
│   ├── routes/
│   │   ├── bookRoutes.js       # Express routes (POST/PUT/DELETE protected)
│   │   └── adminRoutes.js      # Admin login route (/api/admin/login)
│   ├── server.js               # Express server entry point
│   ├── seed.js                 # Sample books database seeder with image URLs
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Environment variables (PORT, MONGO_URI, ADMIN_PASSWORD, JWT_SECRET)
│   └── .env.example            # Environment variables example template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with branding, cart badge & admin toggle
│   │   │   ├── SearchBar.jsx       # Real-time search input
│   │   │   ├── CategoryFilter.jsx  # Category dropdown & pills
│   │   │   ├── BookCard.jsx        # Book card with cover image & stock controls
│   │   │   ├── BookGrid.jsx        # Responsive books layout
│   │   │   ├── BookDetailsModal.jsx# Details modal with cover image from GET /api/books/:id
│   │   │   ├── Cart.jsx            # Slide-over shopping cart
│   │   │   ├── CartItem.jsx        # Cart row with thumbnail, stepper & subtotal
│   │   │   ├── AdminPanel.jsx      # Inventory table with thumbnails, metrics & logout
│   │   │   ├── AdminLoginModal.jsx # Admin password authentication modal
│   │   │   ├── BookFormModal.jsx   # Add/Edit form modal with image URL & preview
│   │   │   ├── DeleteConfirmModal.jsx # Delete confirmation modal
│   │   │   ├── Toast.jsx           # Notification toasts
│   │   │   ├── LoadingState.jsx    # Loading indicators
│   │   │   └── EmptyState.jsx      # Zero-state placeholder
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # User bookstore interface
│   │   │   └── AdminPage.jsx       # Admin inventory management interface
│   │   ├── services/
│   │   │   └── api.js              # Axios API service methods & interceptors
│   │   ├── context/
│   │   │   └── CartContext.jsx     # Context API for cart state & storage
│   │   ├── App.jsx                 # Root React application
│   │   ├── main.jsx                # Vite React DOM entry
│   │   └── index.css               # Vanilla CSS design system
│   ├── package.json
│   ├── vite.config.js          # Vite config with API proxy
│   └── index.html
│
├── README.md
└── .gitignore
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Installed and running locally on default port `27017`

---

## Installation & Setup

### 1. Backend Setup

Open a terminal and navigate to `backend`:

```bash
cd backend
npm install
```

Configure `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/online_book_store
ADMIN_PASSWORD=admin123
JWT_SECRET=supersecretjwtkey123
```

### 2. Seed Sample Database Records

Populate the database with realistic sample books with matching book cover images:

```bash
npm run seed
```

*Note: The seed script clears existing books and inserts 12 curated titles with matching image URLs.*

### 3. Frontend Setup

Open another terminal and navigate to `frontend`:

```bash
cd ../frontend
npm install
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
# or: node server.js
```

The Express server will listen on `http://localhost:5000`.

### Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

The React frontend will be accessible at `http://localhost:3000`.

---

## Admin Authentication Flow

```text
Admin clicks "Admin Panel"
         ↓
AdminLoginModal prompts for Admin Password
         ↓
POST /api/admin/login { password: "admin123" }
         ↓
Backend verifies ADMIN_PASSWORD from .env
         ↓
Backend returns signed JWT token (role: "admin")
         ↓
Frontend saves token in localStorage
         ↓
Axios request interceptor attaches "Authorization: Bearer <token>"
         ↓
Backend middleware "protectAdmin" verifies token on POST/PUT/DELETE
         ↓
Admin CRUD permitted
```

---

## REST API Documentation

Base URL: `http://localhost:5000`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/admin/login` | Public | Verify password and receive admin JWT token |
| **GET** | `/api/books` | Public | Get all books (supports `?search=` and `?category=`) |
| **GET** | `/api/books/:id` | Public | Get single book by ID or `bookId` |
| **POST** | `/api/books` | **Admin Only** | Add new book to catalog (requires Bearer token) |
| **PUT** | `/api/books/:id` | **Admin Only** | Update existing book (requires Bearer token) |
| **DELETE**| `/api/books/:id` | **Admin Only** | Delete book by identifier (requires Bearer token) |
| **GET** | `/api/health` | Public | Health check endpoint |

---

## Academic Assessment & Viva Checklist

- [x] **MongoDB**: Book model with `image` URL field, validations, and custom `bookId`.
- [x] **Express**: REST API with proper status codes (200, 201, 400, 401, 403, 404, 500).
- [x] **Admin Security**: Password verification via backend `.env` (`ADMIN_PASSWORD=admin123`), protected routes with JWT bearer token middleware.
- [x] **Book Cover Images**: Responsive cards, details modal, cart items, admin table thumbnails, and SVG fallback placeholder.
- [x] **Shopping Cart**: Real-time stock validation, quantity stepper, subtotal/total calculation, and `localStorage` persistence.
