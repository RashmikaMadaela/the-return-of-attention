/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...\n');

    // Admin user details
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      // Update existing user to admin
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'admin' },
      });
      console.log('✅ Updated existing user to admin role');
      console.log(`📧 Email: ${adminEmail}`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          emailVerified: new Date(), // Auto-verify admin
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log(`👤 Name: ${adminName}`);
      console.log(`\n⚠️  IMPORTANT: Change the default password after first login!`);
    }

    console.log('\n🎉 Admin setup complete!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
