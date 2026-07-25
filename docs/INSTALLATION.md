# Installation & Local Setup Guide

This document outlines step-by-step instructions to set up, configure, and execute the **Inventory Management System** on your local machine.

---

## 🛠️ System Prerequisites

Ensure you have the following installed:
1. **Python 3.9+**: Check with `python --version`
2. **Git**: Check with `git --version`
3. **Web Browser**: Chrome, Firefox, Edge, or Safari

---

## 📥 Step 1: Clone or Extract Repository

```bash
git clone https://github.com/your-username/Inventory_Management_System.git
cd Inventory_Management_System
```

---

## 🐍 Step 2: Backend Setup (Python Flask)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a Python Virtual Environment:
   - **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables (Optional):
   Create a `.env` file inside `backend/`:
   ```ini
   FLASK_DEBUG=True
   PORT=5000
   SECRET_KEY=inventory_mgmt_secret_key_2026
   FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
   ```

5. Run the Flask Server:
   ```bash
   python app.py
   ```
   Output:
   ```text
   Starting Inventory Management System Server on port 5000...
   * Running on http://0.0.0.0:5000
   ```

---

## ☁️ Step 3: Firebase Configuration (Optional for Cloud Mode)

The application features a built-in **Local Storage Engine** so you can run and test everything out-of-the-box immediately!

To link live Google Firebase Cloud Firestore & Authentication:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named **Inventory Management System**.
3. Enable **Firebase Authentication** (Email/Password sign-in method).
4. Create a **Cloud Firestore Database** in test mode.
5. Go to **Project Settings > Service Accounts** and click **Generate New Private Key**. Save the downloaded JSON file as `backend/serviceAccountKey.json`.
6. Go to **Project Settings > General > Web Apps** to get your SDK configuration snippet. Update `firebaseConfig` inside `frontend/js/firebase.js`.

---

## 🌐 Step 4: Accessing the Web Application

You can launch the frontend application in one of two ways:

### Option A: Via Flask Backend Server (Recommended)
With the backend server running, navigate to:
```text
http://localhost:5000
```

### Option B: Independent Static Server
Serve the `frontend` directory using any HTTP server:
```bash
# From root directory
python -m http.server 8000 --directory frontend
```
Navigate to `http://localhost:8000`.

---

## 🧪 Testing the Application

1. **Register User**: Click **Register Account**, fill in credentials, and click **Create Account**.
2. **Login**: Sign in with registered credentials.
3. **Manage Products**:
   - Navigate to **Products**.
   - Click **Add Product**, fill details (e.g. Price: 99.99, Quantity: 3 to trigger low stock warning).
   - Test live search, category filter, and sorting.
   - Edit or delete products.
4. **Dashboard**: Observe total inventory value, total stock count, Chart.js stock distribution chart, and category doughnut chart update instantly.
5. **Reports**: Go to **Reports**, export CSV data, or trigger printable PDF summary.
