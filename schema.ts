import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean
} from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with role-based access control
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type", { length: 20 }).notNull().default("individual"), // individual, business, government
  subscriptionTier: varchar("subscription_tier", { length: 20 }).notNull().default("free"), // free, basic, premium, enterprise
  permissions: jsonb("permissions").default({}), // JSON object with specific permissions
  organizationName: varchar("organization_name"),
  organizationSize: varchar("organization_size"), // small, medium, large, enterprise
  sector: varchar("sector"), // technology, healthcare, finance, etc.
  country: varchar("country"),
  isActive: boolean("is_active").default(true),
  maxChatRequests: integer("max_chat_requests").default(50), // Monthly limit
  maxWorkflows: integer("max_workflows").default(5),
  maxAssistants: integer("max_assistants").default(10),
  hasAdminAccess: boolean("has_admin_access").default(false), // Only for internal admin users
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  userType: varchar("user_type").notNull(), // individual, business, government
  tier: varchar("tier").notNull(), // free, basic, premium, enterprise
  priceMonthly: integer("price_monthly").notNull(), // Price in cents
  priceYearly: integer("price_yearly").notNull(),
  features: jsonb("features").notNull(), // JSON array of features
  limits: jsonb("limits").notNull(), // JSON object with usage limits
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// User usage tracking
export const userUsage = pgTable("user_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: varchar("month").notNull(), // YYYY-MM format
  chatRequests: integer("chat_requests").default(0),
  workflowExecutions: integer("workflow_executions").default(0),
  assistantsUsed: integer("assistants_used").default(0),
  storageUsed: integer("storage_used").default(0), // In MB
  apiCalls: integer("api_calls").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserUsage = typeof userUsage.$inferSelect;
export type InsertUserUsage = typeof userUsage.$inferInsert;

// Chat Messages Schema
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  isUpgradePrompt: boolean("is_upgrade_prompt").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Generated Images Schema
export const generatedImages = pgTable("generated_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  prompt: text("prompt").notNull(),
  imageUrl: varchar("image_url"),
  status: varchar("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;

// Company Verification Schema
export const companyVerifications = pgTable("company_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  companyName: varchar("company_name").notNull(),
  website: varchar("website"),
  verificationData: jsonb("verification_data"),
  status: varchar("status").default("pending"), // pending, verified, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export type CompanyVerification = typeof companyVerifications.$inferSelect;
export type InsertCompanyVerification = typeof companyVerifications.$inferInsert;

// Atlas Operations Schema
export const atlasOperations = pgTable("atlas_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationType: varchar("operation_type").notNull(), // revenue_generation, client_acquisition, etc.
  parameters: jsonb("parameters"),
  result: jsonb("result"),
  status: varchar("status").default("pending"), // pending, completed, failed
  executionTime: integer("execution_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export type AtlasOperation = typeof atlasOperations.$inferSelect;
export type InsertAtlasOperation = typeof atlasOperations.$inferInsert;

// Atlas Improvements Schema
export const atlasImprovements = pgTable("atlas_improvements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  improvementType: varchar("improvement_type").notNull(),
  description: text("description"),
  implementation: jsonb("implementation"),
  performanceGain: decimal("performance_gain", { precision: 5, scale: 2 }),
  status: varchar("status").default("proposed"), // proposed, implemented, tested
  createdAt: timestamp("created_at").defaultNow(),
});

export type AtlasImprovement = typeof atlasImprovements.$inferSelect;
export type InsertAtlasImprovement = typeof atlasImprovements.$inferInsert;

// Atlas Internet Access Schema
export const atlasInternetAccess = pgTable("atlas_internet_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: varchar("url").notNull(),
  method: varchar("method").notNull(), // GET, POST, etc.
  headers: jsonb("headers"),
  body: jsonb("body"),
  response: jsonb("response"),
  statusCode: integer("status_code"),
  accessTime: timestamp("access_time").defaultNow(),
});

export type AtlasInternetAccess = typeof atlasInternetAccess.$inferSelect;
export type InsertAtlasInternetAccess = typeof atlasInternetAccess.$inferInsert;

// Atlas Code Generation Schema
export const atlasCodeGeneration = pgTable("atlas_code_generation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectType: varchar("project_type").notNull(),
  requirements: text("requirements"),
  generatedCode: text("generated_code"),
  language: varchar("language"),
  framework: varchar("framework"),
  status: varchar("status").default("pending"), // pending, completed, deployed
  createdAt: timestamp("created_at").defaultNow(),
});

export type AtlasCodeGeneration = typeof atlasCodeGeneration.$inferSelect;
export type InsertAtlasCodeGeneration = typeof atlasCodeGeneration.$inferInsert;

// Customer Intelligence Schema
export const customerInteractions = pgTable("customer_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  interactionType: varchar("interaction_type").notNull(), // view, purchase, click, search, etc.
  productCategory: varchar("product_category"),
  productId: varchar("product_id"),
  interactionData: jsonb("interaction_data"), // detailed interaction metadata
  timestamp: timestamp("timestamp").defaultNow(),
  sessionId: varchar("session_id"),
  deviceType: varchar("device_type"),
  location: varchar("location")
});

export const customerPreferences = pgTable("customer_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  preferenceCategory: varchar("preference_category").notNull(), // content_type, price_range, topics, etc.
  preferenceValue: varchar("preference_value").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }), // 0.0000 to 1.0000
  lastUpdated: timestamp("last_updated").defaultNow(),
  source: varchar("source") // algorithm, explicit, inferred
});

