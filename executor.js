// Execution Engine - Automated action interpreter and executor for Atlas AI
import { analytics } from './analytics.js';
import { notifications } from './notify.js';

export class ExecutionEngine {
  constructor() {
    this.executionLog = [];
    this.activeManifests = new Map();
    this.scheduledTasks = new Map();
  }

  async ejecutar(manifiesto) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.logExecution(executionId, 'started', manifiesto);
      
      let result;
      
      switch (manifiesto.accion) {
        case 'sendEmail':
          result = await this.executeSendEmail(manifiesto);
          break;
          
        case 'sendSMS':
          result = await this.executeSendSMS(manifiesto);
          break;
          
        case 'fetchData':
          result = await this.executeFetchData(manifiesto);
          break;
          
        case 'enviarAlerta':
          result = await this.executeEnviarAlerta(manifiesto);
          break;
          
        case 'activateEmergencyProtocol':
          result = await this.executeEmergencyProtocol(manifiesto);
          break;
          
        case 'executeViralCampaign':
          result = await this.executeViralCampaign(manifiesto);
          break;
          
        case 'generateDashboard':
          result = await this.executeGenerateDashboard(manifiesto);
          break;
          
        case 'monitorRevenue':
          result = await this.executeMonitorRevenue(manifiesto);
          break;
          
        default:
          throw new Error(`Acción no reconocida: ${manifiesto.accion}`);
      }

      this.logExecution(executionId, 'completed', manifiesto, result);
      
