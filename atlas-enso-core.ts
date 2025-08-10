/**
 * Atlas Enso Core - Integración completa de funciones Enso AI
 * Motor central que coordina todos los módulos Atlas-Enso
 */

import { atlasVault } from './atlas-vault.js';
import { atlasMonetize } from './atlas-monetize.js';
import { atlasOps } from './atlas-ops.js';
import { atlasInsight } from './atlas-insight.js';

export interface EnsoSystemStatus {
  system_health: number;
  total_revenue: number;
  active_protocols: number;
  knowledge_items: number;
  operational_efficiency: number;
  market_position: string;
  next_actions: string[];
  emergency_mode: boolean;
}

export interface EnsoExecutionReport {
  execution_id: string;
  timestamp: Date;
  modules_executed: string[];
  revenue_generated: number;
  insights_discovered: number;
  protocols_completed: number;
  success_rate: number;
  recommendations: string[];
}

export class AtlasEnsoCore {
  private isRunning: boolean = false;
  private executionCount: number = 0;
  private totalSystemRevenue: number = 0;
  private emergencyMode: boolean = false;
  private lastExecution: Date | null = null;

  constructor() {
    console.log("🧠 ATLAS ENSO CORE: Inicializando sistema integrado...");
    this.initializeIntegratedSystem();
  }

  // Initialize the integrated Enso-Atlas system
  private initializeIntegratedSystem(): void {
    console.log("🔧 ENSO CORE: Configurando integración de módulos...");

    // Store integration protocols in vault
    atlasVault.store("enso_integration_protocol", {
      name: "Enso AI Integration Protocol",
      modules: ["vault", "monetize", "ops", "insight"],
      synchronization: "real-time",
      autonomy_level: 95,
      value: 100000
    });

    // Add Enso-specific operational protocols
    atlasOps.addProtocol(
      "Enso Revenue Optimization",
      "Continuous revenue optimization using Enso AI methodologies",
      [
        {
          name: "Analyze Revenue Streams",
          action: async () => {
            const monetizationStatus = atlasMonetize.getMonetizationStatus();
            console.log(`💰 ENSO: Analyzed ${monetizationStatus.total_products} revenue streams`);
            return { streams: monetizationStatus.revenue_streams.length, potential: 50000 };
          },
          expected_outcome: "Optimized revenue streams",
          timeout: 10000,
          retry_count: 0
        },
        {
          name: "Deploy Market Intelligence",
          action: async () => {
            const insights = atlasInsight.generateReport();
            console.log(`🧠 ENSO: Generated intelligence with ${insights.insights.length} insights`);
            return { insights: insights.insights.length, confidence: insights.confidence_score };
          },
          expected_outcome: "Market intelligence deployed",
          timeout: 15000,
          retry_count: 0
        }
      ]
    );

    console.log("✅ ENSO CORE: Sistema integrado y operativo");
    this.startAutonomousOperation();
  }

  // Execute complete Enso-Atlas system cycle
  async run(): Promise<EnsoExecutionReport> {
    if (this.isRunning) {
      console.log("⏳ ENSO CORE: System already running, skipping execution");
      return this.createEmptyReport();
    }

    this.isRunning = true;
    const startTime = Date.now();
    const executionId = `enso_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🚀 ENSO CORE: Executing complete system cycle (${executionId})`);