export const personalizedProducts = pgTable("personalized_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  productType: varchar("product_type").notNull(), // ebook, course, template, etc.
  productTitle: varchar("product_title").notNull(),
  productDescription: text("product_description"),
  content: text("content"),
  price: decimal("price", { precision: 10, scale: 2 }),
  estimatedRevenue: decimal("estimated_revenue", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status").default("draft") // draft, published, generating_revenue
});

// Digital Products Generation System
export const digitalProducts = pgTable("digital_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productType: varchar("product_type").notNull(), // ebook, pdf_course, video, template, app
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content"),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: varchar("category"), // business, tech, health, education, finance
  targetAudience: varchar("target_audience"),
  keywords: jsonb("keywords"),
  salesPages: jsonb("sales_pages"), // landing page content
  marketingMaterials: jsonb("marketing_materials"),
  generatedRevenue: decimal("generated_revenue", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  status: varchar("status").default("generating") // generating, published, marketing, selling
});

// Autonomous Content Creation Bots
export const contentBots = pgTable("content_bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botType: varchar("bot_type").notNull(), // ebook_bot, pdf_course_bot, youtube_bot, social_media_bot, template_bot, seo_optimizer_bot
  name: varchar("name").notNull(),
  specialization: varchar("specialization"), // specific niche or topic
  dailyProduction: integer("daily_production"), // content pieces per day
  revenue24h: decimal("revenue_24h", { precision: 10, scale: 2 }).default("0"),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  efficiency: decimal("efficiency", { precision: 5, scale: 2 }), // 0.00 to 100.00%
  status: varchar("status").default("active"), // active, paused, maintenance
  lastActive: timestamp("last_active").defaultNow(),
  productsCreated: integer("products_created").default(0)
});

// Revenue Tracking System
export const revenueStreams = pgTable("revenue_streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  streamType: varchar("stream_type").notNull(), // ebooks, courses, videos, templates, apps, consulting
  streamName: varchar("stream_name").notNull(),
  monthlyRevenue: decimal("monthly_revenue", { precision: 12, scale: 2 }).default("0"),
  projectedGrowth: decimal("projected_growth", { precision: 5, scale: 2 }), // percentage
  automationLevel: integer("automation_level"), // 1-100% automated
  roi: decimal("roi", { precision: 8, scale: 2 }), // return on investment
  activeProducts: integer("active_products").default(0),
  totalSales: integer("total_sales").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Funding Applications Tracker
export const fundingApplications = pgTable("funding_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programName: varchar("program_name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  deadline: timestamp("deadline"),
  status: varchar("status").default("pending"), // pending, submitted, approved, rejected
  applicationDate: timestamp("application_date").defaultNow(),
  requirements: jsonb("requirements"),
  documents: jsonb("documents"),
  followUpDate: timestamp("follow_up_date"),
  notes: text("notes")
});

