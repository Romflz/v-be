import { pgTable, serial, text, timestamp, boolean, index, uniqueIndex, integer, pgEnum } from 'drizzle-orm/pg-core'

// ============================================
// ENUMS - Define the types and statuses used throughout the system
// ============================================

// User role: Distinguishes between service requesters (clients) and service providers
export const userRoleEnum = pgEnum('user_role', ['client', 'provider'])

// Provider account status
export const businessStatusEnum = pgEnum('business_status', ['active', 'inactive', 'suspended'])

// User verification status for trust and safety
export const userVerificationStatusEnum = pgEnum('user_verification_status', ['pending', 'verified', 'unverified'])

// User profile visibility settings
export const userVisibilityEnum = pgEnum('user_visibility', ['public', 'private', 'anonymous'])

// Type of provider account
export const providerTypeEnum = pgEnum('provider_type', ['individual', 'agency', 'business'])

// Review type to distinguish who reviewed whom
export const reviewTypeEnum = pgEnum('review_type', ['client_to_provider', 'provider_to_client'])

// ============================================
// CORE USER SYSTEM
// ============================================

/**
 * Base users table - stores authentication and core user data
 * Every user (client or provider) has an entry here
 * Integrates with Firebase Auth for authentication
 */
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),

    // Firebase Authentication
    uid: text('uid').notNull().unique(), // Firebase UID - stable identifier
    signInProvider: text('sign_in_provider'), // google, email, apple, etc.
    tenant: text('tenant'), // For multi-tenant support if needed

    // Basic Profile Information
    name: text('name').notNull(), // Display name (fallback provided by controller)
    picture: text('picture'), // Profile picture URL

    // Contact Information
    email: text('email').unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    mobileNumberPrefix: text('mobile_number_prefix'), // Country code
    mobileNumber: text('mobile_number'),
    mobileNumberVerified: boolean('mobile_number_verified').notNull().default(false),

    // Account Type and Status
    role: userRoleEnum('role').notNull().default('client'),
    verificationStatus: userVerificationStatusEnum('verification_status').default('pending'),

    // Activity Tracking
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_uid_idx').on(table.uid),
    uniqueIndex('users_email_uq').on(table.email),
    index('users_tenant_idx').on(table.tenant),
    index('users_role_idx').on(table.role),
    index('users_last_login_idx').on(table.lastLoginAt),
    index('users_created_at_idx').on(table.createdAt),
  ]
)

// ============================================
// USER PROFILES
// ============================================

/**
 * Client profiles - For users who post jobs and hire providers
 * Extends the base user with client-specific information
 */
export const clients = pgTable(
  'clients',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Personal Information
    firstName: text('first_name').notNull().default(''),
    lastName: text('last_name').notNull().default(''),

    // Profile Details
    bio: text('bio'),
    company: text('company'), // Company they represent (if applicable)
    location: text('location'),
    timezone: text('timezone'),

    // Statistics (can be computed but cached for performance)
    totalJobsPosted: integer('total_jobs_posted').default(0),
    totalSpent: integer('total_spent').default(0), // In cents to avoid decimal issues
    avgRating: integer('avg_rating').default(0), // Stored as integer (e.g., 45 = 4.5 stars)
    totalReviews: integer('total_reviews').default(0),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('clients_user_id_uq').on(table.userId), index('clients_created_at_idx').on(table.createdAt)]
)

/**
 * Provider profiles - For users who offer services
 * Can be individuals, agencies, or businesses
 */
