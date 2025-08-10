// Crisis Detector - Monitors income and triggers autonomous actions
// No external dependencies, pure JavaScript detection

export class CrisisDetector {
  private static instance: CrisisDetector;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastIncome: number = 0;
  private crisisThreshold: number = 0;
  private consecutiveZeroChecks: number = 0;

  static getInstance(): CrisisDetector {
    if (!CrisisDetector.instance) {
      CrisisDetector.instance = new CrisisDetector();
    }
    return CrisisDetector.instance;
  }

  // 🔍 Iniciar monitoreo automático
  startMonitoring(): void {
    console.log('🔍 Crisis Detector: Starting autonomous monitoring...');
    
    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.performCrisisCheck();
    }, 5 * 60 * 1000);

    // Perform immediate check
    this.performCrisisCheck();
  }

  // 🚨 Verificar estado de crisis
  async performCrisisCheck(): Promise<boolean> {
    try {
      // Simulate real income check (in real app, this would check actual metrics)
      const currentIncome = await this.getCurrentIncome();
      
      if (currentIncome <= this.crisisThreshold) {
        this.consecutiveZeroChecks++;
        
        // Trigger crisis mode after 2 consecutive zero checks (10 minutes)
        if (this.consecutiveZeroChecks >= 2) {
          await this.triggerCrisisProtocol(currentIncome);
          return true;
        }
      } else {
        this.consecutiveZeroChecks = 0;
      }

      this.lastIncome = currentIncome;
      return false;
      
    } catch (error) {
      console.error('❌ Crisis check failed:', error);
      return false;
    }
  }

  // 💰 Obtener ingresos actuales (método simulado)
  private async getCurrentIncome(): Promise<number> {
    // In real implementation, this would check:
    // - Stripe dashboard
    // - PayPal balance
    // - Bank account
    // - Revenue dashboard
    
    // For now, simulate based on time of day and other factors
    const hour = new Date().getHours();
    const random = Math.random();
    
    // Simulate crisis conditions (low income hours)
    if (hour >= 2 && hour <= 6 && random < 0.7) {
      return 0; // Crisis trigger
    }
    
    // Simulate some income
    return Math.floor(random * 100);
  }

  // 🚨 Activar protocolo de crisis
  private async triggerCrisisProtocol(income: number): Promise<void> {
    console.log(`🚨 CRISIS PROTOCOL TRIGGERED - Income: $${income}`);
    
    try {
      // Import auto-survival loop dynamically
      const { autoSurvivalLoop } = await import('./auto-survival-loop.js');
      
      // Trigger autonomous activation
      const isCrisis = autoSurvivalLoop.detectCriticalState(income);
      
      if (isCrisis) {
        console.log('✅ Auto-Survival Loop activated successfully');
        
        // Log crisis event
        this.logCrisisEvent(income);
        
        // Reset consecutive checks after successful activation
        this.consecutiveZeroChecks = 0;
      }
      
    } catch (error) {
      console.error('❌ Failed to trigger crisis protocol:', error);
    }
  }

  // 📝 Registrar evento de crisis
  private logCrisisEvent(income: number): void {
    const crisisLog = {
      timestamp: new Date().toISOString(),
      trigger: 'ZERO_INCOME_DETECTED',
      income: income,
      consecutiveChecks: this.consecutiveZeroChecks,
      actionTaken: 'AUTO_SURVIVAL_LOOP_ACTIVATED',
      autonomousResponse: true
    };

    console.log('📝 Crisis Event Logged:', crisisLog);
    
    // In real app, this would save to database or file
    // For now, we'll store in memory
    if (!global.crisisEvents) {
      global.crisisEvents = [];
    }
    global.crisisEvents.push(crisisLog);
  }

  // 📊 Obtener estadísticas del detector
  getDetectorStats(): any {
    return {
      monitoring: !!this.checkInterval,
      lastIncome: this.lastIncome,
      consecutiveZeroChecks: this.consecutiveZeroChecks,
      crisisThreshold: this.crisisThreshold,
      eventsLogged: global.crisisEvents?.length || 0,
      autonomousMode: true,
      nextCheck: this.checkInterval ? '5 minutes' : 'Not scheduled'
    };
  }

  // 🛑 Detener monitoreo
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 Crisis Detector: Monitoring stopped');
    }
  }

  // 🔄 Reiniciar detector
  reset(): void {
    this.stopMonitoring();
    this.lastIncome = 0;
    this.consecutiveZeroChecks = 0;
    global.crisisEvents = [];
    console.log('🔄 Crisis Detector: Reset completed');
  }
}

export const crisisDetector = CrisisDetector.getInstance();