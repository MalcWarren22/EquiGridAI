import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import { eq, desc, lte } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Session,
  InsertSession,
  DemoRequest,
  InsertDemoRequest,
  IntegrationConfig,
  InsertIntegrationConfig,
  ReportTemplate,
  InsertReportTemplate,
  ReportVersion,
  InsertReportVersion,
  OptimizationScenario,
  InsertOptimizationScenario,
} from "@shared/schema";

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

// ========== USERS ==========
export async function createUser(user: InsertUser): Promise<User> {
  const [newUser] = await db.insert(schema.users).values([{
    ...user,
    role: user.role as "operator" | "cloud",
  }]).returning();
  return newUser;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return user;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return user;
}

// ========== SESSIONS ==========
export async function createSession(session: InsertSession): Promise<Session> {
  const [newSession] = await db.insert(schema.sessions).values([session]).returning();
  return newSession;
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.id, id))
    .limit(1);
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
}

export async function deleteExpiredSessions(): Promise<void> {
  await db.delete(schema.sessions).where(lte(schema.sessions.expiresAt, new Date()));
}

// ========== DEMO REQUESTS ==========
export async function saveDemoRequest(request: InsertDemoRequest): Promise<DemoRequest> {
  const [newRequest] = await db.insert(schema.demoRequests).values([{
    ...request,
    persona: request.persona as "operator" | "cloud",
  }]).returning();
  return newRequest;
}

export async function getDemoRequests(): Promise<DemoRequest[]> {
  return await db.select().from(schema.demoRequests).orderBy(desc(schema.demoRequests.createdAt));
}

// ========== INTEGRATION CONFIGS ==========
export async function saveIntegrationConfig(
  userId: number,
  config: Omit<InsertIntegrationConfig, "userId">
): Promise<IntegrationConfig> {
  const existing = await getIntegrationConfig(userId);
  
  if (existing) {
    const [updated] = await db
      .update(schema.integrationConfigs)
      .set({
        mode: config.mode as "LIVE" | "MOCK",
        eiaApiKey: config.eiaApiKey || null,
        airnowApiKey: config.airnowApiKey || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.integrationConfigs.userId, userId))
      .returning();
    return updated;
  }
  
  const [newConfig] = await db
    .insert(schema.integrationConfigs)
    .values([{
      ...config,
      userId,
      mode: config.mode as "LIVE" | "MOCK",
    }])
    .returning();
  return newConfig;
}

export async function getIntegrationConfig(userId: number): Promise<IntegrationConfig | undefined> {
  const [config] = await db
    .select()
    .from(schema.integrationConfigs)
    .where(eq(schema.integrationConfigs.userId, userId))
    .limit(1);
  return config;
}

// ========== REPORT VERSIONS ==========
export async function saveReportVersion(report: InsertReportVersion): Promise<ReportVersion> {
  const [newReport] = await db.insert(schema.reportVersions).values([{
    ...report,
    fileType: report.fileType as "docx" | "pdf",
  }]).returning();
  return newReport;
}

export async function getReportVersionsByUser(userId: number): Promise<ReportVersion[]> {
  return await db
    .select()
    .from(schema.reportVersions)
    .where(eq(schema.reportVersions.userId, userId))
    .orderBy(desc(schema.reportVersions.createdAt));
}

export async function getReportVersionById(id: string): Promise<ReportVersion | undefined> {
  const [report] = await db
    .select()
    .from(schema.reportVersions)
    .where(eq(schema.reportVersions.id, id))
    .limit(1);
  return report;
}

// ========== OPTIMIZATION SCENARIOS ==========
export async function saveOptimizationScenario(
  scenario: InsertOptimizationScenario
): Promise<OptimizationScenario> {
  const [newScenario] = await db.insert(schema.optimizationScenarios).values([{
    ...scenario,
    persona: scenario.persona as "operator" | "cloud",
    source: scenario.source as "openai" | "rule-based" | undefined,
  }]).returning();
  return newScenario;
}

export async function getScenariosByUser(userId: number): Promise<OptimizationScenario[]> {
  return await db
    .select()
    .from(schema.optimizationScenarios)
    .where(eq(schema.optimizationScenarios.userId, userId))
    .orderBy(desc(schema.optimizationScenarios.createdAt));
}

export async function getScenarioById(id: number): Promise<OptimizationScenario | undefined> {
  const [scenario] = await db
    .select()
    .from(schema.optimizationScenarios)
    .where(eq(schema.optimizationScenarios.id, id))
    .limit(1);
  return scenario;
}

export async function deleteScenario(id: number): Promise<void> {
  await db.delete(schema.optimizationScenarios).where(eq(schema.optimizationScenarios.id, id));
}

// ========== REPORT TEMPLATES ==========
export async function createReportTemplate(
  template: InsertReportTemplate
): Promise<ReportTemplate> {
  const [newTemplate] = await db
    .insert(schema.reportTemplates)
    .values([template])
    .returning();
  return newTemplate;
}

export async function getReportTemplatesByUserId(userId: number): Promise<ReportTemplate[]> {
  return await db
    .select()
    .from(schema.reportTemplates)
    .where(eq(schema.reportTemplates.userId, userId))
    .orderBy(desc(schema.reportTemplates.uploadedAt));
}

export async function getReportTemplateById(id: number): Promise<ReportTemplate | undefined> {
  const [template] = await db
    .select()
    .from(schema.reportTemplates)
    .where(eq(schema.reportTemplates.id, id))
    .limit(1);
  return template;
}

export async function updateTemplateLastUsed(id: number): Promise<void> {
  await db
    .update(schema.reportTemplates)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.reportTemplates.id, id));
}

export async function deleteReportTemplate(id: number): Promise<void> {
  await db.delete(schema.reportTemplates).where(eq(schema.reportTemplates.id, id));
}