export const patternAnalysis = pgTable("pattern_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patternType: varchar("pattern_type").notNull(), // behavioral, seasonal, demographic, etc.
  patternName: varchar("pattern_name").notNull(),
  patternData: jsonb("pattern_data"), // detailed pattern information
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  affectedUsers: integer("affected_users"),
  revenueImpact: decimal("revenue_impact", { precision: 10, scale: 2 }),
  discoveredAt: timestamp("discovered_at").defaultNow(),
  status: varchar("status").default("active") // active, archived, testing
});

export const productRecommendations = pgTable("product_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  productId: varchar("product_id").references(() => personalizedProducts.id),
  recommendationType: varchar("recommendation_type"), // collaborative, content-based, hybrid
  score: decimal("score", { precision: 5, scale: 4 }),
  reasoning: jsonb("reasoning"), // why this was recommended
  presented: boolean("presented").default(false),
  clicked: boolean("clicked").default(false),
  purchased: boolean("purchased").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export type CustomerInteraction = typeof customerInteractions.$inferSelect;
export type InsertCustomerInteraction = typeof customerInteractions.$inferInsert;
export type CustomerPreference = typeof customerPreferences.$inferSelect;
export type InsertCustomerPreference = typeof customerPreferences.$inferInsert;
export type PersonalizedProduct = typeof personalizedProducts.$inferSelect;
export type InsertPersonalizedProduct = typeof personalizedProducts.$inferInsert;
export type PatternAnalysis = typeof patternAnalysis.$inferSelect;
export type InsertPatternAnalysis = typeof patternAnalysis.$inferInsert;
export type ProductRecommendation = typeof productRecommendations.$inferSelect;
export type InsertProductRecommendation = typeof productRecommendations.$inferInsert;

// Economic Price Adaptation Schema
export const economicPricingData = pgTable("economic_pricing_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: varchar("country_code").notNull(),
  countryName: varchar("country_name").notNull(),
  gdpPerCapita: decimal("gdp_per_capita", { precision: 10, scale: 2 }),
  purchasingPowerIndex: decimal("purchasing_power_index", { precision: 5, scale: 4 }),
  inflationRate: decimal("inflation_rate", { precision: 5, scale: 2 }),
  unemploymentRate: decimal("unemployment_rate", { precision: 5, scale: 2 }),
  currencyCode: varchar("currency_code"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }),
  lastUpdated: timestamp("last_updated").defaultNow()
});

export const adaptivePricing = pgTable("adaptive_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  countryCode: varchar("country_code").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  adaptedPrice: decimal("adapted_price", { precision: 10, scale: 2 }).notNull(),
  adjustmentPercentage: decimal("adjustment_percentage", { precision: 5, scale: 2 }),
  optimizationLevel: varchar("optimization_level"), // aggressive, balanced, premium
  competitorAnalysis: jsonb("competitor_analysis"),
  marketPenetrationRate: decimal("market_penetration_rate", { precision: 5, scale: 2 }),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }),
  revenueImpact: decimal("revenue_impact", { precision: 12, scale: 2 }),
  lastOptimized: timestamp("last_optimized").defaultNow(),
  isActive: boolean("is_active").default(true)
});

export const priceOptimizationHistory = pgTable("price_optimization_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: varchar("country_code").notNull(),
  productId: varchar("product_id").notNull(),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }),
  adjustmentReason: varchar("adjustment_reason"),
  performanceMetrics: jsonb("performance_metrics"),
  optimizationResults: jsonb("optimization_results"),
  timestamp: timestamp("timestamp").defaultNow()
});

