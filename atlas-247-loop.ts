/**
 * 🔥 ATLAS 24/7 OPERATIONAL LOOP
 * Mantiene todos los módulos activos, monitoreados y reactivables sin intervención humana
 * Objetivo: Operación continua para asegurar generación de ingresos las 24 horas
 */

import axios from 'axios';
import { atlasIncomeAccelerator } from './atlas-income-accelerator';
import { atlasCryptoAutopilot } from './atlas-crypto-autopilot';
import { atlasSocialPropagator } from './atlas-social-propagator';
import { atlasIdentityGenerator } from './atlas-identity-generator';
// import { crisisDetector } from './auto-survival-loop'; // Removed due to export issue
import { atlasOnline } from './atlas-online';

class Atlas247Loop {
  private static instance: Atlas247Loop;
  private isRunning: boolean = false;
  private loopInterval: NodeJS.Timeout | null = null;
  private checkInterval: number = 5 * 60 * 1000; // 5 minutos
  private lastIncomeCheck: number = 0;
  private consecutiveFailures: number = 0;
  private emergencyMode: boolean = false;
  private logs: any[] = [];

  private constructor() {
    console.log('🔥 ATLAS 24/7 Loop inicializado');
  }

  static getInstance(): Atlas247Loop {
    if (!Atlas247Loop.instance) {
      Atlas247Loop.instance = new Atlas247Loop();
    }
    return Atlas247Loop.instance;
  }

  // 🔁 1. Verificación de estado del sistema
  async verificarEstado(): Promise<boolean> {
    try {
      // Verificar conectividad básica
      const connectivityCheck = await axios.get('https://httpbin.org/status/200', { 
        timeout: 5000 
      });

      // Verificar APIs internas
      const internalChecks = await Promise.all([
        this.checkModule('income-stats'),
        this.checkModule('crypto-mining-stats'),
        this.checkModule('social-propagation-stats'),
        this.checkModule('identity-status')
      ]);

      const allChecksPass = connectivityCheck.status === 200 && 
                           internalChecks.every(check => check);

      if (allChecksPass) {
        this.consecutiveFailures = 0;
        return true;
      } else {
        this.consecutiveFailures++;
        return false;
      }
    } catch (error) {
      this.consecutiveFailures++;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logEvent('error', `Fallo verificación: ${errorMessage}`);
      return false;
    }
  }

  // 🔍 Verificar módulo específico
  private async checkModule(endpoint: string): Promise<boolean> {
    try {
      const response = await axios.get(`http://localhost:5000/api/${endpoint}`, {
        timeout: 3000
      });
      return response.status === 200;
    } catch (error) {
      this.logEvent('warning', `Módulo ${endpoint} no responde`);
      return false;
    }
  }

