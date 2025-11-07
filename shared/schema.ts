import { pgTable, text, integer, serial, timestamp, boolean, real, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ========== USERS TABLE ==========
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  companyName: text("company_name").notNull(),
  role: text("role").notNull().$type<"operator" | "cloud">(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ========== SESSIONS TABLE ==========
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// ========== DEMO REQUESTS TABLE ==========
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization").notNull(),
  persona: text("persona").notNull().$type<"operator" | "cloud">(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).omit({
  id: true,
  createdAt: true,
});

export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;

// ========== INTEGRATION CONFIGS TABLE ==========
export const integrationConfigs = pgTable("integration_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mode: text("mode").notNull().$type<"LIVE" | "MOCK">().default("MOCK"),
  eiaApiKey: text("eia_api_key"),
  airnowApiKey: text("airnow_api_key"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertIntegrationConfigSchema = createInsertSchema(integrationConfigs).omit({
  id: true,
  updatedAt: true,
});

export type IntegrationConfig = typeof integrationConfigs.$inferSelect;
export type InsertIntegrationConfig = z.infer<typeof insertIntegrationConfigSchema>;

// ========== REPORT TEMPLATES TABLE ==========
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  originalFilename: text("original_filename").notNull(),
  fileData: text("file_data").notNull(),
  fileSize: integer("file_size").notNull(),
  contentHash: text("content_hash").notNull(),
  description: text("description"),
  placeholders: jsonb("placeholders").notNull().$type<string[]>(),
  lastUsedAt: timestamp("last_used_at"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
}, (table) => ({
  userNameIdx: index("report_templates_user_name_idx").on(table.userId, table.name),
}));

export const insertReportTemplateSchema = createInsertSchema(reportTemplates, {
  fileData: z.string(),
  placeholders: z.array(z.string()),
}).omit({
  id: true,
  uploadedAt: true,
  lastUsedAt: true,
});

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

// ========== REPORT VERSIONS TABLE ==========
export const reportVersions = pgTable("report_versions", {
  id: varchar("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  templateId: integer("template_id").references(() => reportTemplates.id, { onDelete: "set null" }),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull().$type<"docx" | "pdf">(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReportVersionSchema = createInsertSchema(reportVersions).omit({
  createdAt: true,
});

export type ReportVersion = typeof reportVersions.$inferSelect;
export type InsertReportVersion = z.infer<typeof insertReportVersionSchema>;

// ========== OPTIMIZATION SCENARIOS TABLE ==========
export const optimizationScenarios = pgTable("optimization_scenarios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  persona: text("persona").notNull().$type<"operator" | "cloud">(),
  controls: jsonb("controls").notNull(),
  roiData: jsonb("roi_data").notNull(),
  recommendations: text("recommendations"),
  source: text("source").$type<"openai" | "rule-based">(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOptimizationScenarioSchema = createInsertSchema(optimizationScenarios).omit({
  id: true,
  createdAt: true,
});

export type OptimizationScenario = typeof optimizationScenarios.$inferSelect;
export type InsertOptimizationScenario = z.infer<typeof insertOptimizationScenarioSchema>;

// ========== ZOD SCHEMAS FOR API VALIDATION ==========

// Auth & Session
export const sessionSchema = z.object({
  userId: z.number(),
  role: z.enum(["operator", "cloud"]),
  companyName: z.string(),
  email: z.string().email(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(1),
  role: z.enum(["operator", "cloud"]),
});

export const quickLoginSchema = z.object({
  persona: z.enum(["operator", "cloud"]),
});

export type SessionData = z.infer<typeof sessionSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type QuickLoginRequest = z.infer<typeof quickLoginSchema>;

// Integration Config API
export const integrationConfigApiSchema = z.object({
  mode: z.enum(["LIVE", "MOCK"]),
  eiaApiKey: z.string().optional(),
  airnowApiKey: z.string().optional(),
});

export const apiStatusSchema = z.object({
  name: z.string(),
  configured: z.boolean(),
  lastSync: z.string().datetime().optional(),
  status: z.enum(["active", "inactive", "error"]),
});

export const integrationsStatusSchema = z.object({
  mode: z.enum(["LIVE", "MOCK"]),
  apis: z.array(apiStatusSchema),
});

export type IntegrationConfigApi = z.infer<typeof integrationConfigApiSchema>;
export type ApiStatus = z.infer<typeof apiStatusSchema>;
export type IntegrationsStatus = z.infer<typeof integrationsStatusSchema>;

// Zone Data
export const zoneKpisSchema = z.object({
  zip: z.string(),
  load_kwh: z.number(),
  carbon_intensity_kg_per_kwh: z.number(),
  aqi: z.number(),
  price_cents_per_kwh: z.number(),
  energy_burden_pct: z.number(),
  svi: z.number(),
  cii: z.number(),
});

export const hourDataSchema = z.object({
  hour: z.number(),
  carbon_intensity: z.number(),
  price: z.number(),
  load: z.number(),
  temp_f: z.number().optional(),
});

export const cleanerHourSchema = z.object({
  hour: z.number(),
  label: z.string(),
});

export const zipMetricsSchema = z.object({
  load_kwh: z.number(),
  carbon_intensity_kg_per_kwh: z.number(),
  cii: z.number(),
  aqi: z.number(),
  price_cents_per_kwh: z.number(),
});

export const zoneDataSchema = z.object({
  kpis: zoneKpisSchema,
  trends_24h: z.array(hourDataSchema),
  cleaner_hours: z.array(cleanerHourSchema),
  all_zips_metrics: z.record(z.string(), zipMetricsSchema).optional(),
});

export type ZipMetrics = z.infer<typeof zipMetricsSchema>;
export type ZoneKpis = z.infer<typeof zoneKpisSchema>;
export type HourData = z.infer<typeof hourDataSchema>;
export type CleanerHour = z.infer<typeof cleanerHourSchema>;
export type ZoneData = z.infer<typeof zoneDataSchema>;

// Metrics & Dashboard
export const kpiCardDataSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string(),
  delta: z.number().optional(),
  deltaLabel: z.string().optional(),
});

export const timeseriesPointSchema = z.object({
  timestamp: z.string(),
  baseline: z.number(),
  optimized: z.number().optional(),
});

export const metricsDataSchema = z.object({
  persona: z.enum(["operator", "cloud"]),
  kpis: z.object({
    cost_usd: kpiCardDataSchema,
    kwh: kpiCardDataSchema,
    co2_kg: kpiCardDataSchema,
    cii: kpiCardDataSchema,
  }),
  timeseries: z.object({
    cost: z.array(timeseriesPointSchema),
    carbon: z.array(timeseriesPointSchema),
  }),
  map_summary: z.array(zoneKpisSchema),
});

export type KpiCardData = z.infer<typeof kpiCardDataSchema>;
export type TimeseriesPoint = z.infer<typeof timeseriesPointSchema>;
export type MetricsData = z.infer<typeof metricsDataSchema>;

// Recommendations
export const operatorControlsSchema = z.object({
  cooling_setpoint_delta_f: z.number().min(0).max(10),
  containment_pct: z.number().min(0).max(100),
  batch_deferral_pct: z.number().min(0).max(100),
});

export const cloudControlsSchema = z.object({
  shift_pct: z.number().min(0).max(60),
  target_region: z.enum(["us-east", "us-west", "us-central"]),
  target_hours: z.string(),
});

export const recommendationRequestSchema = z.object({
  persona: z.enum(["operator", "cloud"]),
  controls: z.union([operatorControlsSchema, cloudControlsSchema]),
  companyName: z.string(),
});

export const roiDataSchema = z.object({
  costSavedUSD: z.number(),
  savingsPct: z.number(),
  emissionsAvoidedTons: z.number(),
  ciiDelta: z.number(),
});

export const recommendationResponseSchema = z.object({
  roi: roiDataSchema,
  recommendations: z.string(),
  source: z.enum(["openai", "rule-based"]),
});

export type OperatorControls = z.infer<typeof operatorControlsSchema>;
export type CloudControls = z.infer<typeof cloudControlsSchema>;
export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>;
export type RoiData = z.infer<typeof roiDataSchema>;
export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;

// Reports
export const reportTemplateUploadSchema = z.object({
  name: z.string(),
  placeholders: z.array(z.string()),
});

export const fieldMappingSchema = z.object({
  placeholder: z.string(),
  metricKey: z.string(),
});

export const reportGenerateRequestSchema = z.object({
  templateId: z.string(),
  fieldMappings: z.array(fieldMappingSchema),
  persona: z.enum(["operator", "cloud"]),
});

export const reportVersionApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  downloadUrl: z.string(),
});

export type ReportTemplateUpload = z.infer<typeof reportTemplateUploadSchema>;
export type FieldMapping = z.infer<typeof fieldMappingSchema>;
export type ReportGenerateRequest = z.infer<typeof reportGenerateRequestSchema>;
export type ReportVersionApi = z.infer<typeof reportVersionApiSchema>;

// Summary
export const zipImpactSchema = z.object({
  zip: z.string(),
  cii_before: z.number(),
  cii_after: z.number(),
  cii_delta: z.number(),
});

export const summaryDataSchema = z.object({
  before: z.object({
    cost_usd: z.number(),
    kwh: z.number(),
    co2_tons: z.number(),
    cii: z.number(),
  }),
  after: z.object({
    cost_usd: z.number(),
    kwh: z.number(),
    co2_tons: z.number(),
    cii: z.number(),
  }),
  top_impacted_zips: z.array(zipImpactSchema),
});

export type ZipImpact = z.infer<typeof zipImpactSchema>;
export type SummaryData = z.infer<typeof summaryDataSchema>;