    try {
      // 1. Operations execution
      console.log("⚙️ ENSO: Executing operational protocols...");
      const operationResults = await atlasOps.runAll();
      
      // 2. Generate insights and analysis
      console.log("🧠 ENSO: Generating strategic insights...");
      const insightReport = atlasInsight.generateReport();
      
      // 3. Revenue generation and monetization
      console.log("💰 ENSO: Executing monetization strategies...");
      const newProducts = atlasMonetize.generateArtifacts();
      
      // 4. Knowledge processing and storage
      console.log("🔐 ENSO: Processing and storing knowledge...");
      this.processSystemKnowledge(operationResults, insightReport, newProducts);

      // 5. Calculate system performance
      const systemRevenue = this.calculateSystemRevenue(operationResults, newProducts);
      this.totalSystemRevenue += systemRevenue;
      this.executionCount++;
      this.lastExecution = new Date();

      // 6. Generate execution report
      const report: EnsoExecutionReport = {
        execution_id: executionId,
        timestamp: new Date(),
        modules_executed: ['vault', 'monetize', 'ops', 'insight'],
        revenue_generated: systemRevenue,
        insights_discovered: insightReport.insights.length,
        protocols_completed: operationResults.length,
        success_rate: this.calculateSuccessRate(operationResults),
        recommendations: insightReport.recommendations.slice(0, 5).map(r => r.action)
      };

      console.log(`✅ ENSO CORE: Cycle completed - $${systemRevenue} generated in ${Date.now() - startTime}ms`);
      
      // Check for emergency conditions
      this.checkEmergencyConditions(report);

      return report;

    } catch (error) {
      console.error("❌ ENSO CORE: Execution error:", error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // Process and integrate knowledge across all modules
  private processSystemKnowledge(operationResults: any[], insightReport: any, products: any[]): void {
    // Store operation results
    atlasVault.store("latest_operations", {
      results: operationResults,
      success_count: operationResults.filter(r => r.success).length,
      total_revenue: operationResults.reduce((sum, r) => sum + r.revenue_generated, 0),
      timestamp: new Date()
    });

    // Store insights
    atlasVault.store("latest_insights", {
      report_id: insightReport.id,
      urgency: insightReport.urgency,
      revenue_impact: insightReport.revenue_impact,
      confidence: insightReport.confidence_score,
      timestamp: new Date()
    });

    // Store product performance
    atlasVault.store("latest_products", {
      products: products.map(p => ({
        name: p.name,
        price: p.price,
        revenue: p.revenue_generated
      })),
      total_products: products.length,
      total_revenue: products.reduce((sum, p) => sum + p.revenue_generated, 0),
      timestamp: new Date()
    });
  }

  // Calculate total system revenue
  private calculateSystemRevenue(operationResults: any[], products: any[]): number {
    const operationRevenue = operationResults.reduce((sum, result) => sum + (result.revenue_generated || 0), 0);
    const productRevenue = products.reduce((sum, product) => sum + (product.revenue_generated || 0), 0);
    
    // Add system integration bonus (10% of combined revenue)
    const integrationBonus = (operationRevenue + productRevenue) * 0.1;
    
    return Math.round(operationRevenue + productRevenue + integrationBonus);
  }

  // Calculate overall success rate
  private calculateSuccessRate(operationResults: any[]): number {
    if (operationResults.length === 0) return 0;
    
    const successfulOperations = operationResults.filter(r => r.success).length;
    return Math.round((successfulOperations / operationResults.length) * 100);
  }

  // Check for emergency conditions and activate emergency mode
  private checkEmergencyConditions(report: EnsoExecutionReport): void {
    const shouldActivateEmergency = 
      report.revenue_generated < 10000 || 
      report.success_rate < 70 || 
      report.insights_discovered < 3;

    if (shouldActivateEmergency && !this.emergencyMode) {
      this.activateEmergencyMode();
    } else if (!shouldActivateEmergency && this.emergencyMode) {
      this.deactivateEmergencyMode();
    }
  }

  // Activate emergency mode
  private activateEmergencyMode(): void {
    console.log("🚨 ENSO CORE: ACTIVATING EMERGENCY MODE");
    this.emergencyMode = true;

    // Activate emergency protocols
    atlasOps.activateEmergencyProtocols();
    atlasMonetize.emergencyMonetization();
    
    // Generate emergency decision support
    atlasInsight.emergencyDecisionSupport("System performance below optimal thresholds");

    // Store emergency activation
    atlasVault.store("emergency_activation", {
      activated: new Date(),
      reason: "System performance below thresholds",
      actions_taken: ["emergency_protocols", "emergency_monetization", "decision_support"],
      expected_recovery_time: "1-2 hours"
    });
  }

  // Deactivate emergency mode
  private deactivateEmergencyMode(): void {
    console.log("✅ ENSO CORE: DEACTIVATING EMERGENCY MODE - Performance restored");
    this.emergencyMode = false;

    atlasVault.store("emergency_deactivation", {
      deactivated: new Date(),
      duration: "System performance restored",
      recovery_successful: true
    });
  }

  // Start autonomous operation
  private startAutonomousOperation(): void {
    console.log("🔄 ENSO CORE: Starting autonomous operation...");
    
    // Execute complete system cycle every 60 seconds
    setInterval(async () => {
      try {
        await this.run();
      } catch (error) {
        console.error("❌ ENSO AUTONOMOUS: Cycle error:", error);
      }
    }, 60000);

    // Execute initial cycle after 10 seconds
    setTimeout(async () => {
      await this.run();
    }, 10000);
  }

  // Get comprehensive system status
  getSystemStatus(): EnsoSystemStatus {
    const vaultStats = atlasVault.getVaultStats();
    const monetizationStatus = atlasMonetize.getMonetizationStatus();
    const operationsStatus = atlasOps.getOperationsStatus();
    const insightDashboard = atlasInsight.getInsightDashboard();

    const systemHealth = this.calculateSystemHealth(
      vaultStats, 
      monetizationStatus, 
      operationsStatus, 
      insightDashboard
    );

    const marketPosition = this.determineMarketPosition(monetizationStatus, operationsStatus);
    const nextActions = this.generateNextActions(insightDashboard);

    return {
      system_health: systemHealth,
      total_revenue: this.totalSystemRevenue,
      active_protocols: operationsStatus.active_protocols,
      knowledge_items: vaultStats.total_items,
      operational_efficiency: parseFloat(operationsStatus.overall_success_rate),
      market_position: marketPosition,
      next_actions: nextActions,
      emergency_mode: this.emergencyMode
    };
  }

  // Calculate overall system health score
  private calculateSystemHealth(vaultStats: any, monetizationStatus: any, operationsStatus: any, insightDashboard: any): number {
    const vaultHealth = Math.min(100, vaultStats.vault_efficiency * 100);
    const revenueHealth = Math.min(100, (monetizationStatus.total_revenue / 100000) * 100);
    const operationsHealth = parseFloat(operationsStatus.overall_success_rate);
    const insightHealth = Math.min(100, insightDashboard.average_confidence);

    return Math.round((vaultHealth + revenueHealth + operationsHealth + insightHealth) / 4);
  }

  // Determine market position
  private determineMarketPosition(monetizationStatus: any, operationsStatus: any): string {
    const revenue = monetizationStatus.total_revenue;
    const efficiency = parseFloat(operationsStatus.overall_success_rate);

    if (revenue > 75000 && efficiency > 90) return "Dominant";
    if (revenue > 50000 && efficiency > 80) return "Leading";
    if (revenue > 25000 && efficiency > 70) return "Competitive";
    if (revenue > 10000 && efficiency > 60) return "Emerging";
    return "Developing";
  }

  // Generate next recommended actions
  private generateNextActions(insightDashboard: any): string[] {
    const actions = [];
    
    if (insightDashboard.latest_report?.urgency === 'critical') {
      actions.push("Execute emergency revenue protocols immediately");
    }
    
    if (this.totalSystemRevenue < 50000) {
      actions.push("Accelerate monetization strategies");
    }
    
    if (insightDashboard.average_confidence < 80) {
      actions.push("Enhance data collection and analysis");
    }
    
    actions.push("Continue autonomous operation optimization");
    
    return actions.slice(0, 5);
  }

  // Create empty report for skipped executions
  private createEmptyReport(): EnsoExecutionReport {
    return {
      execution_id: "skipped",
      timestamp: new Date(),
      modules_executed: [],
      revenue_generated: 0,
      insights_discovered: 0,
      protocols_completed: 0,
      success_rate: 0,
      recommendations: []
    };
  }

  // Get execution statistics
  getExecutionStats(): any {
    return {
      total_executions: this.executionCount,
      total_system_revenue: this.totalSystemRevenue,
      average_revenue_per_execution: this.executionCount > 0 ? 
        Math.round(this.totalSystemRevenue / this.executionCount) : 0,
      emergency_mode_active: this.emergencyMode,
      last_execution: this.lastExecution,
      system_uptime: this.lastExecution ? 
        Math.round((Date.now() - this.lastExecution.getTime()) / 1000) : 0,
      is_running: this.isRunning
    };
  }

  // Emergency system activation
  async emergencyActivation(crisis: string): Promise<EnsoExecutionReport> {
    console.log(`🚨 ENSO EMERGENCY: ${crisis}`);
    
    this.activateEmergencyMode();
    return await this.run();
  }
}

// Export singleton instance
export const atlasEnsoCore = new AtlasEnsoCore();