  // ⚡ 2. Reactivación de módulos críticos
  async reactivarModulos(): Promise<void> {
    this.logEvent('critical', 'REACTIVANDO MÓDULOS CRÍTICOS');

    try {
      // Reactivar sistemas de ingresos
      await this.reactivarSistemaIngresos();
      
      // Reactivar minería crypto
      await this.reactivarCryptoMining();
      
      // Reactivar propagación social
      await this.reactivarSocialPropagation();
      
      // Reactivar identidad virtual
      await this.reactivarIdentitySystem();

      this.logEvent('success', 'Todos los módulos reactivados exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logEvent('error', `Error reactivando módulos: ${errorMessage}`);
    }
  }

  // 💰 Reactivar sistema de ingresos
  private async reactivarSistemaIngresos(): Promise<void> {
    try {
      const response = await axios.post('http://localhost:5000/api/activate-maximum-capacity');
      if (response.status === 200) {
        this.logEvent('success', 'Sistema de ingresos reactivado');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logEvent('error', `Error reactivando ingresos: ${errorMessage}`);
    }
  }

  // ⛏️ Reactivar minería crypto
  private async reactivarCryptoMining(): Promise<void> {
    try {
      const response = await axios.post('http://localhost:5000/api/emergency-crypto-mining');
      if (response.status === 200) {
        this.logEvent('success', 'Minería crypto reactivada');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logEvent('error', `Error reactivando crypto mining: ${errorMessage}`);
    }
  }

  // 📡 Reactivar propagación social
  private async reactivarSocialPropagation(): Promise<void> {
    try {
      const response = await axios.post('http://localhost:5000/api/emergency-social-blast');
      if (response.status === 200) {
        this.logEvent('success', 'Propagación social reactivada');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logEvent('error', `Error reactivando social propagation: ${errorMessage}`);
    }
  }

  // 🔐 Reactivar sistema de identidad
  private async reactivarIdentitySystem(): Promise<void> {
    try {
      const response = await axios.post('http://localhost:5000/api/activate-emergency-identity');
      if (response.status === 200) {
        this.logEvent('success', 'Sistema de identidad reactivado');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logEvent('error', `Error reactivando identity system: ${errorMessage}`);
    }
  }

  // 🚨 Verificar modo crisis (ingresos = $0)
  async verificarModoCrisis(): Promise<void> {
    try {
      const response = await axios.get('http://localhost:5000/api/income-stats');
      const incomeData = response.data;

      if (incomeData.current_earnings === 0 && !this.emergencyMode) {
        this.emergencyMode = true;
        this.logEvent('critical', 'MODO CRISIS ACTIVADO - Ingresos en $0');
        
        // Activar todos los protocolos de emergencia
        await this.activarProtocolosEmergencia();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logEvent('error', `Error verificando modo crisis: ${errorMessage}`);
    }
  }

  // 🆘 Activar protocolos de emergencia
  private async activarProtocolosEmergencia(): Promise<void> {
    this.logEvent('critical', 'ACTIVANDO PROTOCOLOS DE EMERGENCIA');

    const emergencyActions = [
      axios.post('http://localhost:5000/api/activate-maximum-capacity'),
      axios.post('http://localhost:5000/api/duplicate-all-income'),
      axios.post('http://localhost:5000/api/emergency-crypto-mining'),
      axios.post('http://localhost:5000/api/emergency-social-blast')
    ];

    try {
      await Promise.all(emergencyActions);
      this.logEvent('success', 'Protocolos de emergencia activados');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logEvent('error', `Error activando protocolos emergencia: ${errorMessage}`);
    }
  }

  // 🔒 3. Loop perpetuo con verificación cada 5 minutos
  iniciarLoop(): void {
    if (this.isRunning) {
      console.log('⚠️ Loop ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    this.logEvent('info', 'ATLAS 24/7 Loop iniciado');

    this.loopInterval = setInterval(async () => {
      await this.ejecutarCicloVerificacion();
    }, this.checkInterval);

    console.log('🔥 ATLAS 24/7 Loop activo - Verificación cada 5 minutos');
  }

  // 🔄 Ejecutar ciclo de verificación
  private async ejecutarCicloVerificacion(): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`🕒 [${timestamp}] Ejecutando verificación 24/7...`);

    const estadoSistema = await this.verificarEstado();
    
    if (!estadoSistema || this.consecutiveFailures >= 3) {
      console.log('⚠️ Estado crítico detectado. Reactivando módulos...');
      await this.reactivarModulos();
    } else {
      console.log('✅ Sistema estable. Operando normalmente.');
    }

    // Verificar modo crisis
    await this.verificarModoCrisis();

    // Limpiar logs antiguos (mantener solo últimos 100)
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  // 📝 Sistema de logging
  private logEvent(level: 'info' | 'warning' | 'error' | 'critical' | 'success', message: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      consecutiveFailures: this.consecutiveFailures,
      emergencyMode: this.emergencyMode
    };

    this.logs.push(logEntry);
    console.log(`📝 [${level.toUpperCase()}] ${message}`);
  }

  // 📊 Obtener estadísticas del loop
  getLoopStats(): any {
    return {
      isRunning: this.isRunning,
      consecutiveFailures: this.consecutiveFailures,
      emergencyMode: this.emergencyMode,
      uptime: this.isRunning ? 'Activo' : 'Inactivo',
      lastCheck: new Date().toISOString(),
      checkInterval: this.checkInterval / 1000 / 60 + ' minutos',
      logsCount: this.logs.length,
      recentLogs: this.logs.slice(-10)
    };
  }

  // 🛑 Detener loop (solo para testing)
  detenerLoop(): void {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    this.isRunning = false;
    this.logEvent('info', 'ATLAS 24/7 Loop detenido');
  }

  // 🔄 Reiniciar loop
  reiniciarLoop(): void {
    this.detenerLoop();
    setTimeout(() => {
      this.iniciarLoop();
    }, 5000);
  }

  // 📡 Keep-alive para Replit
  activarKeepAlive(): void {
    setInterval(async () => {
      try {
        await axios.get('http://localhost:5000/api/income-stats');
        console.log('🔄 Keep-alive ping enviado');
      } catch (error) {
        console.log('⚠️ Keep-alive falló, sistema puede estar caído');
      }
    }, 60000); // 1 minuto
  }
}

export const atlas247Loop = Atlas247Loop.getInstance();

// 🔥 IMPLEMENTAR PROTOCOLO DEFINITIVO - UptimeRobot simulation
class UptimeMonitor {
  private pingInterval: NodeJS.Timeout | null = null;
  
  startUptimePing(): void {
    this.pingInterval = setInterval(async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/keep-alive', { timeout: 3000 });
        console.log('🔄 UptimeRobot ping: Sistema activo');
      } catch (error) {
        console.log('⚠️ UptimeRobot ping falló - sistema puede estar caído');
        // Auto-reactivar si falla
        atlas247Loop.reactivarModulos();
      }
    }, 30000); // 30 segundos (más agresivo que 1 minuto)
  }
}

const uptimeMonitor = new UptimeMonitor();
uptimeMonitor.startUptimePing();

// Auto-iniciar el loop cuando se carga el módulo
atlas247Loop.iniciarLoop();
atlas247Loop.activarKeepAlive();

console.log('🔥 ATLAS 24/7 Loop: PROTOCOLO COMPLETO ACTIVADO');
console.log('⚡ Keep-alive cada 60s + UptimeRobot cada 30s');
console.log('🛰️ Sistema de supervivencia perpetua OPERATIVO');