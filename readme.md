

# A11 Server - Backend for RateWise Service Review Platform 🚀

## 📝 Overview

This is the backend server for the **RateWise** service review platform.  
It provides RESTful APIs to manage services, user reviews, and user roles, with secure Firebase token authentication.  
The backend uses **Node.js**, **Express.js**, **MongoDB**, and **Firebase Admin SDK** for authentication and database operations.

---

## 🔧 Technologies Used

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework for building APIs
- **MongoDB** – NoSQL database
- **Firebase Admin SDK** – Secure authentication and token verification
- **dotenv** – Environment variable management
- **cors** – Enable Cross-Origin Resource Sharing

---

## ⚙️ Getting Started – Run Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Rafi-Shariar/a11-server.git
cd a11-server
````

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup environment variables

* Create a `.env` file in the root directory.
* Add the following environment variable:

```env
FB_KEY=your-base64-encoded-firebase-service-account-json
```

> To generate the base64 encoded key, use this script snippet:

```js
const fs = require('fs');
const key = fs.readFileSync('./firebase_admin_serviceKey.json', 'utf8');
const base64 = Buffer.from(key).toString('base64');
console.log(base64);
```

Replace `your-base64-encoded-firebase-service-account-json` with the output string.

### 4️⃣ Start the server

```bash
nodemon npm start
```

By default, the server listens on **port 5000** (changeable in your code if needed).

---

## 📄 API Endpoints

### Services

| Method | Endpoint        | Description               |
| ------ | --------------- | ------------------------- |
| GET    | `/services`     | Get all services          |
| POST   | `/addservices`  | Add a new service         |
| GET    | `/services/:id` | Get service details by ID |
| DELETE | `/services/:id` | Delete a service by ID    |

### Reviews

| Method | Endpoint              | Description                   |
| ------ | --------------------- | ----------------------------- |
| GET    | `/reviews/:serviceId` | Get all reviews for a service |
| POST   | `/reviews`            | Add a review for a service    |
| PUT    | `/reviews/:id`        | Update a review by review ID  |
| DELETE | `/reviews/:id`        | Delete a review by review ID  |

### Users

| Method | Endpoint           | Description                     |
| ------ | ------------------ | ------------------------------- |
| GET    | `/users/:email`    | Get user info by email          |
| POST   | `/users`           | Add a new user                  |
| PUT    | `/users/admin/:id` | Promote a user to admin role    |
| GET    | `/admin/:email`    | Check if user is admin by email |

### Other

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| GET    | `/servicesCount` | Get total count of services |
| GET    | `/reviewCount`   | Get total count of reviews  |
| GET    | `/search/:text`  | Search services by text     |

---

## ⚠️ Notes

* Secure your Firebase service account JSON carefully.
* The Firebase Admin SDK is used for token verification to protect sensitive routes.
* Make sure MongoDB connection strings and credentials are handled securely if added.

---

> Developed by [Rafi Shariar](https://github.com/Rafi-Shariar)
> Backend for RateWise, a full stack service review platform



