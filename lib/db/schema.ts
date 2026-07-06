import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  serial,
} from "drizzle-orm/pg-core"

/* ----------------------------- Better Auth ----------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

/* ------------------------------ App Tables ------------------------------ */

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  code: text("code"),
  instructor: text("instructor"),
  color: text("color").notNull().default("emerald"),
  credits: integer("credits").notNull().default(3),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  subjectId: integer("subjectId"),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  members: text("members").default(""),
  status: text("status").notNull().default("planning"),
  progress: integer("progress").notNull().default(0),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  projectId: integer("projectId").notNull(),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  subjectId: integer("subjectId").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  status: text("status").notNull().default("present"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  subjectId: integer("subjectId").notNull(),
  title: text("title").notNull(),
  score: integer("score").notNull().default(0),
  maxScore: integer("maxScore").notNull().default(100),
  weight: integer("weight").notNull().default(1),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  subjectId: integer("subjectId"),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull().default(""),
  type: text("type").notNull().default("link"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
