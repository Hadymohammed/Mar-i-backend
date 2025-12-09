# Mar'i Backend

Backend service for **I-Tube** or **Mar'i**, a simplified YouTube-style media platform.  
This backend provides the foundation for user management, authentication, channels, video handling, and supporting services.

---

## 📌 Overview

The I-Tube backend is built using **NestJS** with a clean modular structure.  
It integrates with PostgreSQL and Redis and is designed to support secure authentication, media processing, and scalable functionality.

This repository contains only the backend service.  
Frontend implementation will be handled separately.

---
## 🚀 Tech Stack

- **NestJS** (Node.js framework)  
- **TypeScript**  
- **PostgreSQL**  
- **Redis**  
- **Firebase**

---
## 🧩 Current Milestone

### **Milestone 1 — User Management & Authentication**

- Support user account creation using OTP-based signup

- Support OAuth login via Firebase (Google, etc.)

- Automatically link accounts when OAuth email matches existing user email

- Support multi-device login via session records

- Issue and rotate JWT access & refresh tokens

- Implement refresh token rotation and Redis-based blacklist

- Support logout from current device

- Support logout from all devices

- Support password reset using OTP

- Manage OTPs, cooldowns, and failed attempts using Redis