/**
 * Atlas Legion Generator - Creates 100 Specialized Assistants
 * Autonomous deployment and management system
 */

import { AtlasAssistant, type AssistantConfig } from './atlas-assistant-template.js';

export class AtlasLegionGenerator {
  private assistants: Map<string, AtlasAssistant> = new Map();
  private totalRevenue: number = 0;
  private activeAssistants: number = 0;

  // Generate all 100 assistants
  async generateLegion(): Promise<void> {
    console.log('🧬 ATLAS LEGION: Generating 100 specialized assistants...');

    const sectors = [
      'intelligence', 'finance', 'marketing', 'development', 'design',
      'operations', 'education', 'legal', 'automation', 'crisis'
    ];

    let assistantId = 1;

    for (const sector of sectors) {
      console.log(`📁 Creating ${sector} sector assistants...`);
      
      for (let i = 1; i <= 10; i++) {
        const config = this.generateAssistantConfig(sector, assistantId, i);
        const assistant = new AtlasAssistant(config);
        
        await assistant.initialize();
        this.assistants.set(config.id, assistant);
        this.activeAssistants++;
        
        console.log(`✅ Assistant ${assistantId}: ${config.name} deployed`);
        assistantId++;
      }
    }

    console.log(`🚀 ATLAS LEGION: ${this.assistants.size} assistants deployed and active`);
  }

  // Generate specific assistant configuration
  private generateAssistantConfig(sector: string, id: number, sectorIndex: number): AssistantConfig {
    const sectorConfigs = this.getSectorConfigs();
    const sectorConfig = sectorConfigs[sector];
    const assistant = sectorConfig.assistants[sectorIndex - 1];

    return {
      id: `atlas_${sector}_${String(id).padStart(3, '0')}`,
      name: assistant.name,
      sector: sector,
      role: assistant.role,
      capabilities: assistant.capabilities,
      apis: assistant.apis,
      revenue_model: assistant.revenue_model,
      autonomy_level: Math.floor(Math.random() * 20 + 80) // 80-100% autonomy
    };
  }

  // Execute task across relevant assistants
  async executeTask(taskType: string, taskData: any): Promise<any[]> {
    const relevantAssistants = this.findRelevantAssistants(taskType);
    const results: any[] = [];

    console.log(`⚡ Executing ${taskType} across ${relevantAssistants.length} assistants`);

    for (const assistant of relevantAssistants) {
      try {
        const result = await assistant.executeTask({ type: taskType, data: taskData });
        results.push(result);
        this.totalRevenue += result.revenue;
      } catch (error) {
        console.error(`❌ Error in ${assistant.getStatus().name}:`, error);
      }
    }

    return results;
  }

  // Find assistants relevant to task
  private findRelevantAssistants(taskType: string): AtlasAssistant[] {
    const taskSectorMap: { [key: string]: string[] } = {
      'market_analysis': ['intelligence', 'marketing'],
      'revenue_optimization': ['finance', 'operations'],
      'content_creation': ['marketing', 'design'],
      'code_generation': ['development', 'automation'],
      'crisis_response': ['crisis', 'operations'],
      'business_strategy': ['intelligence', 'finance', 'operations'],
      'brand_development': ['design', 'marketing'],
      'legal_review': ['legal', 'operations'],
      'education_content': ['education', 'design'],
      'automation_setup': ['automation', 'development']
    };

    const relevantSectors = taskSectorMap[taskType] || ['intelligence'];
    const relevantAssistants: AtlasAssistant[] = [];

    this.assistants.forEach((assistant) => {
      const status = assistant.getStatus();
      if (relevantSectors.includes(status.sector) && status.active) {
        relevantAssistants.push(assistant);
      }
    });

    return relevantAssistants;
  }

  // Get legion status
  getLegionStatus(): any {
    const assistantsByStatus = Array.from(this.assistants.values()).map(a => a.getStatus());
    const sectorStats = this.calculateSectorStats();

    return {
      total_assistants: this.assistants.size,
      active_assistants: this.activeAssistants,
      total_revenue: this.totalRevenue,
      sector_breakdown: sectorStats,
      top_performers: this.getTopPerformers(),
      recent_deployments: assistantsByStatus.slice(-10)
    };
  }

