# ShopKart — MERN E-commerce Platform

A full-stack store built with **MongoDB, Express, React (Vite) and Node.js**: product catalogue with search,
filters and pagination, cart, cash-on-delivery checkout, order tracking, JWT authentication, and an admin
dashboard that controls products, categories, orders, customers and the store's look and settings.

Products, customers and orders are demo data for portfolio use.

## Features

**Storefront**
- Home page driven by settings (headline, banner, announcement bar, featured products)
- Shop page: search, category, price range, in-stock filter, sorting, pagination (filters live in the URL)
- Product page with stock status, sale price, related products
- Cart with free-delivery progress, checkout with delivery details, order tracking timeline
- Customers can cancel pending orders; profile and password change
- Light and dark mode, fully responsive

**Admin dashboard** (`/admin`)
- Overview: revenue, orders, products, customers, 14-day sales chart, orders by status, low stock, best sellers
- Products: add/edit/delete, image upload or URL, sale price, featured toggle, search and filter
- Categories: add, rename (products follow), reorder, delete (blocked while products use it)
- Orders: filter by status, full order details, status updates (cancelling returns stock)
- Customers: order count and spend, grant/remove admin, delete
- Store settings: name, logo, colours (live preview + presets), default theme, homepage text and banner,
  delivery fee and free-delivery threshold, low-stock level, contact and social links, demo-login toggle

**Backend details**
- Order totals and delivery fee are calculated on the server from database prices
- Stock is reserved with a conditional atomic update, and rolled back if any item fails
- Role-based access (`protect` + `admin` middleware); registration can never create an admin
- Central error handler with readable messages for validation, duplicate and cast errors

## Quick start (Windows)
1. Install Node.js LTS from nodejs.org.
2. Open `server\.env` and replace `PASTE_YOUR_MONGODB_ATLAS_STRING_HERE` with your MongoDB connection string
   (Atlas string ending in `/shopkart`, or local `mongodb://127.0.0.1:27017/shopkart`).
   On Atlas, Network Access must allow your IP.
3. Double-click `start.bat`. It installs packages, seeds demo data once, and opens the site.

## Manual start
```
cd server && npm install && npm run seed && npm run dev
cd client && npm install && npm run dev        (second terminal)
```
Store: http://localhost:5173 · Dashboard: http://localhost:5173/admin

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopkart.com | admin123 |
| Customer | user@shopkart.com | user123 |

`npm run seed` wipes and recreates all demo data.

## Deploy on Vercel
One Vercel project serves both the React build and the Express API (as a serverless function).
1. Push the project to GitHub (`.env` is git-ignored, so secrets stay off GitHub).
2. MongoDB Atlas > Network Access: add `0.0.0.0/0` (Vercel has no fixed IP).
3. Vercel > Add New Project > import the repo. Keep Root Directory as the project root; `vercel.json` sets the build.
4. Add environment variables: `MONGO_URI`, `JWT_SECRET` (a new long random string), `JWT_EXPIRES=7d`.
5. Deploy. Seed once from your computer with the same Atlas string: `cd server && npm run seed`.

Uploaded images are saved in MongoDB (not on disk), because a serverless file system is temporary.

## API

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | Public |
| GET / PUT | /api/auth/me, /api/auth/profile | User |
| GET | /api/products?keyword&category&minPrice&maxPrice&inStock&featured&sort&page&limit | Public |
| GET | /api/products/:id (includes related products) | Public |
| POST / PUT / DELETE | /api/products, /api/products/:id | Admin |
| GET | /api/categories | Public |
| POST / PUT / DELETE | /api/categories, /api/categories/:id | Admin |
| POST | /api/orders | User |
| GET | /api/orders/my, /api/orders/:id | Owner or admin |
| PUT | /api/orders/:id/cancel | Owner (pending only) |
| GET | /api/orders?status&page | Admin |
| PUT | /api/orders/:id/status | Admin |
| GET / PUT / DELETE | /api/users, /api/users/:id/role, /api/users/:id | Admin |
| GET / PUT | /api/settings | Public / Admin |
| GET | /api/stats | Admin |
| POST | /api/upload (multipart, field `image`, 2 MB max, stored in MongoDB) | Admin |
| GET | /api/images/:id | Public |

## Project structure
```
server/
  app.js               Express app (routes, middleware), exported
  server.js            local entry: connects DB and calls app.listen
api/index.js           Vercel serverless entry, reuses server/app.js
vercel.json            build settings and rewrites for Vercel
  config/db.js         MongoDB connection
  middleware/          auth (JWT, admin) and error handlers
  models/              User, Product, Category, Order, Settings
  routes/              one file per resource
  seed.js              demo data
client/src/
  context/             Settings, Theme, Auth, Cart, UI (toasts + confirm)
  layouts/             StoreLayout, AdminLayout
  pages/               storefront pages
  pages/admin/         dashboard pages
  components/          shared UI pieces
  styles.css           design tokens + all styles (light/dark)
```
