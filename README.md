# B2C Real Estate Platform

A React + TypeScript application for a **B2C real estate platform** where users can browse properties for rent or sale, save favorites, and send viewing/contact requests.

The project starts with **JSON Server** as a mock backend. The real backend will be implemented later by a backend developer, so the frontend is structured to make the API layer easy to replace.

---

## Project Goal

The goal of this project is to build a realistic real estate web application with:

- property listings for rent and sale
- public browsing and filtering
- authentication
- customer features
- admin dashboard
- property management
- inquiry/viewing request flow
- scalable frontend architecture

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Routing
- React Router

### Mock Backend / Database
- JSON Server

### API Client
- Axios

### Server State Management
- TanStack Query

### Client State Management
- Redux Toolkit

### Forms
- Formik

### Validation
- Yup

### Styling
- Tailwind CSS

### Testing
- Vitest

### CI/CD Later
- GitHub Actions

---

## User Roles

### Guest
Unauthenticated user.

Can:
- browse properties
- search and filter listings
- view property details
- register or login

Cannot:
- save favorites
- send viewing requests
- access customer pages
- access admin dashboard

---

### Customer
Authenticated user.

Can:
- browse properties
- save/remove favorites
- send viewing/contact requests
- manage profile

Cannot:
- manage properties
- manage users
- access admin dashboard

---

### Admin
Authenticated admin user.

Can:
- manage properties
- create/edit/delete listings
- manage property status
- view customer inquiries
- update inquiry status
- manage users
- access admin dashboard

---

## Main Features

### Public Storefront
- home page
- property listing page
- property details page
- rent/sale filtering
- city search
- price filtering
- room filtering
- sorting by price or newest

### Authentication
- login
- register
- logout
- persisted session
- protected routes
- admin-only routes

### Customer Features
- favorites
- viewing/contact requests
- profile page
- inquiry history

### Admin Features
- admin dashboard
- property CRUD
- user management
- inquiry management
- property status updates

---

## Main Entities

The mock database will include:

- users
- properties
- favorites
- inquiries
- cities
- property types
