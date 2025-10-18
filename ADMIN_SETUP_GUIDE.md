# Admin User Setup Guide

## Problem Fixed
The admin authentication system was trying to access a non-existent `AdminUser` table. The system has been updated to use the `User.role` field from the User table instead.

## Files Fixed
1. ✅ `src/lib/admin-auth.ts` - Updated to use User.role instead of AdminUser table
2. ✅ `src/app/api/admin/users/manage/route.ts` - Removed AdminUser references
3. ✅ Created admin setup scripts

## How to Create an Admin User

### Method 1: Using SQL (Recommended - Fastest)

1. **Sign up a regular user** through your application's signup page
2. **Run this SQL** in your database (Supabase SQL Editor, pgAdmin, or any SQL client):

```sql
UPDATE users 
SET role = 'admin', 
    "emailVerified" = NOW(),
    "isActive" = true
WHERE email = 'your-email@example.com';
```

Replace `'your-email@example.com'` with the email you used to sign up.

3. **Verify** the admin was created:

```sql
SELECT id, email, name, role, "isActive", "emailVerified"
FROM users
WHERE role = 'admin';
```

### Method 2: Using the TypeScript Script

1. **Install dependencies** (if not already installed):
```bash
npm install bcryptjs
npm install -D @types/bcryptjs tsx
```

2. **Set environment variables** (optional):
```bash
# Windows PowerShell
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="YourSecurePassword123!"
$env:ADMIN_NAME="Admin User"

# Or use defaults: admin@example.com / Admin@123
```

3. **Run the script**:
```bash
npx tsx scripts/create-admin.ts
```

### Method 3: Manual Database Insert

If you prefer to manually insert, you'll need to:
1. Hash your password using bcrypt
2. Insert directly into the users table with `role = 'admin'`

## Testing Admin Access

1. **Log out** if you're currently logged in
2. **Sign in** with your admin user credentials
3. **Navigate** to `/admin/user-management`
4. You should now see the admin dashboard with user management features

## Admin Permissions

All users with `role = 'admin'` have full access to:
- ✅ User Management (view, disable, delete users)
- ✅ Reset User Progress
- ✅ System Monitoring
- ✅ Analytics Access
- ✅ Session Management

## Troubleshooting

### "Admin authentication required" error
- Make sure your user's `role` field is set to `'admin'`
- Verify you're logged in with the admin account
- Check that `isActive = true` in the database

### "Cannot read properties of undefined (reading 'findUnique')"
- This error is now fixed in the updated code
- Make sure you've pulled the latest changes
- Restart your dev server: `npm run dev`

### Can't access admin pages
1. Check database connection is working
2. Verify admin user exists:
   ```sql
   SELECT * FROM users WHERE role = 'admin';
   ```
3. Clear cookies and log in again
4. Check browser console for errors

## Security Notes

⚠️ **Important:**
- Change default passwords immediately
- Use strong passwords for admin accounts
- Don't share admin credentials
- Consider implementing 2FA for admin accounts (future enhancement)
- Regularly audit admin actions

## Next Steps

After creating your admin user:
1. ✅ Test login with admin credentials
2. ✅ Access `/admin/user-management` page
3. ✅ Test search, filter, and sort functions
4. ✅ Test user management actions (be careful with delete!)
5. ✅ Change your admin password to something secure

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the server console/terminal for backend errors
3. Verify database connection is working
4. Ensure Prisma client is generated: `npx prisma generate`
5. Restart the dev server

---

**Status**: ✅ Fixed and Ready to Use  
**Last Updated**: October 18, 2025
