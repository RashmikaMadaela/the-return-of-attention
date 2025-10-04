# Admin System Documentation

## Overview
The Return of Attention admin system provides comprehensive management tools for administrators to oversee users, sessions, stages, and system data. This Phase 5 implementation includes 9 powerful admin APIs with a modern testing interface.

## Quick Start Guide

### 1. Access Admin Panel
- Visit `/admin-login` to access the admin authentication page
- You can either login with existing credentials or create a new admin account

### 2. Create Admin Account (First Time)
- Click "Register" tab on the admin login page
- Fill in the form with:
  - **Full Name**: Your admin name
  - **Email**: Your admin email address
  - **Password**: A secure password
  - **Role**: Choose from `moderator`, `admin`, or `super_admin`
  - **Registration Key**: Use `admin-registration-2024` (default key)

### 3. Login to Admin Panel
- Use your created credentials to login
- Upon successful login, you'll see the admin dashboard with your profile info
- Click "Open API Testing Suite" to access the comprehensive testing interface

### 4. Test Admin APIs
- The testing interface provides access to all 9 admin APIs
- Each API has configuration forms for easy parameter input
- Results are displayed in a terminal-style interface with timestamps
- Authentication status is shown at the top of the testing page

## Admin APIs Available

### Authentication APIs
1. **POST /api/admin/auth/register** - Create new admin accounts
2. **POST /api/admin/auth/login** - Authenticate admin users

### Management APIs
3. **GET /api/admin/users** - List all users with pagination
4. **POST /api/admin/users/manage** - Manage user accounts (disable/enable/delete/reset)
5. **GET /api/admin/stats** - Get comprehensive system statistics
6. **GET /api/admin/sessions** - List user sessions with filtering
7. **POST /api/admin/sessions/manage** - Manage user sessions
8. **POST /api/admin/stages/manage** - Control user stage progression
9. **POST /api/admin/data/clear** - Clear system data with safety measures

## Features

### 🔐 Security Features
- Role-based access control (moderator, admin, super_admin)
- Session-based authentication
- Registration key protection
- Comprehensive audit logging
- SQL injection protection
- Input validation and sanitization

### 📊 Dashboard Features
- User management with bulk operations
- System statistics and analytics
- Session monitoring and control
- Stage progression management
- Data management with safety confirmations

### 🛠️ Testing Interface
- Modern, responsive UI with gradient designs
- Terminal-style result display
- Real-time API testing
- Parameter configuration forms
- Authentication status indicators
- Admin profile information display

### 🔒 Data Safety
- Confirmation codes required for destructive operations
- Transaction-based operations for data integrity
- Comprehensive error handling
- Audit trail for all admin actions

## Admin Roles

### Moderator
- Basic user management
- View system statistics
- Monitor sessions

### Admin
- Full user management including deletion
- Session management and control
- Stage progression control
- Limited data management

### Super Admin
- All admin capabilities
- Full data management including system-wide clearing
- User role modification
- System configuration access

## API Usage Examples

### Register New Admin
```javascript
POST /api/admin/auth/register
{
  "email": "newadmin@example.com",
  "password": "SecurePassword123!",
  "name": "New Admin",
  "role": "admin",
  "registrationKey": "admin-registration-2024"
}
```

### Login Admin
```javascript
POST /api/admin/auth/login
{
  "email": "admin@example.com",
  "password": "YourPassword123!"
}
```

### Get System Statistics
```javascript
GET /api/admin/stats
Authorization: Bearer <your-admin-token>
```

### Manage User Account
```javascript
POST /api/admin/users/manage
{
  "userId": "user-id-here",
  "action": "disable",
  "reason": "Policy violation"
}
```

## Navigation

The admin system is accessible through multiple entry points:

1. **Navigation Bar**: Click the "🛡️ Admin" link in the top navigation
2. **Direct URL**: Visit `/admin-login` directly
3. **Testing Interface**: Access `/admin-apis-testing` (redirects to login if not authenticated)

## Security Notes

- Always use strong passwords for admin accounts
- Keep registration keys secure and change them periodically
- Monitor audit logs for suspicious activity
- Use appropriate role assignments based on user responsibilities
- Regularly review and clean up unused admin accounts

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check email/password combination
2. **Registration Key Invalid**: Verify the registration key is correct
3. **Access Denied**: Ensure your admin role has sufficient permissions
4. **API Errors**: Check the terminal-style results for detailed error messages

### Support

For technical support or questions about the admin system, refer to the comprehensive API documentation or check the browser console for detailed error messages.

---

*This admin system is part of Phase 5 implementation for The Return of Attention platform.*