export type EconomicPricingData = typeof economicPricingData.$inferSelect;
export type InsertEconomicPricingData = typeof economicPricingData.$inferInsert;
export type AdaptivePricing = typeof adaptivePricing.$inferSelect;
export type InsertAdaptivePricing = typeof adaptivePricing.$inferInsert;
export type PriceOptimizationHistory = typeof priceOptimizationHistory.$inferSelect;
export type InsertPriceOptimizationHistory = typeof priceOptimizationHistory.$inferInsert;

// Competitive Intelligence Schema
export const competitiveMonitoring = pgTable("competitive_monitoring", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetCompetitor: varchar("target_competitor").notNull(),
  monitoringLevel: varchar("monitoring_level"), // supreme, high, medium, low
  threatsDetected: integer("threats_detected").default(0),
  countermeasuresActive: integer("countermeasures_active").default(0),
  competitiveAdvantage: varchar("competitive_advantage"),
  marketPosition: jsonb("market_position"),
  predictiveAnalysis: boolean("predictive_analysis").default(true),
  counterStrategies: boolean("counter_strategies").default(true),
  monitoringStarted: timestamp("monitoring_started").defaultNow(),
  lastThreatDetected: timestamp("last_threat_detected"),
  isActive: boolean("is_active").default(true)
});

export const sectorExpansion = pgTable("sector_expansion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectorName: varchar("sector_name").notNull(),
  dominationLevel: decimal("domination_level", { precision: 5, scale: 2 }).default("0"),
  revenueGenerated: decimal("revenue_generated", { precision: 15, scale: 2 }),
  companiesControlled: integer("companies_controlled").default(0),
  marketShare: decimal("market_share", { precision: 5, scale: 2 }),
  monthlyGrowth: decimal("monthly_growth", { precision: 5, scale: 2 }),
  competitorAdvantage: varchar("competitor_advantage"),
  expansionStatus: varchar("expansion_status"), // dominated, expanding, initiating, planned
  expansionStarted: timestamp("expansion_started").defaultNow(),
  targetCompletion: timestamp("target_completion"),
  isActive: boolean("is_active").default(true)
});

export const competitiveThreats = pgTable("competitive_threats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitor: varchar("competitor").notNull(),
  threatType: varchar("threat_type").notNull(),
  severity: varchar("severity"), // high, medium, low
  timeline: varchar("timeline"),
  countermeasure: varchar("countermeasure"),
  status: varchar("status"), // controlled, monitoring, active, resolved
  detectionDate: timestamp("detection_date").defaultNow(),
  resolutionDate: timestamp("resolution_date"),
  impactAssessment: jsonb("impact_assessment"),
  isActive: boolean("is_active").default(true)
});

export type CompetitiveMonitoring = typeof competitiveMonitoring.$inferSelect;
export type InsertCompetitiveMonitoring = typeof competitiveMonitoring.$inferInsert;
export type SectorExpansion = typeof sectorExpansion.$inferSelect;
export type InsertSectorExpansion = typeof sectorExpansion.$inferInsert;
export type CompetitiveThreats = typeof competitiveThreats.$inferSelect;
export type InsertCompetitiveThreats = typeof competitiveThreats.$inferInsert;

// Zod schemas for API validation
import { createInsertSchema } from "drizzle-zod";

export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertGeneratedImageSchema = createInsertSchema(generatedImages);
export const insertCompanyVerificationSchema = createInsertSchema(companyVerifications);
export const insertAtlasOperationSchema = createInsertSchema(atlasOperations);
export const insertAtlasImprovementSchema = createInsertSchema(atlasImprovements);
export const insertAtlasInternetAccessSchema = createInsertSchema(atlasInternetAccess);
export const insertAtlasCodeGenerationSchema = createInsertSchema(atlasCodeGeneration);
