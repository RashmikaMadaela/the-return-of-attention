import { z } from 'zod'

// User profile validation schemas
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
  email: z.string().email('Invalid email address'),
  image: z.string().url('Invalid image URL').optional(),
})

// Personal information validation schema
export const personalInfoSchema = z.object({
  age: z.number()
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Please select a valid gender option'
  }),
  nationality: z.string()
    .min(2, 'Nationality must be at least 2 characters')
    .max(100, 'Nationality cannot exceed 100 characters'),
  country: z.string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country cannot exceed 100 characters'),
})

// User preferences validation schema (for future use)
export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  timeZone: z.string().max(50, 'Time zone cannot exceed 50 characters').optional(),
  language: z.string().max(10, 'Language code cannot exceed 10 characters').default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
})

// Password change validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Account deletion validation schema
export const deleteAccountSchema = z.object({
  password: z.string().min(8, 'Password is required to delete account'),
  confirmation: z.literal('DELETE', {
    message: 'Please type "DELETE" to confirm account deletion'
  }),
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
})

// Update profile validation (partial updates allowed)
export const updateProfileSchema = userProfileSchema.partial()

// Update personal info validation (partial updates allowed)
export const updatePersonalInfoSchema = personalInfoSchema.partial()

// Response types for TypeScript
export type UserProfileData = z.infer<typeof userProfileSchema>
export type PersonalInfoData = z.infer<typeof personalInfoSchema>
export type UserPreferencesData = z.infer<typeof userPreferencesSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>
export type DeleteAccountData = z.infer<typeof deleteAccountSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type UpdatePersonalInfoData = z.infer<typeof updatePersonalInfoSchema>