export const providers = pgTable(
  'providers',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Business Information
    businessName: text('business_name').notNull(), // Display name for the provider/business
    tagline: text('tagline'), // Short description/slogan
    description: text('description'), // Detailed description of services
    providerType: providerTypeEnum('provider_type').default('individual'),

    // Contact & Online Presence
    website: text('website'),
    contactEmail: text('contact_email'),
    linkedIn: text('linkedin'),
    portfolio: text('portfolio'), // Portfolio URL

    // Location & Availability
    location: text('location'),
    timezone: text('timezone'),
    isAvailable: boolean('is_available').default(true),

    // Pricing Information
    hourlyRate: integer('hourly_rate'), // In cents
    currency: text('currency').default('USD'),

    // Statistics (cached for performance)
    totalJobs: integer('total_jobs').default(0),
    completionRate: integer('completion_rate').default(100), // Percentage
    avgRating: integer('avg_rating').default(0), // Stored as integer (e.g., 45 = 4.5 stars)
    totalReviews: integer('total_reviews').default(0),

    // Account Status
    status: businessStatusEnum('status').default('active'),
    verifiedAt: timestamp('verified_at'), // When the provider was verified

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('providers_user_id_uq').on(table.userId),
    index('providers_status_idx').on(table.status),
    index('providers_is_available_idx').on(table.isAvailable),
    index('providers_avg_rating_idx').on(table.avgRating),
    index('providers_created_at_idx').on(table.createdAt),
  ]
)

// ============================================
// REVIEW SYSTEM
// ============================================

/**
 * Reviews table - Bidirectional review system
 * Both clients and providers can review each other after a job/contract
 * The reviewType field indicates the direction of the review
 */
export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),

    // Review Participants
    reviewerId: integer('reviewer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // Who wrote the review
    revieweeId: integer('reviewee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // Who is being reviewed

    // Review Type - Determines the context and what's being reviewed
    reviewType: reviewTypeEnum('review_type').notNull(),

    // Job/Contract Reference (optional - for context)
    jobId: integer('job_id'), // Reference to jobs table (not defined here)
    contractId: integer('contract_id'), // Reference to contracts table (not defined here)

    // Review Content
    rating: integer('rating').notNull(), // 1-5 scale, stored as integer
    title: text('title'), // Review headline
    comment: text('comment').notNull(), // Detailed review text

    // Specific Rating Categories (optional, for more detailed feedback)
    communicationRating: integer('communication_rating'), // 1-5
    qualityRating: integer('quality_rating'), // 1-5
    timelinessRating: integer('timeliness_rating'), // 1-5
    professionalismRating: integer('professionalism_rating'), // 1-5

    // Review Metadata
    isPublic: boolean('is_public').default(true), // Whether the review is publicly visible
    isVerified: boolean('is_verified').default(false), // Whether the job/contract was completed

    // Response from reviewee (optional)
    response: text('response'),
    responseAt: timestamp('response_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Ensure one review per reviewer-reviewee-job combination
    uniqueIndex('reviews_unique_per_job').on(table.reviewerId, table.revieweeId, table.jobId),
    index('reviews_reviewer_idx').on(table.reviewerId),
    index('reviews_reviewee_idx').on(table.revieweeId),
    index('reviews_type_idx').on(table.reviewType),
    index('reviews_rating_idx').on(table.rating),
    index('reviews_created_at_idx').on(table.createdAt),
  ]
)

// ============================================
// USER PREFERENCES & SETTINGS
// ============================================

/**
 * User preferences table - Stores user-specific settings
 * Applies to both clients and providers
 */
export const userPreferences = pgTable(
  'user_preferences',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Privacy Settings
    visibility: userVisibilityEnum('visibility').default('public'),
    showEmail: boolean('show_email').default(false),
    showPhone: boolean('show_phone').default(false),

    // Notification Preferences
    emailNotifications: boolean('email_notifications').default(true),
    smsNotifications: boolean('sms_notifications').default(false),
    pushNotifications: boolean('push_notifications').default(true),

    // Notification Types
    notifyNewMessages: boolean('notify_new_messages').default(true),
    notifyJobUpdates: boolean('notify_job_updates').default(true),
    notifyReviews: boolean('notify_reviews').default(true),
    notifyPayments: boolean('notify_payments').default(true),

    // Display Preferences
    language: text('language').default('en'),
    currency: text('currency').default('USD'),
    theme: text('theme').default('light'), // light, dark, auto

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('user_preferences_user_id_uq').on(table.userId)]
)

// ============================================
// TYPE EXPORTS
// ============================================

// User types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// Client types
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert

// Provider types (renamed from Business for clarity)
export type Provider = typeof providers.$inferSelect
export type NewProvider = typeof providers.$inferInsert

// Review types
export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert

// User preferences types
export type UserPreferences = typeof userPreferences.$inferSelect
export type NewUserPreferences = typeof userPreferences.$inferInsert
