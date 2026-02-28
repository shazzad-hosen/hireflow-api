# 🚀 HireFlow – Job Application Tracker API

## Production-Ready Job Application Tracker Backend

HireFlow is a secure and scalable backend API for managing job applications.
It is built with **Node.js, Express, and MongoDB**, featuring production-grade authentication, multi-device session handling, and structured application workflows.

This project demonstrates strong backend architecture, security practices, and real-world SaaS design patterns.

## 🧠 Why This Project?

Most portfolio projects stop at CRUD.

HireFlow goes further by implementing:

- Rotating JWT refresh tokens

- Hashed refresh token storage

- Multi-device session management

- Session revocation

- TTL-based automatic cleanup

- Clean service-layer architecture

- This reflects real-world backend engineering standards.

## 🏗 Architecture Overview
```
Client
  │
  ├── Access Token (Authorization Header)
  └── Refresh Token (HTTP-only Cookie)
           │
           ▼
Express API
  ├── Controllers
  ├── Services (Business Logic)
  ├── Middlewares (Auth, Error Handling)
  ├── Models (Mongoose)
  └── Utilities
           │
           ▼
MongoDB (Atlas)
```

## 🔐 Authentication System
### ✔ Access + Refresh Token Strategy

- Short-lived Access Tokens

- Rotating Refresh Tokens

- HTTP-only Secure Cookies

- Token reuse detection

### ✔ Security Enhancements

- SHA-256 hashed refresh tokens in database

- TTL index for automatic token expiration

- Multi-device Session support

- Session listing & revocation

- Proper error handling

## 🌟 Features
### 🔐 Auth & Sessions

- User Registration & Login

- Refresh Token Rotation

- Multi-device Login Support

- View Active Sessions

- Revoke Specific Session

- Secure Logout (per device)

### 📂 Application Management

- Create, Read, Update, Delete Applications

- Status-based Workflow (e.g., Applied, Interview, Offer, Rejected)

- Filtering & Search applications

- Applications Analytics Endpoint

### 🛡 Infrastructure

- Production-grade error handling

- Modular architecture (controllers, services, middlewares)

- Rate limiting

- Environment-based configuration

- MongoDB Atlas integration

### 🏗 Tech Stack

- **Backend:** Node.js + Express

- **Database:** MongoDB (Mongoose)

- **Authentication:** JWT

- **Security:** HTTP-only cookies, hashed refresh tokens

### 🗄 Database Optimization & Indexing

HireFlow implements optimized MongoDB indexing for performance and data integrity.

**Performance Indexes**

- Compound index on { user, status } for fast status filtering

- Compound index on { user, createdAt } for sorted queries

- Compound index on { user, appliedAt } for timeline-based sorting

- These ensure efficient queries in a multi-tenant environment.


## 📁 Project Structure
```
hireflow-api/
│
├── src/
|   ├── config/
│   ├── controllers/
│   ├── events/
│   ├── listeners/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   ├── app.js
│
├── server.js
├── package.json
```
Separation of concerns is strictly maintained:

- Controllers → Handle HTTP layer

- Services → Contain business logic

- Middlewares → Authentication & validation

- Models → Database schema definitions

### 🔑 Environment Variables

> Create a .env file in the root:
```js
PORT=3000

NODE_ENV=development

MONGO_DB_URL=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d

CLIENT_URL=https://your-frontend-domain.com
```

### 📦 Installation
```bash
git clone https://github.com/shazzad-hosen/hireflow-api.git
cd hireflow-api/
npm install
```
#### Run locally:
```bash
npm run dev
```

#### Production:
```bash
npm start
```

## 📡 API Endpoints
#### Auth Routes
| **Method** | **Endpoint** | **Description** |
|----------|-------------|-----------------|
| **POST** | `/api/auth/register` | Register user |
| **POST** | `/api/auth/login` | Login |
| **POST** | `/api/auth/refresh` | Refresh access token |
| **POST** | `/api/auth/logout` | Logout |
| **GET** | `/api/auth/sessions` | List active sessions |
| **DELETE** | `/api/auth/sessions/:id` | Revoke session |

### Application Routes (Protected)
| **Method** | **Endpoint** | **Description** |
|----------|-------------|-----------------|
| **POST** | `/api/applications` | Create application |
| **GET** | `/api/applications` | Get all applications |
| **GET** | `/api/applications/:id` | Get single applications |
| **PATCH** | `/api/applications/:id` | Update application |
| **DELETE** | `/api/applications/:id` | Delete application |
| **GET** | `/api/applications/analytics` | Application analytics |

### 🌐 Live API (Test)

Base URL: 

> ⚠️ This is a **test environment**.  
> Data may be reset at any time.

#### Example: Register

```http
POST 
```
```json
{
  "name": "John Doe",
  "email": "johndoe2001@gmail.com",
  "password": "1234567i"
}
```

## 🚀 Deployment

This API is deployed-ready for:

- Render

- Railway

- Fly.io

Production configuration includes:

- Secure cookies

- Environment-based secrets

- MongoDB Atlas integration

- Proper CORS handling

## 📈 What This Project Demonstrates

- Real-world authentication architecture

- Clean service-based backend structure

- Security-first development

- Scalable session handling

- SaaS-style backend design

## 👨‍💻 Author

### Shazzad Hosen Zisan
 Backend Developer

Focused on secure and scalable API architecture.