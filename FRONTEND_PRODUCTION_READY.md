# 🚀 E-CMS Frontend Integration - Production Deployment Ready

## ✅ Backend Status: LIVE ON RENDER

**Your backend is now live and ready for integration!**

```
🌐 Production API URL: https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1
📊 Status: 🟢 LIVE
🗄️ Database: PostgreSQL (Render)
⏱️ Deployed: December 5, 2025
```

---

## 📋 Quick Integration Guide for Frontend Teams

### 1. **Update Your API Configuration**

Replace your local API URL with the production URL:

**Before (Development):**
```javascript
const API_URL = 'http://localhost:8000/api/v1';
```

**After (Production):**
```javascript
const API_URL = 'https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1';
```

### 2. **Update Environment Variables**

Create/update your `.env.production` file:

```env
# API Configuration
VITE_API_URL=https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1
REACT_APP_API_URL=https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1
NEXT_PUBLIC_API_URL=https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1

# Timeouts & Retries
VITE_REQUEST_TIMEOUT=30000
VITE_MAX_RETRIES=3
```

### 3. **Framework-Specific Setup**

#### React/Vite
```javascript
// src/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});
```

#### Next.js
```javascript
// lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1';

export const fetcher = async (url: string) => {
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.json();
};
```

#### Vue 3
```javascript
// src/api/config.ts
export const API_URL = import.meta.env.VITE_API_URL || 'https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000
});
```

---

## 🔗 Available Endpoints

### Authentication Endpoints

All endpoints are available at: `https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/auth/register` | Create new account |
| `POST` | `/auth/login` | User login |
| `POST` | `/auth/logout` | User logout |
| `POST` | `/auth/token/refresh` | Refresh access token |
| `POST` | `/auth/email/verify/send` | Send email verification OTP |
| `POST` | `/auth/email/verify/confirm` | Confirm email with OTP |
| `POST` | `/auth/password/forgot` | Request password reset |
| `POST` | `/auth/password/reset` | Reset password with OTP |
| `GET` | `/auth/profile` | Get user profile |
| `PUT` | `/auth/profile` | Update user profile |

---

## 🧪 Test Your Connection

### Using cURL

```bash
# Test the API is online
curl https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1/auth/login -X POST

# Or with data
curl -X POST https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Using JavaScript/Axios

```javascript
import axios from 'axios';

const API_URL = 'https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1';

const testConnection = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    console.log('✅ Connected!', response.data);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();
```

---

## 🔐 Security Notes

### HTTPS
✅ Your production URL uses HTTPS (secure)
- All traffic is encrypted
- SSL certificate is automatic (managed by Render)

### CORS Configuration
✅ CORS is enabled for frontend integration
- Your frontend can make requests from any domain
- Add your frontend domain for stricter security (optional)

### Authentication
✅ JWT tokens are used for authentication
- Tokens expire after 24 hours
- Refresh tokens last 7 days
- Store tokens securely (HttpOnly cookies recommended)

---

## 📦 Production Deployment Checklist

- [ ] ✅ Update API_URL in your frontend `.env.production`
- [ ] ✅ Test login endpoint
- [ ] ✅ Test register endpoint
- [ ] ✅ Test protected routes with JWT token
- [ ] ✅ Test email verification flow
- [ ] ✅ Test password reset flow
- [ ] ✅ Configure error handling for network issues
- [ ] ✅ Add loading states to login/register forms
- [ ] ✅ Add error messages for failed requests
- [ ] ✅ Test on multiple browsers
- [ ] ✅ Test on mobile devices

---

## 🚨 Common Issues & Solutions

### Issue: CORS Error
```
Access to XMLHttpRequest at 'https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:** CORS is already enabled on the backend. Ensure you're sending the correct headers:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### Issue: 401 Unauthorized
```json
{"detail": "Unauthorized"}
```

**Solution:** Make sure your JWT token is being sent correctly:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Issue: 400 Bad Request
```json
{"error": "Invalid credentials"}
```

**Solution:** Verify all required fields are provided:
- Register: `username`, `email`, `password`
- Login: `username`, `password`

### Issue: Token Expired
```json
{"detail": "Token is invalid or expired"}
```

**Solution:** Use the refresh endpoint to get a new token:
```javascript
POST /auth/token/refresh
{
  "refresh": "your_refresh_token"
}
```

---

## 🔄 Axios Interceptor Setup (Recommended)

```javascript
// src/api/interceptors.ts
import axios from 'axios';

const API_URL = 'https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

// Request interceptor - Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/token/refresh`, {
          refresh: refreshToken
        });
        
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 📱 Response Examples

### Successful Login (200 OK)
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "username": ["This field may not be blank."],
  "email": ["Enter a valid email address."],
  "password": ["This field may not be blank."]
}
```

### Unauthorized (401)
```json
{
  "detail": "Invalid credentials"
}
```

---

## 🎯 Next Steps for Frontend Team

1. **Update Configuration**
   - Replace local URLs with: `https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1`

2. **Implement Authentication**
   - Setup login/register pages
   - Store JWT tokens securely
   - Implement token refresh logic

3. **Add Protected Routes**
   - Check for valid token before rendering pages
   - Redirect unauthenticated users to login

4. **Test Endpoints**
   - Use Postman or cURL to test all endpoints
   - Verify error handling

5. **Deploy Frontend**
   - Deploy your frontend to Vercel, Netlify, or similar
   - Ensure API_URL points to production backend

---

## 📚 Reference Documentation

Complete API documentation files available in the repository:
- `FRONTEND_API_INTEGRATION_GUIDE.md` - Full API reference
- `FRONTEND_QUICK_START_GUIDE.md` - Quick setup guide
- `API_TESTING_EXAMPLES.md` - Testing guide

---

## 🆘 Support

**Backend Status:** https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1

**Issues?** Check the logs:
1. Go to Render dashboard
2. Select your service
3. Check the **Logs** tab for errors

---

## 📊 Production Environment Variables (Backend)

These are set in Render dashboard:

| Variable | Value |
|----------|-------|
| `SECRET_KEY` | [Generated] |
| `DEBUG` | `false` |
| `ALLOWED_HOSTS` | `e-cms-nuitinfo2025-teamfsuy1.onrender.com,localhost` |
| `DB_NAME` | `ecms_db_pns4` |
| `DB_USER` | `ecms_user` |
| `DB_PASSWORD` | [Secure] |
| `DB_HOST` | `dpg-d4p65gmuk2gs73d61fk0-a` |
| `DB_PORT` | `5432` |

---

**Status:** 🟢 **PRODUCTION READY**  
**API URL:** https://e-cms-nuitinfo2025-teamfsuy1.onrender.com/api/v1  
**Last Updated:** December 5, 2025  
**Deployment Time:** ~2 minutes  

**Ready to integrate! 🚀**
