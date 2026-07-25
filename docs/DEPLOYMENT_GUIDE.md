# Cloud Deployment Guide

This guide describes how to deploy the **Inventory Management System** to production cloud platforms including **Firebase Hosting**, **Render**, and **Vercel**.

---

## 🌐 Option 1: Deploying Backend to Render & Frontend to Firebase Hosting

### Part A: Deploy Flask Backend to Render.com

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy production release"
   git push origin main
   ```
2. Log in to [Render Console](https://dashboard.render.com/).
3. Click **New + > Web Service**.
4. Connect your GitHub repository.
5. Configure deployment parameters:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Add Environment Variables:
   - `FLASK_DEBUG`: `False`
   - `SECRET_KEY`: `<Generate random secret string>`
   - `FIREBASE_CONFIG_JSON`: `<Paste serviceAccountKey.json content>`
7. Click **Create Web Service**. Note your live URL (e.g. `https://ims-backend.onrender.com`).

---

### Part B: Deploy Frontend to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Firebase Hosting in project root:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase Project.
   - Set public directory to: `frontend`
   - Configure as single-page app: `Yes`
4. Update `API_BASE_URL` in `frontend/js/app.js` to point to your live Render backend URL:
   ```javascript
   const API_BASE_URL = 'https://ims-backend.onrender.com/api';
   ```
5. Deploy:
   ```bash
   firebase deploy --only hosting
   ```
   Your app will be live at `https://<your-project-id>.web.app`.

---

## 🚀 Option 2: Full-Stack Deployment on Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Create `vercel.json` in root directory:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "backend/app.py", "use": "@vercel/python" },
       { "src": "frontend/**", "use": "@vercel/static" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "backend/app.py" },
       { "src": "/(.*)", "dest": "frontend/$1" }
     ]
   }
   ```
3. Run command:
   ```bash
   vercel --prod
   ```

---

## 🔒 Security Checklist for Production

- [x] Disable `FLASK_DEBUG` mode (`FLASK_DEBUG=False`).
- [x] Protect API keys using environment variables.
- [x] Enable Firestore Security Rules:
  ```text
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