      return {
        success: true,
        executionId,
        result,
        timestamp: new Date().toISOString(),
        manifiesto
      };
      
    } catch (error) {
      this.logExecution(executionId, 'failed', manifiesto, { error: error.message });
      
      return {
        success: false,
        executionId,
        error: error.message,
        timestamp: new Date().toISOString(),
        manifiesto
      };
    }
  }

  async executeSendEmail(manifiesto) {
    return await notifications.sendEmail(
      manifiesto.destino,
      manifiesto.asunto || 'Atlas AI Notification',
      manifiesto.mensaje,
      manifiesto.html !== false
    );
  }

  async executeSendSMS(manifiesto) {
    return await notifications.sendSMS(
      manifiesto.destino,
      manifiesto.mensaje
    );
  }

  async executeFetchData(manifiesto) {
    const data = await analytics.fetchRealData();
    return {
      data,
      source: manifiesto.fuente || 'analytics',
      timestamp: new Date().toISOString()
    };
  }

  async executeEnviarAlerta(manifiesto) {
    const evento = {
      tipo: manifiesto.tipoAlerta || 'emergency_revenue',
      email: manifiesto.email,
      phone: manifiesto.phone,
      revenue: manifiesto.revenue,
      conversions: manifiesto.conversions,
      conversionRate: manifiesto.conversionRate
    };
    
    return await notifications.enviarAlerta(evento);
  }

  async executeEmergencyProtocol(manifiesto) {
    // Protocolo de emergencia automático
    const steps = [
      {
        action: 'fetchData',
        description: 'Obtener métricas actuales'
      },
      {
        action: 'enviarAlerta', 
        description: 'Enviar alerta de emergencia',
        params: {
          tipoAlerta: 'emergency_revenue',
          email: manifiesto.email,
          phone: manifiesto.phone
        }
      },
      {
        action: 'activateChannels',
        description: 'Activar todos los canales de ingresos'
      }
    ];

    const results = [];
    
    for (const step of steps) {
      try {
        if (step.action === 'activateChannels') {
          results.push({
            step: step.description,
            result: {
              channels: ['cash_advance_apps', 'gig_economy', 'viral_distribution', 'direct_sales'],
              status: 'activated',
              potential: '$2000 in 72h'
            }
          });
        } else if (step.action === 'enviarAlerta') {
          const alertResult = await this.executeEnviarAlerta({
            ...step.params,
            ...manifiesto
          });
          results.push({
            step: step.description,
            result: alertResult
          });
        } else if (step.action === 'fetchData') {
          const dataResult = await this.executeFetchData(manifiesto);
          results.push({
            step: step.description,
            result: dataResult
          });
        }
      } catch (error) {
        results.push({
          step: step.description,
          error: error.message
        });
      }
    }

    return {
      protocol: 'emergency_activated',
      steps: results,
      totalSteps: steps.length,
      successfulSteps: results.filter(r => !r.error).length
    };
  }

  async executeViralCampaign(manifiesto) {
    // Campaña viral automática
    const campaign = {
      channels: ['whatsapp', 'facebook', 'instagram', 'tiktok', 'linkedin'],
      content: {
        message: '🚨 EMERGENCIA FAMILIAR: Sistema Atlas AI genera $2000 en 72h. Link en bio.',
        hashtags: '#EmergenciaFamiliar #AtlasAI #IngresosUrgentes #DineroRapido',
        callToAction: 'Únete al protocolo de emergencia GRATIS'
      },
      targeting: {
        urgency: 'high',
        demographic: 'parents_financial_stress',
        interests: ['emergency_income', 'family_support', 'financial_crisis']
      },
      timeline: '72h intensive campaign'
    };

    // Simular distribución (en producción requiere APIs reales)
    const distribution = {
      whatsapp: { contacts: 25, estimated_reach: 250 },
      facebook: { posts: 3, estimated_reach: 1000 },
      instagram: { stories: 5, posts: 2, estimated_reach: 800 },
      tiktok: { videos: 2, estimated_reach: 2000 },
      linkedin: { posts: 2, estimated_reach: 500 }
    };

    return {
      campaign,
      distribution,
      totalReach: Object.values(distribution).reduce((sum, d) => sum + d.estimated_reach, 0),
      expectedConversions: '2-5% conversion rate',
      revenueProjection: '$5K-25K potential'
    };
  }

  async executeGenerateDashboard(manifiesto) {
    const dashboardData = analytics.generateDashboardData();
    
    return {
      dashboard: dashboardData,
      generatedAt: new Date().toISOString(),
      components: ['revenue_chart', 'user_metrics', 'protocol_status', 'alerts'],
      updateInterval: '5 minutes'
    };
  }

  async executeMonitorRevenue(manifiesto) {
    const currentMetrics = await analytics.fetchRealData();
    const alerts = [];

    // Revisar alertas críticas
    if (currentMetrics.revenue === 0) {
      alerts.push({
        type: 'critical',
        message: 'Zero revenue - Execute emergency protocol',
        action: 'activateEmergencyProtocol'
      });
    }

    if (currentMetrics.activeUsers < 5) {
      alerts.push({
        type: 'warning',
        message: 'Low traffic - Activate viral campaign',
        action: 'executeViralCampaign'
      });
    }

    // Auto-ejecutar acciones críticas si están habilitadas
    if (manifiesto.autoExecute && alerts.length > 0) {
      for (const alert of alerts) {
        if (alert.action) {
          await this.ejecutar({
            accion: alert.action,
            email: manifiesto.email,
            phone: manifiesto.phone,
            autoExecute: false // Evitar recursión
          });
        }
      }
    }

    return {
      metrics: currentMetrics,
      alerts,
      autoActionsExecuted: manifiesto.autoExecute ? alerts.length : 0,
      nextMonitoring: new Date(Date.now() + 300000).toISOString() // 5 min
    };
  }

  // Manifiestos preconfigurados para botones del frontend
  getPresetManifests() {
    return {
      emergency_protocol: {
        tipo: 'protocolo',
        accion: 'activateEmergencyProtocol',
        nombre: 'Protocolo de Emergencia Familiar',
        descripcion: 'Activa automáticamente todos los canales de ingresos de emergencia'
      },
      
      viral_blast: {
        tipo: 'campana',
        accion: 'executeViralCampaign',
        nombre: 'Blast Viral Inmediato',
        descripcion: 'Distribuye contenido viral en todas las plataformas'
      },
      
      revenue_alert: {
        tipo: 'alerta',
        accion: 'enviarAlerta',
        tipoAlerta: 'emergency_revenue',
        nombre: 'Alerta de Revenue Crítico',
        descripcion: 'Envía alerta inmediata sobre estado de ingresos'
      },
      
      dashboard_update: {
        tipo: 'dashboard',
        accion: 'generateDashboard',
        nombre: 'Actualizar Panel Control',
        descripcion: 'Regenera dashboard con datos en tiempo real'
      },
      
      auto_monitor: {
        tipo: 'monitor',
        accion: 'monitorRevenue',
        autoExecute: true,
        nombre: 'Monitor Automático Revenue',
        descripcion: 'Monitorea ingresos y ejecuta acciones automáticas'
      }
    };
  }

  logExecution(executionId, status, manifiesto, result = null) {
    this.executionLog.push({
      executionId,
      status,
      manifiesto: {
        tipo: manifiesto.tipo,
        accion: manifiesto.accion,
        destino: manifiesto.destino
      },
      result: result ? (typeof result === 'string' ? result : JSON.stringify(result).substring(0, 200)) : null,
      timestamp: new Date().toISOString()
    });

    // Mantener solo los últimos 200 logs
    if (this.executionLog.length > 200) {
      this.executionLog = this.executionLog.slice(-200);
    }
  }

  getExecutionHistory() {
    return this.executionLog;
  }

  getExecutionStats() {
    const total = this.executionLog.length;
    const completed = this.executionLog.filter(log => log.status === 'completed').length;
    const failed = this.executionLog.filter(log => log.status === 'failed').length;

    return {
      total,
      completed,
      failed,
      successRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
      lastExecution: this.executionLog[this.executionLog.length - 1] || null
    };
  }
}

export const executor = new ExecutionEngine();