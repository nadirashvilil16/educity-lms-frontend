# EduCity LMS — Frontend

React (Vite) client for the EduCity LMS. Consumes the API defined in
[educity-lms-backend/ARCHITECTURE.md](../educity-lms-backend/ARCHITECTURE.md).

## Setup

```
npm install
copy .env.example .env   # points VITE_API_URL at the backend
npm run dev
```

## Structure

```
src/
 ├── components/   shared UI (Navbar, ProtectedRoute, ...)
 ├── pages/        one folder per role: student/, teacher/, parent/, admin/
 ├── services/     axios instance + API calls
 ├── hooks/        useAuth, etc.
 ├── context/      AuthContext (current user + token)
 └── styles/       global css
```

## Branching

Work on `frontend/<task-name>` branches cut from `develop`, PR'd back into `develop`.

```
git checkout develop
git pull origin develop
git checkout -b frontend/task-name
```
