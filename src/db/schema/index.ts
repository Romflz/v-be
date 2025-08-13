import { pgTable, serial, text, timestamp, boolean, index, uniqueIndex, integer, pgEnum } from 'drizzle-orm/pg-core'

// Role enum: distinguishes standard end-user vs business account
export const userRoleEnum = pgEnum('user_role', ['user', 'business'])
export const businessStatusEnum = pgEnum('business_status', ['active', 'inactive'])
export const userVerificationStatusEnum = pgEnum('user_verification_status', ['pending', 'verified', 'unverified'])

// Users table extended to store Firebase identity information.
// uid is the stable Firebase UID and used as logical key.
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    uid: text('uid').notNull(),
    name: text('name').notNull(), // keep not null; controller will fallback when name missing
    email: text('email'),
    picture: text('picture'),
    emailVerified: boolean('email_verified').notNull().default(false),
    signInProvider: text('sign_in_provider'),
    tenant: text('tenant'),
    role: userRoleEnum('role').notNull().default('user'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    verificationStatus: userVerificationStatusEnum('verification_status').default('pending'),
  },
  (table) => [
    // Return an ARRAY of indexes instead of an object
    uniqueIndex('users_uid_idx').on(table.uid),
    uniqueIndex('users_email_uq').on(table.email),
    index('users_tenant_idx').on(table.tenant),
    index('users_last_login_idx').on(table.lastLoginAt),
    index('users_created_at_idx').on(table.createdAt),
  ]
)

// One-to-one business profile per user (only for users with role = business)
export const businesses = pgTable(
  'businesses',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull().default(''),
    description: text('description'),
    website: text('website'),
    contactEmail: text('contact_email'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    status: businessStatusEnum('status').default('active'),
  },
  (table) => [uniqueIndex('businesses_user_id_uq').on(table.userId)]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Business = typeof businesses.$inferSelect
export type NewBusiness = typeof businesses.$inferInsert
