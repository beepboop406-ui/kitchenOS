# ANDO - Kitchen Operating System

## Project Title

**ANDO-KOS** — a Kitchen Operating System for restaurants and kitchens.

## Description

ANDO is a lightweight system that helps kitchen staff monitor the flow of food orders across stages in real time. The application visualizes orders as they move through **New → Cooking → Ready → Dispatched**, helping kitchens reduce delays and improve customer satisfaction.

---

## Tech Stack

### Backend

- **Framework:** Django (Django REST Framework)
- **Database:** SQLite (default; can be swapped for PostgreSQL/MySQL)
- **Purpose:** Exposes REST API endpoints for food items and orders, admin interface for managing data.

### Frontend

- **Framework:** React + Vite
- **Purpose:** Live dashboard UI that displays and updates orders in the browser.

---

## Installation

> These instructions assume a standard project layout with a `backend/` and `frontend/` folder. Adjust paths if your structure differs.

### 1. Backend (Django)

```bash
# go to backend folder
cd kitchenOS

# install python dependencies
pip install -r requirements.txt

# apply database migrations
python manage.py migrate

# run development server
python manage.py runserver
```

Backend API base: `http://127.0.0.1:8000/`

### 2. Frontend (React + Vite)

```bash
# go to frontend folder
cd kitchenOS-ui

# install node dependencies
npm install

# run dev server
npm run dev
```

Frontend app: `http://127.0.0.1:5173/`

---

## Usage

1. Open `http://127.0.0.1:5173/` in your browser.

2. The Kitchen Dashboard shows **order statuses**:

   - 🕑 New Orders
   - 🍳 Cooking
   - ✅ Ready
   - 🚚 Dispatched

3. Orders move automatically between stages when updated from the backend.

4. The **Reset** button moves all orders back to the New order section.

5. Access Django Admin at `http://127.0.0.1:8000/admin/` to manage food items and orders.

---

## API Endpoints

- `GET/POST /foods/` → List or create food items
- `GET/POST /orders/` → List or create orders
- `PUT/PATCH /orders/<id>/` → Update an order’s status or details
- `POST /reset/` → Reset all orders

## Features

- Live kitchen dashboard to track orders by status
- Django REST API for managing food items and orders
- Reset functionality to reset order natures.
- Admin interface for food and order management

---

## Contributing

## This project is primarily a learning / demo project.

## License

This repository is provided for educational purposes. Add a formal license (e.g. MIT) if you plan to open-source it.

---

## Project structure (example)

```
project-root/
├─ kitchenOS/                     # Django backend
│  ├─ manage.py           # Python dependencies
│  ├─ db.sqlite3                   # SQLite database (local dev)
│  ├─ kitchenOS/                  # Main Django project settings
│  │  ├─ __init__.py
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  ├─ wsgi.py
│  │  └─ asgi.py
│  ├─ menu/                     # Django app for orders
│  │  ├─ __init__.py
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ views.py
│  │  ├─ urls.py
│  │  └─ migrations/
│  │     └─ __init__.py

├─ kitchenOS-ui/                  # React frontend (Vite)
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ index.html
│  ├─ public/
│  │  └─ vite.svg
│  └─ src/
│     ├─ App.jsx
│     ├─ OrdersList.jsx
│     ├─ App.css
│     ├─ index.css
│     └─ main.jsx                # Axios setup
│
├─ .gitignore
├─ README.md                      # Documentation


```
