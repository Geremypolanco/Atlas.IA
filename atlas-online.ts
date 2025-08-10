// ATLAS Online - Activación de Internet Autónoma
// Conexión directa a datos del mundo real sin APIs de pago

import axios from 'axios';

export class AtlasOnline {
  private static instance: AtlasOnline;
  private connectionActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private dataCache: Map<string, any> = new Map();
  private lastUpdate: Date = new Date();

  static getInstance(): AtlasOnline {
    if (!AtlasOnline.instance) {
      AtlasOnline.instance = new AtlasOnline();
    }
    return AtlasOnline.instance;
  }

  // 🌐 Fuentes de datos gratuitas y públicas
  private readonly fuentesGratis = [
    {
      name: 'public_apis',
      url: 'https://api.publicapis.org/entries',
      description: 'Lista de APIs públicas disponibles',
      type: 'apis'
    },
    {
      name: 'population_data',
      url: 'https://datausa.io/api/data?drilldowns=Nation&measures=Population',
      description: 'Datos de población en tiempo real',
      type: 'demographics'
    },
    {
      name: 'crypto_prices',
      url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
      description: 'Precios de Bitcoin en tiempo real',
      type: 'financial'
    },
    {
      name: 'json_placeholder',
      url: 'https://jsonplaceholder.typicode.com/posts',
      description: 'Datos de prueba para desarrollo',
      type: 'testing'
    },
    {
      name: 'github_trending',
      url: 'https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars&order=desc',
      description: 'Repositorios trending en GitHub',
      type: 'tech'
    },
    {
      name: 'news_headlines',
      url: 'https://saurav.tech/NewsAPI/top-headlines/category/technology/us.json',
      description: 'Noticias de tecnología',
      type: 'news'
    },
    {
      name: 'weather_global',
      url: 'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true',
      description: 'Clima en tiempo real',
      type: 'weather'
    },
    {
      name: 'market_status',
      url: 'https://api.exchangerate-api.com/v4/latest/USD',
      description: 'Tasas de cambio en tiempo real',
      type: 'financial'
    }
  ];