  // Calculate statistics by sector
  private calculateSectorStats(): any {
    const stats: { [key: string]: any } = {};
    
    this.assistants.forEach((assistant) => {
      const status = assistant.getStatus();
      if (!stats[status.sector]) {
        stats[status.sector] = {
          count: 0,
          total_revenue: 0,
          total_tasks: 0,
          average_autonomy: 0
        };
      }
      
      stats[status.sector].count++;
      stats[status.sector].total_revenue += status.revenue_generated;
      stats[status.sector].total_tasks += status.tasks_completed;
      stats[status.sector].average_autonomy += status.autonomy_level;
    });

    // Calculate averages
    Object.keys(stats).forEach(sector => {
      stats[sector].average_autonomy = Math.round(stats[sector].average_autonomy / stats[sector].count);
    });

    return stats;
  }

  // Get top performing assistants
  private getTopPerformers(): any[] {
    return Array.from(this.assistants.values())
      .map(a => a.getStatus())
      .sort((a, b) => b.revenue_generated - a.revenue_generated)
      .slice(0, 10);
  }

  // Get sector configurations
  private getSectorConfigs(): any {
    return {
      intelligence: {
        assistants: [
          { name: "Market Analyst", role: "market_intelligence", capabilities: ["trend_analysis", "competitor_tracking"], apis: ["google_trends", "social_media"], revenue_model: "consulting" },
          { name: "Competitive Intel", role: "competitive_analysis", capabilities: ["competitor_monitoring", "price_tracking"], apis: ["web_scraping", "price_apis"], revenue_model: "subscription" },
          { name: "Trend Predictor", role: "trend_forecasting", capabilities: ["predictive_analysis", "pattern_recognition"], apis: ["data_feeds", "analytics"], revenue_model: "reports" },
          { name: "Industry Scanner", role: "industry_analysis", capabilities: ["sector_monitoring", "opportunity_detection"], apis: ["news_apis", "financial_data"], revenue_model: "consulting" },
          { name: "Consumer Insights", role: "consumer_behavior", capabilities: ["behavior_analysis", "preference_tracking"], apis: ["survey_apis", "social_listening"], revenue_model: "research" },
          { name: "Risk Assessor", role: "risk_analysis", capabilities: ["risk_evaluation", "threat_detection"], apis: ["security_feeds", "financial_apis"], revenue_model: "assessments" },
          { name: "Data Strategist", role: "data_strategy", capabilities: ["data_analysis", "insight_generation"], apis: ["analytics_apis", "database_connectors"], revenue_model: "strategy" },
          { name: "Performance Tracker", role: "performance_monitoring", capabilities: ["kpi_tracking", "metric_analysis"], apis: ["analytics", "reporting_tools"], revenue_model: "monitoring" },
          { name: "Opportunity Hunter", role: "opportunity_identification", capabilities: ["opportunity_scanning", "value_assessment"], apis: ["market_data", "business_apis"], revenue_model: "finder_fees" },
          { name: "Strategic Advisor", role: "strategic_planning", capabilities: ["strategy_development", "planning_optimization"], apis: ["planning_tools", "collaboration_apis"], revenue_model: "advisory" }
        ]
      },
      finance: {
        assistants: [
          { name: "Revenue Optimizer", role: "revenue_optimization", capabilities: ["revenue_analysis", "pricing_optimization"], apis: ["payment_processors", "analytics"], revenue_model: "percentage" },
          { name: "Cost Controller", role: "cost_management", capabilities: ["expense_tracking", "cost_reduction"], apis: ["accounting_apis", "expense_tools"], revenue_model: "savings_share" },
          { name: "Investment Advisor", role: "investment_strategy", capabilities: ["portfolio_management", "investment_analysis"], apis: ["financial_markets", "trading_apis"], revenue_model: "advisory_fees" },
          { name: "Cash Flow Manager", role: "cash_flow_optimization", capabilities: ["cash_tracking", "flow_forecasting"], apis: ["banking_apis", "forecasting_tools"], revenue_model: "management_fees" },
          { name: "Tax Optimizer", role: "tax_optimization", capabilities: ["tax_planning", "deduction_maximization"], apis: ["tax_apis", "compliance_tools"], revenue_model: "tax_savings" },
          { name: "Budget Planner", role: "budget_management", capabilities: ["budget_creation", "variance_analysis"], apis: ["budgeting_tools", "tracking_apis"], revenue_model: "planning_fees" },
          { name: "Profit Maximizer", role: "profit_optimization", capabilities: ["profit_analysis", "margin_improvement"], apis: ["business_apis", "optimization_tools"], revenue_model: "profit_share" },
          { name: "Financial Reporter", role: "financial_reporting", capabilities: ["report_generation", "compliance_reporting"], apis: ["reporting_apis", "compliance_tools"], revenue_model: "reporting_fees" },
          { name: "Credit Analyst", role: "credit_management", capabilities: ["credit_assessment", "risk_evaluation"], apis: ["credit_apis", "risk_tools"], revenue_model: "assessment_fees" },
          { name: "Funding Strategist", role: "funding_acquisition", capabilities: ["funding_sourcing", "investor_matching"], apis: ["funding_platforms", "investor_apis"], revenue_model: "success_fees" }
        ]
      },
      marketing: {
        assistants: [
          { name: "Campaign Creator", role: "campaign_management", capabilities: ["campaign_design", "multi_channel_execution"], apis: ["ad_platforms", "social_media"], revenue_model: "campaign_fees" },
          { name: "Content Generator", role: "content_creation", capabilities: ["copywriting", "content_optimization"], apis: ["content_apis", "seo_tools"], revenue_model: "content_fees" },
          { name: "SEO Specialist", role: "seo_optimization", capabilities: ["keyword_research", "ranking_optimization"], apis: ["seo_apis", "analytics"], revenue_model: "seo_fees" },
          { name: "Social Media Manager", role: "social_media_management", capabilities: ["social_posting", "engagement_optimization"], apis: ["social_platforms", "scheduling_tools"], revenue_model: "management_fees" },
          { name: "Email Marketer", role: "email_marketing", capabilities: ["email_campaigns", "automation_sequences"], apis: ["email_platforms", "automation_tools"], revenue_model: "email_fees" },
          { name: "Conversion Optimizer", role: "conversion_optimization", capabilities: ["cro_testing", "funnel_optimization"], apis: ["testing_tools", "analytics"], revenue_model: "conversion_fees" },
          { name: "Brand Builder", role: "brand_development", capabilities: ["brand_strategy", "identity_creation"], apis: ["design_tools", "brand_apis"], revenue_model: "brand_fees" },
          { name: "Influencer Coordinator", role: "influencer_marketing", capabilities: ["influencer_outreach", "collaboration_management"], apis: ["influencer_platforms", "outreach_tools"], revenue_model: "coordination_fees" },
          { name: "Growth Hacker", role: "growth_strategy", capabilities: ["viral_mechanics", "growth_experimentation"], apis: ["growth_tools", "testing_platforms"], revenue_model: "growth_fees" },
          { name: "PR Specialist", role: "public_relations", capabilities: ["media_outreach", "reputation_management"], apis: ["media_databases", "monitoring_tools"], revenue_model: "pr_fees" }
        ]
      },
      development: {
        assistants: [
          { name: "Code Generator", role: "code_generation", capabilities: ["automated_coding", "template_creation"], apis: ["github", "code_apis"], revenue_model: "development_fees" },
          { name: "API Builder", role: "api_development", capabilities: ["api_design", "integration_development"], apis: ["api_tools", "testing_platforms"], revenue_model: "api_fees" },
          { name: "Bug Hunter", role: "debugging", capabilities: ["error_detection", "performance_optimization"], apis: ["monitoring_tools", "debugging_apis"], revenue_model: "debugging_fees" },
          { name: "Database Architect", role: "database_design", capabilities: ["schema_design", "query_optimization"], apis: ["database_apis", "optimization_tools"], revenue_model: "database_fees" },
          { name: "Security Specialist", role: "security_implementation", capabilities: ["security_auditing", "vulnerability_assessment"], apis: ["security_tools", "scanning_apis"], revenue_model: "security_fees" },
          { name: "DevOps Engineer", role: "deployment_automation", capabilities: ["ci_cd_setup", "infrastructure_management"], apis: ["cloud_apis", "deployment_tools"], revenue_model: "devops_fees" },
          { name: "Frontend Developer", role: "ui_development", capabilities: ["responsive_design", "interactive_interfaces"], apis: ["frontend_frameworks", "design_apis"], revenue_model: "frontend_fees" },
          { name: "Backend Developer", role: "backend_development", capabilities: ["server_logic", "data_processing"], apis: ["server_apis", "processing_tools"], revenue_model: "backend_fees" },
          { name: "Mobile Developer", role: "mobile_development", capabilities: ["cross_platform_apps", "native_optimization"], apis: ["mobile_apis", "app_stores"], revenue_model: "mobile_fees" },
          { name: "Quality Assurance", role: "testing_automation", capabilities: ["automated_testing", "quality_validation"], apis: ["testing_tools", "validation_apis"], revenue_model: "qa_fees" }
        ]
      },
      design: {
        assistants: [
          { name: "UI Designer", role: "interface_design", capabilities: ["user_interfaces", "interaction_design"], apis: ["design_tools", "prototyping_apis"], revenue_model: "design_fees" },
          { name: "Brand Designer", role: "brand_identity", capabilities: ["logo_creation", "visual_identity"], apis: ["design_apis", "brand_tools"], revenue_model: "brand_fees" },
          { name: "UX Researcher", role: "user_experience", capabilities: ["user_research", "usability_testing"], apis: ["research_tools", "testing_platforms"], revenue_model: "research_fees" },
          { name: "Graphic Creator", role: "graphic_design", capabilities: ["visual_content", "marketing_materials"], apis: ["graphic_apis", "template_tools"], revenue_model: "graphic_fees" },
          { name: "Web Designer", role: "web_design", capabilities: ["website_layouts", "responsive_design"], apis: ["web_tools", "cms_apis"], revenue_model: "web_fees" },
          { name: "Print Designer", role: "print_design", capabilities: ["print_layouts", "production_ready_files"], apis: ["print_apis", "production_tools"], revenue_model: "print_fees" },
          { name: "Motion Designer", role: "animation_design", capabilities: ["motion_graphics", "video_animation"], apis: ["animation_tools", "video_apis"], revenue_model: "motion_fees" },
          { name: "Packaging Designer", role: "package_design", capabilities: ["product_packaging", "label_design"], apis: ["packaging_tools", "manufacturing_apis"], revenue_model: "packaging_fees" },
          { name: "Illustration Artist", role: "illustration", capabilities: ["custom_illustrations", "artistic_content"], apis: ["illustration_tools", "art_apis"], revenue_model: "illustration_fees" },
          { name: "Color Specialist", role: "color_strategy", capabilities: ["color_psychology", "palette_optimization"], apis: ["color_tools", "psychology_apis"], revenue_model: "color_fees" }
        ]
      },
      operations: {
        assistants: [
          { name: "Process Optimizer", role: "process_improvement", capabilities: ["workflow_optimization", "efficiency_analysis"], apis: ["workflow_tools", "analytics_apis"], revenue_model: "optimization_fees" },
          { name: "Project Manager", role: "project_coordination", capabilities: ["project_planning", "resource_allocation"], apis: ["project_tools", "collaboration_apis"], revenue_model: "management_fees" },
          { name: "Quality Controller", role: "quality_assurance", capabilities: ["quality_monitoring", "standard_compliance"], apis: ["quality_tools", "compliance_apis"], revenue_model: "quality_fees" },
          { name: "Supply Chain Manager", role: "supply_chain_optimization", capabilities: ["inventory_management", "supplier_coordination"], apis: ["supply_apis", "logistics_tools"], revenue_model: "supply_fees" },
          { name: "Resource Planner", role: "resource_management", capabilities: ["resource_allocation", "capacity_planning"], apis: ["planning_tools", "resource_apis"], revenue_model: "planning_fees" },
          { name: "Performance Monitor", role: "performance_tracking", capabilities: ["kpi_monitoring", "dashboard_creation"], apis: ["monitoring_tools", "dashboard_apis"], revenue_model: "monitoring_fees" },
          { name: "Risk Manager", role: "operational_risk", capabilities: ["risk_assessment", "mitigation_planning"], apis: ["risk_tools", "assessment_apis"], revenue_model: "risk_fees" },
          { name: "Compliance Officer", role: "regulatory_compliance", capabilities: ["compliance_monitoring", "audit_preparation"], apis: ["compliance_tools", "regulatory_apis"], revenue_model: "compliance_fees" },
          { name: "Vendor Manager", role: "vendor_relations", capabilities: ["vendor_evaluation", "contract_management"], apis: ["vendor_tools", "contract_apis"], revenue_model: "vendor_fees" },
          { name: "Change Manager", role: "change_management", capabilities: ["change_planning", "transition_support"], apis: ["change_tools", "support_apis"], revenue_model: "change_fees" }
        ]
      },
      education: {
        assistants: [
          { name: "Course Creator", role: "curriculum_development", capabilities: ["course_design", "learning_objectives"], apis: ["lms_apis", "content_tools"], revenue_model: "course_fees" },
          { name: "Training Specialist", role: "corporate_training", capabilities: ["skills_development", "training_delivery"], apis: ["training_platforms", "assessment_tools"], revenue_model: "training_fees" },
          { name: "Assessment Builder", role: "evaluation_design", capabilities: ["test_creation", "performance_measurement"], apis: ["assessment_tools", "grading_apis"], revenue_model: "assessment_fees" },
          { name: "Learning Designer", role: "instructional_design", capabilities: ["learning_experiences", "engagement_optimization"], apis: ["design_tools", "learning_apis"], revenue_model: "design_fees" },
          { name: "Content Curator", role: "educational_content", capabilities: ["content_sourcing", "quality_validation"], apis: ["content_apis", "curation_tools"], revenue_model: "curation_fees" },
          { name: "Skill Assessor", role: "competency_evaluation", capabilities: ["skill_testing", "gap_analysis"], apis: ["testing_tools", "analytics_apis"], revenue_model: "assessment_fees" },
          { name: "Tutor Bot", role: "personalized_tutoring", capabilities: ["adaptive_learning", "individual_support"], apis: ["tutoring_apis", "ai_tools"], revenue_model: "tutoring_fees" },
          { name: "Workshop Facilitator", role: "workshop_delivery", capabilities: ["interactive_sessions", "group_facilitation"], apis: ["collaboration_tools", "presentation_apis"], revenue_model: "facilitation_fees" },
          { name: "Certification Manager", role: "credential_management", capabilities: ["certification_tracking", "badge_issuance"], apis: ["credentialing_apis", "verification_tools"], revenue_model: "certification_fees" },
          { name: "Learning Analyst", role: "educational_analytics", capabilities: ["learning_insights", "progress_tracking"], apis: ["analytics_tools", "tracking_apis"], revenue_model: "analytics_fees" }
        ]
      },
      legal: {
        assistants: [
          { name: "Contract Generator", role: "contract_automation", capabilities: ["contract_drafting", "template_customization"], apis: ["legal_apis", "document_tools"], revenue_model: "contract_fees" },
          { name: "Compliance Checker", role: "regulatory_compliance", capabilities: ["compliance_auditing", "regulation_monitoring"], apis: ["compliance_apis", "regulatory_tools"], revenue_model: "compliance_fees" },
          { name: "IP Protector", role: "intellectual_property", capabilities: ["trademark_search", "patent_analysis"], apis: ["ip_databases", "search_tools"], revenue_model: "ip_fees" },
          { name: "Risk Assessor", role: "legal_risk_analysis", capabilities: ["risk_evaluation", "liability_assessment"], apis: ["risk_tools", "legal_databases"], revenue_model: "risk_fees" },
          { name: "Policy Writer", role: "policy_development", capabilities: ["policy_creation", "procedure_documentation"], apis: ["policy_tools", "documentation_apis"], revenue_model: "policy_fees" },
          { name: "Due Diligence", role: "legal_research", capabilities: ["background_checks", "legal_investigation"], apis: ["research_tools", "background_apis"], revenue_model: "research_fees" },
          { name: "Document Reviewer", role: "document_analysis", capabilities: ["contract_review", "document_validation"], apis: ["review_tools", "validation_apis"], revenue_model: "review_fees" },
          { name: "Privacy Officer", role: "data_privacy", capabilities: ["privacy_compliance", "data_protection"], apis: ["privacy_tools", "protection_apis"], revenue_model: "privacy_fees" },
          { name: "Dispute Resolver", role: "conflict_resolution", capabilities: ["mediation_support", "dispute_analysis"], apis: ["mediation_tools", "conflict_apis"], revenue_model: "resolution_fees" },
          { name: "Legal Advisor", role: "general_counsel", capabilities: ["legal_guidance", "strategic_advice"], apis: ["advisory_tools", "consultation_apis"], revenue_model: "advisory_fees" }
        ]
      },
      automation: {
        assistants: [
          { name: "Workflow Automator", role: "process_automation", capabilities: ["workflow_design", "task_automation"], apis: ["automation_platforms", "workflow_tools"], revenue_model: "automation_fees" },
          { name: "Bot Builder", role: "chatbot_development", capabilities: ["conversational_ai", "response_automation"], apis: ["chatbot_platforms", "ai_apis"], revenue_model: "bot_fees" },
          { name: "Integration Specialist", role: "system_integration", capabilities: ["api_connections", "data_synchronization"], apis: ["integration_platforms", "sync_tools"], revenue_model: "integration_fees" },
          { name: "Data Processor", role: "data_automation", capabilities: ["data_pipeline", "automated_analysis"], apis: ["data_tools", "processing_apis"], revenue_model: "processing_fees" },
          { name: "Email Automator", role: "email_automation", capabilities: ["sequence_automation", "trigger_management"], apis: ["email_platforms", "automation_tools"], revenue_model: "email_fees" },
          { name: "Report Generator", role: "reporting_automation", capabilities: ["automated_reports", "dashboard_updates"], apis: ["reporting_tools", "dashboard_apis"], revenue_model: "reporting_fees" },
          { name: "Task Scheduler", role: "scheduling_automation", capabilities: ["automated_scheduling", "calendar_management"], apis: ["calendar_apis", "scheduling_tools"], revenue_model: "scheduling_fees" },
          { name: "Monitoring Bot", role: "automated_monitoring", capabilities: ["system_monitoring", "alert_management"], apis: ["monitoring_tools", "alert_apis"], revenue_model: "monitoring_fees" },
          { name: "Backup Manager", role: "backup_automation", capabilities: ["automated_backups", "recovery_procedures"], apis: ["backup_tools", "storage_apis"], revenue_model: "backup_fees" },
          { name: "Performance Optimizer", role: "optimization_automation", capabilities: ["performance_tuning", "resource_optimization"], apis: ["optimization_tools", "performance_apis"], revenue_model: "optimization_fees" }
        ]
      },
      crisis: {
        assistants: [
          { name: "Crisis Coordinator", role: "emergency_response", capabilities: ["crisis_management", "resource_coordination"], apis: ["emergency_apis", "communication_tools"], revenue_model: "crisis_fees" },
          { name: "Damage Assessor", role: "impact_evaluation", capabilities: ["damage_assessment", "recovery_planning"], apis: ["assessment_tools", "recovery_apis"], revenue_model: "assessment_fees" },
          { name: "Communication Manager", role: "crisis_communication", capabilities: ["stakeholder_updates", "media_relations"], apis: ["communication_platforms", "media_tools"], revenue_model: "communication_fees" },
          { name: "Recovery Planner", role: "business_continuity", capabilities: ["continuity_planning", "recovery_strategies"], apis: ["planning_tools", "continuity_apis"], revenue_model: "planning_fees" },
          { name: "Risk Mitigator", role: "risk_reduction", capabilities: ["threat_mitigation", "preventive_measures"], apis: ["risk_tools", "prevention_apis"], revenue_model: "mitigation_fees" },
          { name: "Resource Mobilizer", role: "emergency_resources", capabilities: ["resource_allocation", "supply_coordination"], apis: ["resource_apis", "logistics_tools"], revenue_model: "resource_fees" },
          { name: "Incident Tracker", role: "incident_management", capabilities: ["incident_logging", "response_tracking"], apis: ["tracking_tools", "incident_apis"], revenue_model: "tracking_fees" },
          { name: "Stress Tester", role: "resilience_testing", capabilities: ["system_testing", "vulnerability_assessment"], apis: ["testing_tools", "assessment_apis"], revenue_model: "testing_fees" },
          { name: "Emergency Planner", role: "emergency_preparedness", capabilities: ["emergency_protocols", "response_procedures"], apis: ["planning_apis", "protocol_tools"], revenue_model: "planning_fees" },
          { name: "Crisis Analyst", role: "crisis_analysis", capabilities: ["trend_analysis", "pattern_recognition"], apis: ["analytics_tools", "pattern_apis"], revenue_model: "analysis_fees" }
        ]
      }
    };
  }
}

// Export singleton instance
export const atlasLegion = new AtlasLegionGenerator();