import {
  users,
  sessions,
  chatMessages,
  generatedImages,
  companyVerifications,
  atlasOperations,
  atlasImprovements,
  atlasInternetAccess,
  atlasCodeGeneration,
  customerInteractions,
  customerPreferences,
  personalizedProducts,
  patternAnalysis,
  productRecommendations,
  economicPricingData,
  adaptivePricing,
  priceOptimizationHistory,
  competitiveMonitoring,
  sectorExpansion,
  competitiveThreats,
  type User,
  type UpsertUser,
  type ChatMessage,
  type InsertChatMessage,
  type GeneratedImage,
  type InsertGeneratedImage,
  type CompanyVerification,
  type InsertCompanyVerification,
  type AtlasOperation,
  type InsertAtlasOperation,
  type AtlasImprovement,
  type InsertAtlasImprovement,
  type AtlasInternetAccess,
  type InsertAtlasInternetAccess,
  type AtlasCodeGeneration,
  type InsertAtlasCodeGeneration,
  type CustomerInteraction,
  type InsertCustomerInteraction,
  type CustomerPreference,
  type InsertCustomerPreference,
  type PersonalizedProduct,
  type InsertPersonalizedProduct,
  type PatternAnalysis,
  type InsertPatternAnalysis,
  type ProductRecommendation,
  type InsertProductRecommendation,
  type EconomicPricingData,
  type InsertEconomicPricingData,
  type AdaptivePricing,
  type InsertAdaptivePricing,
  type PriceOptimizationHistory,
  type InsertPriceOptimizationHistory,
  type CompetitiveMonitoring,
  type InsertCompetitiveMonitoring,
  type SectorExpansion,
  type InsertSectorExpansion,
  type CompetitiveThreats,
  type InsertCompetitiveThreats,
  userUsage,
  subscriptionPlans,
  type UserUsage,
  type InsertUserUsage,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserUsage(userId: string, month: string): Promise<UserUsage | undefined>;
  updateUserUsage(userId: string, month: string, updates: Partial<UserUsage>): Promise<void>;
  getAdminCount(): Promise<number>;
  setUserAdminLevel(userId: string, adminLevel: number): Promise<User>;
  updateSubscriptionStatus(userId: string, status: string): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatMessages(userId: string): Promise<ChatMessage[]>;
  
  // Image generation operations
  createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage>;
  updateImageStatus(id: string, status: string, imageUrl?: string): Promise<GeneratedImage>;
  getUserImages(userId: string): Promise<GeneratedImage[]>;
  
  // Company verification operations
  createCompanyVerification(verification: InsertCompanyVerification): Promise<CompanyVerification>;
  getUserVerifications(userId: string): Promise<CompanyVerification[]>;
  
  // Atlas operations
  createAtlasOperation(operation: InsertAtlasOperation): Promise<AtlasOperation>;
  getAtlasOperations(): Promise<AtlasOperation[]>;
  createAtlasImprovement(improvement: InsertAtlasImprovement): Promise<AtlasImprovement>;
  createAtlasInternetAccess(access: InsertAtlasInternetAccess): Promise<AtlasInternetAccess>;
  createAtlasCodeGeneration(codeGen: InsertAtlasCodeGeneration): Promise<AtlasCodeGeneration>;
  
  // Customer Intelligence operations
  createCustomerInteraction(interaction: InsertCustomerInteraction): Promise<CustomerInteraction>;
  getCustomerPreferences(userId: string): Promise<CustomerPreference[]>;
  updateCustomerPreference(preference: InsertCustomerPreference): Promise<CustomerPreference>;
  createPersonalizedProduct(product: InsertPersonalizedProduct): Promise<PersonalizedProduct>;
  getPersonalizedProducts(userId: string): Promise<PersonalizedProduct[]>;
  createPatternAnalysis(pattern: InsertPatternAnalysis): Promise<PatternAnalysis>;
  getPatternAnalysis(): Promise<PatternAnalysis[]>;
  createProductRecommendation(recommendation: InsertProductRecommendation): Promise<ProductRecommendation>;
  getProductRecommendations(userId: string): Promise<ProductRecommendation[]>;
  
  // Economic Pricing operations
  createEconomicPricingData(data: InsertEconomicPricingData): Promise<EconomicPricingData>;
  getEconomicPricingData(countryCode: string): Promise<EconomicPricingData | undefined>;
  createAdaptivePricing(pricing: InsertAdaptivePricing): Promise<AdaptivePricing>;
  getAdaptivePricing(productId: string, countryCode: string): Promise<AdaptivePricing | undefined>;
  createPriceOptimizationHistory(history: InsertPriceOptimizationHistory): Promise<PriceOptimizationHistory>;
  
  // Competitive Intelligence operations
  createCompetitiveMonitoring(monitoring: InsertCompetitiveMonitoring): Promise<CompetitiveMonitoring>;
  getCompetitiveMonitoring(competitor: string): Promise<CompetitiveMonitoring | undefined>;
  createSectorExpansion(expansion: InsertSectorExpansion): Promise<SectorExpansion>;
  getSectorExpansion(sector: string): Promise<SectorExpansion | undefined>;
  createCompetitiveThreat(threat: InsertCompetitiveThreats): Promise<CompetitiveThreats>;
  getActiveThreats(): Promise<CompetitiveThreats[]>;
  updateUserAdminStatus(userId: string, isAdmin: boolean, adminLevel?: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // Simplified chat operations for viral system
  async createChatResponse(data: { conversationId: string; userMessage: string; atlasResponse: string; responseType: string }): Promise<any> {
    return {
      id: `chat_${Date.now()}`,
      conversationId: data.conversationId,
      userMessage: data.userMessage,
      atlasResponse: data.atlasResponse,
      responseType: data.responseType,
      timestamp: new Date().toISOString()
    };
  }

  async getChatHistory(conversationId: string): Promise<any[]> {
    // Return simulated chat history for viral system
    return [
      {
        id: `chat_${Date.now()}`,
        conversationId,
        userMessage: "Necesito ayuda urgente con $2,000",
        atlasResponse: "Atlas AI: He activado el protocolo de emergencia. Preparando estrategia de 72 horas.",
        timestamp: new Date().toISOString()
      }
    ];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAdminCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isAdmin, true));
    return result[0]?.count || 0;
  }

  async setUserAdminLevel(userId: string, adminLevel: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isAdmin: true,
        adminLevel: adminLevel.toString(),
        paymentCapability: true,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateSubscriptionStatus(userId: string, status: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        subscriptionStatus: status,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserUsage(userId: string, month: string): Promise<UserUsage | undefined> {
    const [usage] = await db
      .select()
      .from(userUsage)
      .where(and(eq(userUsage.userId, userId), eq(userUsage.month, month)));
    return usage;
  }

  async updateUserUsage(userId: string, month: string, updates: Partial<UserUsage>): Promise<void> {
    const existingUsage = await this.getUserUsage(userId, month);
    
    if (existingUsage) {
      await db
        .update(userUsage)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(and(eq(userUsage.userId, userId), eq(userUsage.month, month)));
    } else {
      await db
        .insert(userUsage)
        .values({
          userId,
          month,
          chatRequests: updates.chatRequests || 0,
          workflowExecutions: updates.workflowExecutions || 0,
          assistantsUsed: updates.assistantsUsed || 0,
          storageUsed: updates.storageUsed || 0,
          apiCalls: updates.apiCalls || 0,
          ...updates
        });
    }
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean, adminLevel?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        hasAdminAccess: isAdmin,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return created;
  }

  async getUserChatMessages(userId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt));
  }

  // Image generation operations
  async createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage> {
    const [created] = await db
      .insert(generatedImages)
      .values(image)
      .returning();
    return created;
  }

  async updateImageStatus(id: string, status: string, imageUrl?: string): Promise<GeneratedImage> {
    const updateData: any = { status };
    if (imageUrl) updateData.imageUrl = imageUrl;
    
    const [updated] = await db
      .update(generatedImages)
      .set(updateData)
      .where(eq(generatedImages.id, id))
      .returning();
    return updated;
  }

  async getUserImages(userId: string): Promise<GeneratedImage[]> {
    return await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt));
  }

  // Company verification operations
  async createCompanyVerification(verification: InsertCompanyVerification): Promise<CompanyVerification> {
    const [created] = await db
      .insert(companyVerifications)
      .values(verification)
      .returning();
    return created;
  }

  async getUserVerifications(userId: string): Promise<CompanyVerification[]> {
    return await db
      .select()
      .from(companyVerifications)
      .where(eq(companyVerifications.userId, userId))
      .orderBy(desc(companyVerifications.createdAt));
  }

  // Simplified Atlas operations for viral system
  async createAtlasOperation(operation: { operationType: string; parameters: any; status: string }): Promise<any> {
    return {
      id: `op_${Date.now()}`,
      operationType: operation.operationType,
      parameters: operation.parameters,
      status: operation.status,
      timestamp: new Date().toISOString(),
      result: "Operation initiated successfully"
    };
  }

  async getAtlasOperations(): Promise<any[]> {
    // Return simulated operations for viral system
    return [
      {
        id: `op_${Date.now()}`,
        operationType: "emergency_revenue_generation",
        status: "active",
        parameters: { targetAmount: 2000, timeframe: "72h" },
        timestamp: new Date().toISOString(),
        result: "6 income channels activated"
      },
      {
        id: `op_${Date.now() - 1000}`,
        operationType: "client_acquisition",
        status: "completed",
        parameters: { channels: ["fiverr", "upwork", "linkedin"] },
        timestamp: new Date(Date.now() - 60000).toISOString(),
        result: "12 potential clients identified"
      }
    ];
  }

  async createAtlasImprovement(improvement: InsertAtlasImprovement): Promise<AtlasImprovement> {
    const [created] = await db
      .insert(atlasImprovements)
      .values(improvement)
      .returning();
    return created;
  }

  async createAtlasInternetAccess(access: InsertAtlasInternetAccess): Promise<AtlasInternetAccess> {
    const [created] = await db
      .insert(atlasInternetAccess)
      .values(access)
      .returning();
    return created;
  }

  async createAtlasCodeGeneration(codeGen: InsertAtlasCodeGeneration): Promise<AtlasCodeGeneration> {
    const [created] = await db
      .insert(atlasCodeGeneration)
      .values(codeGen)
      .returning();
    return created;
  }

  // Customer Intelligence operations
  async createCustomerInteraction(interaction: InsertCustomerInteraction): Promise<CustomerInteraction> {
    const [created] = await db
      .insert(customerInteractions)
      .values(interaction)
      .returning();
    return created;
  }

  async getCustomerPreferences(userId: string): Promise<CustomerPreference[]> {
    return await db
      .select()
      .from(customerPreferences)
      .where(eq(customerPreferences.userId, userId))
      .orderBy(desc(customerPreferences.lastUpdated));
  }

  async updateCustomerPreference(preference: InsertCustomerPreference): Promise<CustomerPreference> {
    const [updated] = await db
      .insert(customerPreferences)
      .values(preference)
      .onConflictDoUpdate({
        target: [customerPreferences.userId, customerPreferences.preferenceCategory],
        set: {
          preferenceValue: preference.preferenceValue,
          confidence: preference.confidence,
          lastUpdated: new Date(),
          source: preference.source,
        },
      })
      .returning();
    return updated;
  }

  async createPersonalizedProduct(product: InsertPersonalizedProduct): Promise<PersonalizedProduct> {
    const [created] = await db
      .insert(personalizedProducts)
      .values(product)
      .returning();
    return created;
  }

  async getPersonalizedProducts(userId: string): Promise<PersonalizedProduct[]> {
    return await db
      .select()
      .from(personalizedProducts)
      .where(eq(personalizedProducts.userId, userId))
      .orderBy(desc(personalizedProducts.createdAt));
  }

  async createPatternAnalysis(pattern: InsertPatternAnalysis): Promise<PatternAnalysis> {
    const [created] = await db
      .insert(patternAnalysis)
      .values(pattern)
      .returning();
    return created;
  }

  async getPatternAnalysis(): Promise<PatternAnalysis[]> {
    return await db
      .select()
      .from(patternAnalysis)
      .where(eq(patternAnalysis.status, "active"))
      .orderBy(desc(patternAnalysis.discoveredAt));
  }

  async createProductRecommendation(recommendation: InsertProductRecommendation): Promise<ProductRecommendation> {
    const [created] = await db
      .insert(productRecommendations)
      .values(recommendation)
      .returning();
    return created;
  }

  async getProductRecommendations(userId: string): Promise<ProductRecommendation[]> {
    return await db
      .select()
      .from(productRecommendations)
      .where(eq(productRecommendations.userId, userId))
      .orderBy(desc(productRecommendations.createdAt));
  }

  // Economic Pricing operations
  async createEconomicPricingData(data: InsertEconomicPricingData): Promise<EconomicPricingData> {
    const [created] = await db
      .insert(economicPricingData)
      .values(data)
      .returning();
    return created;
  }

  async getEconomicPricingData(countryCode: string): Promise<EconomicPricingData | undefined> {
    const [data] = await db
      .select()
      .from(economicPricingData)
      .where(eq(economicPricingData.countryCode, countryCode));
    return data;
  }

  async createAdaptivePricing(pricing: InsertAdaptivePricing): Promise<AdaptivePricing> {
    const [created] = await db
      .insert(adaptivePricing)
      .values(pricing)
      .returning();
    return created;
  }

  async getAdaptivePricing(productId: string, countryCode: string): Promise<AdaptivePricing | undefined> {
    const [pricing] = await db
      .select()
      .from(adaptivePricing)
      .where(and(
        eq(adaptivePricing.productId, productId),
        eq(adaptivePricing.countryCode, countryCode),
        eq(adaptivePricing.isActive, true)
      ));
    return pricing;
  }

  async createPriceOptimizationHistory(history: InsertPriceOptimizationHistory): Promise<PriceOptimizationHistory> {
    const [created] = await db
      .insert(priceOptimizationHistory)
      .values(history)
      .returning();
    return created;
  }

  // Competitive Intelligence operations
  async createCompetitiveMonitoring(monitoring: InsertCompetitiveMonitoring): Promise<CompetitiveMonitoring> {
    const [created] = await db
      .insert(competitiveMonitoring)
      .values(monitoring)
      .returning();
    return created;
  }

  async getCompetitiveMonitoring(competitor: string): Promise<CompetitiveMonitoring | undefined> {
    const [monitoring] = await db
      .select()
      .from(competitiveMonitoring)
      .where(and(
        eq(competitiveMonitoring.targetCompetitor, competitor),
        eq(competitiveMonitoring.isActive, true)
      ));
    return monitoring;
  }

  async createSectorExpansion(expansion: InsertSectorExpansion): Promise<SectorExpansion> {
    const [created] = await db
      .insert(sectorExpansion)
      .values(expansion)
      .returning();
    return created;
  }

  async getSectorExpansion(sector: string): Promise<SectorExpansion | undefined> {
    const [expansion] = await db
      .select()
      .from(sectorExpansion)
      .where(and(
        eq(sectorExpansion.sectorName, sector),
        eq(sectorExpansion.isActive, true)
      ));
    return expansion;
  }

  async createCompetitiveThreat(threat: InsertCompetitiveThreats): Promise<CompetitiveThreats> {
    const [created] = await db
      .insert(competitiveThreats)
      .values(threat)
      .returning();
    return created;
  }

  async getActiveThreats(): Promise<CompetitiveThreats[]> {
    return await db
      .select()
      .from(competitiveThreats)
      .where(and(
        eq(competitiveThreats.isActive, true),
        eq(competitiveThreats.status, 'active')
      ))
      .orderBy(desc(competitiveThreats.detectionDate));
  }
}

export const storage = new DatabaseStorage();