  // 📡 Probar conexión a internet
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get('https://httpbin.org/ip', { timeout: 5000 });
      this.connectionActive = response.status === 200;
      return this.connectionActive;
    } catch (error) {
      this.connectionActive = false;
      return false;
    }
  }

  // 🚀 Iniciar monitoreo autónomo
  startAutonomousMonitoring(): void {
    console.log('🌐 ATLAS Online: Iniciando monitoreo autónomo de internet...');
    
    // Monitoreo cada 60 segundos
    this.monitoringInterval = setInterval(async () => {
      await this.performDataCollection();
    }, 60 * 1000);

    // Ejecución inmediata
    this.performDataCollection();
  }

  // 🔍 Realizar recolección de datos
  private async performDataCollection(): Promise<void> {
    const isConnected = await this.testConnection();
    
    if (!isConnected) {
      console.log('⚠️ ATLAS Online: Sin conexión... esperando reconexión.');
      return;
    }

    console.log('✅ ATLAS Online: Conexión activa - recolectando datos...');
    
    // Procesar todas las fuentes en paralelo
    const promises = this.fuentesGratis.map(fuente => this.collectFromSource(fuente));
    const results = await Promise.allSettled(promises);
    
    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
      } else {
        console.log(`❌ Error en fuente: ${this.fuentesGratis[index].name}`);
      }
    });

    this.lastUpdate = new Date();
    console.log(`📊 ATLAS Online: ${successCount}/${this.fuentesGratis.length} fuentes actualizadas`);
  }

  // 📥 Recolectar datos de una fuente específica
  private async collectFromSource(fuente: any): Promise<void> {
    try {
      const response = await axios.get(fuente.url, { timeout: 10000 });
      
      // Almacenar datos en cache
      this.dataCache.set(fuente.name, {
        data: response.data,
        timestamp: new Date().toISOString(),
        source: fuente.url,
        type: fuente.type,
        description: fuente.description
      });

      console.log(`✅ Datos recolectados de: ${fuente.name}`);
      
      // Procesar datos según el tipo
      await this.processDataByType(fuente.name, fuente.type, response.data);
      
    } catch (error) {
      console.log(`❌ Error recolectando de ${fuente.name}:`, error.message);
      throw error;
    }
  }

  // 🧠 Procesar datos según tipo
  private async processDataByType(name: string, type: string, data: any): Promise<void> {
    try {
      switch (type) {
        case 'financial':
          await this.processFinancialData(name, data);
          break;
        case 'news':
          await this.processNewsData(name, data);
          break;
        case 'tech':
          await this.processTechData(name, data);
          break;
        case 'weather':
          await this.processWeatherData(name, data);
          break;
        case 'apis':
          await this.processApiData(name, data);
          break;
        default:
          await this.processGenericData(name, data);
      }
    } catch (error) {
      console.log(`❌ Error procesando datos ${name}:`, error.message);
    }
  }

  // 💰 Procesar datos financieros
  private async processFinancialData(name: string, data: any): Promise<void> {
    if (name === 'crypto_prices' && data.bpi) {
      const btcPrice = data.bpi.USD.rate_float;
      console.log(`💰 Bitcoin: $${btcPrice.toLocaleString()}`);
      
      // Si BTC está bajando mucho, podría ser oportunidad
      if (btcPrice < 40000) {
        console.log('🚨 OPORTUNIDAD: Bitcoin en precio bajo');
      }
    }
    
    if (name === 'market_status' && data.rates) {
      console.log(`💱 USD/EUR: ${data.rates.EUR}`);
    }
  }

  // 📰 Procesar noticias
  private async processNewsData(name: string, data: any): Promise<void> {
    if (data.articles && data.articles.length > 0) {
      const headlines = data.articles.slice(0, 3).map(article => article.title);
      console.log('📰 Headlines tecnológicas:', headlines);
    }
  }

  // 🔧 Procesar datos tecnológicos
  private async processTechData(name: string, data: any): Promise<void> {
    if (name === 'github_trending' && data.items) {
      const trending = data.items.slice(0, 3).map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count,
        language: repo.language
      }));
      console.log('🌟 Repos trending:', trending);
    }
  }

  // 🌤️ Procesar datos del clima
  private async processWeatherData(name: string, data: any): Promise<void> {
    if (data.current_weather) {
      const temp = data.current_weather.temperature;
      console.log(`🌤️ Temperatura NYC: ${temp}°C`);
    }
  }

  // 🔌 Procesar datos de APIs
  private async processApiData(name: string, data: any): Promise<void> {
    if (data.entries && data.entries.length > 0) {
      const freeApis = data.entries.filter(api => api.Auth === null).length;
      console.log(`🔌 APIs gratuitas disponibles: ${freeApis}`);
    }
  }

  // 📊 Procesar datos genéricos
  private async processGenericData(name: string, data: any): Promise<void> {
    console.log(`📊 Datos genéricos de ${name}: ${JSON.stringify(data).length} caracteres`);
  }

  // 🎯 Obtener datos específicos para emergencias
  async getEmergencyRelevantData(): Promise<any> {
    const relevantData = {
      financial: {
        cryptoPrices: this.dataCache.get('crypto_prices'),
        exchangeRates: this.dataCache.get('market_status')
      },
      opportunities: {
        freeApis: this.dataCache.get('public_apis'),
        trendingTech: this.dataCache.get('github_trending')
      },
      market: {
        techNews: this.dataCache.get('news_headlines')
      },
      timestamp: new Date().toISOString(),
      dataFreshness: this.lastUpdate
    };

    return relevantData;
  }

  // 📋 Obtener estado del sistema
  getSystemStatus(): any {
    return {
      connectionActive: this.connectionActive,
      monitoring: !!this.monitoringInterval,
      dataSources: this.fuentesGratis.length,
      cachedDatasets: this.dataCache.size,
      lastUpdate: this.lastUpdate,
      uptime: process.uptime(),
      autonomousMode: true,
      nextCollection: '60 seconds'
    };
  }

  // 🔍 Buscar oportunidades de ingresos en los datos
  async findIncomeOpportunities(): Promise<any> {
    const opportunities = [];
    
    // Analizar APIs gratuitas para monetización
    const publicApis = this.dataCache.get('public_apis');
    if (publicApis && publicApis.data.entries) {
      const freeApis = publicApis.data.entries
        .filter(api => api.Auth === null && api.Category === 'Business')
        .slice(0, 5);
      
      opportunities.push({
        type: 'free_apis',
        description: 'APIs gratuitas para crear servicios',
        count: freeApis.length,
        potential: 'Crear herramientas web con estas APIs'
      });
    }

    // Analizar trending repos para clonar/mejorar
    const trending = this.dataCache.get('github_trending');
    if (trending && trending.data.items) {
      const hotRepos = trending.data.items
        .filter(repo => repo.stargazers_count > 1000)
        .slice(0, 3);
      
      opportunities.push({
        type: 'trending_tech',
        description: 'Tecnologías trending para clonar',
        repos: hotRepos.map(r => r.name),
        potential: 'Crear versiones mejoradas o complementarias'
      });
    }

    // Analizar precios crypto para oportunidades
    const crypto = this.dataCache.get('crypto_prices');
    if (crypto && crypto.data.bpi) {
      const btcPrice = crypto.data.bpi.USD.rate_float;
      if (btcPrice < 50000) {
        opportunities.push({
          type: 'crypto_opportunity',
          description: 'Bitcoin en precio atractivo',
          price: btcPrice,
          potential: 'Momento para contenido sobre crypto'
        });
      }
    }

    return {
      opportunities,
      totalFound: opportunities.length,
      analysisTime: new Date().toISOString(),
      recommendation: opportunities.length > 0 ? 
        'Oportunidades detectadas - activar protocolos' : 
        'Continuar monitoreando'
    };
  }

  // 🛑 Detener monitoreo
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 ATLAS Online: Monitoreo detenido');
    }
  }

  // 🔄 Reset del sistema
  reset(): void {
    this.stopMonitoring();
    this.dataCache.clear();
    this.connectionActive = false;
    this.lastUpdate = new Date();
    console.log('🔄 ATLAS Online: Sistema reiniciado');
  }
}

export const atlasOnline = AtlasOnline.getInstance();