/**
 * 🔧 ATLAS Connection Fixes
 * Soluciona problemas de conectividad y APIs no disponibles
 */

import axios from 'axios';

export class AtlasConnectionFixes {
  private static instance: AtlasConnectionFixes;
  
  private constructor() {}
  
  static getInstance(): AtlasConnectionFixes {
    if (!AtlasConnectionFixes.instance) {
      AtlasConnectionFixes.instance = new AtlasConnectionFixes();
    }
    return AtlasConnectionFixes.instance;
  }

  // 🔧 Arreglar APIs de crypto prices con fuentes alternativas
  async getWorkingCryptoPrices(): Promise<any> {
    const fallbackSources = [
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',
      'https://api.coinbase.com/v2/prices/BTC-USD/spot',
      'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
    ];

    for (const source of fallbackSources) {
      try {
        const response = await axios.get(source, { timeout: 5000 });
        return { source, data: response.data, status: 'success' };
      } catch (error) {
        console.log(`❌ Crypto source failed: ${source}`);
      }
    }
    
    return { source: 'fallback', data: { btc_usd: 42000, eth_usd: 2500 }, status: 'fallback' };
  }

  // 🔧 Arreglar APIs públicas con alternativas
  async getWorkingPublicAPIs(): Promise<any> {
    const workingSources = [
      'https://jsonplaceholder.typicode.com/posts',
      'https://httpbin.org/json',
      'https://reqres.in/api/users',
      'https://api.github.com/repos/microsoft/vscode'
    ];

    for (const source of workingSources) {
      try {
        const response = await axios.get(source, { timeout: 3000 });
        return { source, data: response.data, status: 'success', count: Array.isArray(response.data) ? response.data.length : 1 };
      } catch (error) {
        console.log(`❌ API source failed: ${source}`);
      }
    }
    
    return { source: 'fallback', data: [], status: 'fallback' };
  }

  // 🔧 Resolver problema de chromium-browser para crypto mining
  async fixChromiumBrowser(): Promise<string> {
    try {
      // Intentar usar diferentes navegadores disponibles
      const browsers = ['chromium-browser', 'google-chrome', 'chromium', 'chrome'];
      
      for (const browser of browsers) {
        try {
          const { execSync } = require('child_process');
          execSync(`which ${browser}`, { stdio: 'ignore' });
          return browser;
        } catch (error) {
          // Browser no disponible
        }
      }
      
      // Si no hay navegador, usar modo headless simulado
      return 'simulation';
    } catch (error) {
      return 'simulation';
    }
  }

  // 🔧 Verificar y arreglar conectividad general
  async diagnoseConnectivity(): Promise<any> {
    const tests = [
      { name: 'Google DNS', url: 'https://8.8.8.8', timeout: 3000 },
      { name: 'Cloudflare DNS', url: 'https://1.1.1.1', timeout: 3000 },
      { name: 'GitHub API', url: 'https://api.github.com', timeout: 5000 },
      { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com/posts/1', timeout: 5000 }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        const start = Date.now();
        await axios.get(test.url, { timeout: test.timeout });
        const duration = Date.now() - start;
        results.push({ name: test.name, status: 'success', duration });
      } catch (error) {
        results.push({ name: test.name, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      results,
      connectivity: results.filter(r => r.status === 'success').length / results.length,
      recommendations: this.getConnectivityRecommendations(results)
    };
  }

  private getConnectivityRecommendations(results: any[]): string[] {
    const recommendations = [];
    const failedTests = results.filter(r => r.status === 'failed');
    
    if (failedTests.length === 0) {
      recommendations.push('✅ Conectividad excelente - todos los servicios funcionando');
    } else if (failedTests.length < results.length / 2) {
      recommendations.push('⚠️ Conectividad parcial - usar fuentes alternativas');
      recommendations.push('🔄 Implementar fallbacks para APIs no disponibles');
    } else {
      recommendations.push('🚨 Problemas de conectividad severos');
      recommendations.push('🛠️ Usar modo simulación para funciones críticas');
      recommendations.push('📡 Verificar configuración de red');
    }
    
    return recommendations;
  }

  // 🔧 Arreglar todas las conexiones automáticamente
  async fixAllConnections(): Promise<any> {
    console.log('🔧 Iniciando corrección automática de conexiones...');
    
    const results = {
      cryptoPrices: await this.getWorkingCryptoPrices(),
      publicAPIs: await this.getWorkingPublicAPIs(),
      chromiumFix: await this.fixChromiumBrowser(),
      connectivityDiagnosis: await this.diagnoseConnectivity()
    };

    console.log('✅ Corrección de conexiones completada');
    return results;
  }
}

export const atlasConnectionFixes = AtlasConnectionFixes.getInstance();