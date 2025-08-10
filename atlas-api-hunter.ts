/**
 * 🔍 ATLAS API Hunter v1
 * Objetivo: Detectar, filtrar y almacenar APIs públicas útiles sin intervención humana
 * Basado en el protocolo proporcionado por Geremy
 */

import axios from 'axios';
import fs from 'fs';

interface ApiEntry {
  API: string;
  Description: string;
  Auth: string;
  HTTPS: boolean;
  Cors: string;
  Link: string;
  Category: string;
}

interface ApiUtil {
  Nombre: string;
  Descripción: string;
  URL: string;
  Categoría: string;
  Cors: string;
  Testeable: boolean;
}

export class AtlasApiHunter {
  private static instance: AtlasApiHunter;
  private FUENTE_APIS = "https://api.publicapis.org/entries";
  private huntingActive = false;
  private discoveredApis: ApiUtil[] = [];
  private lastHunt = new Date();

  private constructor() {}

  static getInstance(): AtlasApiHunter {
    if (!AtlasApiHunter.instance) {
      AtlasApiHunter.instance = new AtlasApiHunter();
    }
    return AtlasApiHunter.instance;
  }

  // 🧠 Filtro de APIs útiles (sin auth, con HTTPS, categoría relevante)
  private filtrarApis(data: { entries: ApiEntry[] }): ApiUtil[] {
    const apisUtiles: ApiUtil[] = [];
    const categoriasRelevantes = [
      "Weather", "Finance", "Health", "Open Data", "Machine Learning",
      "News", "Cryptocurrency", "Government", "Sports", "Science & Math",
      "Transportation", "Business", "Social", "Technology"
    ];

    for (const api of data.entries || []) {
      // Priorizar APIs sin autenticación y con HTTPS
      if ((api.Auth === "" || api.Auth === "No") && 
          api.HTTPS && 
          categoriasRelevantes.includes(api.Category)) {
        apisUtiles.push({
          Nombre: api.API,
          Descripción: api.Description,
          URL: api.Link,
          Categoría: api.Category,
          Cors: api.Cors,
          Testeable: true
        });
      }
    }
    
    return apisUtiles;
  }

  // 🔁 Descubrimiento autónomo de APIs
  async descubrirApis(): Promise<{ success: boolean; apis: ApiUtil[]; error?: string }> {
    try {
      console.log('🔍 ATLAS API Hunter: Iniciando descubrimiento autónomo...');
      
      const response = await axios.get(this.FUENTE_APIS, { timeout: 10000 });
      const apis = this.filtrarApis(response.data);
      
      // Guardar APIs descubiertas
      this.discoveredApis = apis;
      this.lastHunt = new Date();
      
      // Guardar en archivo para persistencia
      const apisData = {
        timestamp: this.lastHunt.toISOString(),
        total_discovered: apis.length,
        apis: apis
      };
      
      fs.writeFileSync('atlas_apis.json', JSON.stringify(apisData, null, 2));
      
      console.log(`✅ ${apis.length} APIs útiles guardadas en atlas_apis.json`);
      
      return { success: true, apis };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.log(`❌ Error al obtener APIs: ${errorMessage}`);
      return { success: false, apis: [], error: errorMessage };
    }
  }

  // 🧪 Testear APIs para verificar que funcionan
  async testearApis(apis: ApiUtil[]): Promise<ApiUtil[]> {
    const apisTesteadas: ApiUtil[] = [];
    
    for (const api of apis.slice(0, 10)) { // Testear máximo 10 para no saturar
      try {
        const response = await axios.get(api.URL, { 
          timeout: 5000,
          headers: { 'User-Agent': 'ATLAS-API-Hunter/1.0' }
        });
        
        if (response.status === 200) {
          api.Testeable = true;
          apisTesteadas.push(api);
          console.log(`✅ API funcionando: ${api.Nombre}`);
        }
      } catch (error) {
        console.log(`❌ API no responde: ${api.Nombre}`);
        api.Testeable = false;
      }
    }
    
    return apisTesteadas;
  }

  // 🎯 Seleccionar las 5 APIs más virales para monetización
  seleccionarApisMasVirales(): ApiUtil[] {
    const categoriasVirales = ['Finance', 'Cryptocurrency', 'News', 'Weather', 'Health'];
    
    return this.discoveredApis
      .filter(api => categoriasVirales.includes(api.Categoría) && api.Testeable)
      .sort((a, b) => {
        // Priorizar por categoría viral
        const scoreA = categoriasVirales.indexOf(a.Categoría);
        const scoreB = categoriasVirales.indexOf(b.Categoría);
        return scoreA - scoreB;
      })
      .slice(0, 5);
  }

  // 🚀 Convertir APIs en artefactos vendibles
  async generarArtefactosVendibles(): Promise<any[]> {
    const apisVirales = this.seleccionarApisMasVirales();
    const artefactos = [];

    for (const api of apisVirales) {
      const artefacto = {
        nombre: `${api.Nombre} Dashboard Pro`,
        descripcion: `Dashboard en tiempo real usando ${api.Descripción}`,
        categoria: api.Categoría,
        precio_sugerido: api.Categoría === 'Finance' ? 49.99 : 
                        api.Categoría === 'Cryptocurrency' ? 39.99 : 
                        api.Categoría === 'Health' ? 29.99 : 19.99,
        api_source: api.URL,
        valor_agregado: this.generarValorAgregado(api.Categoría),
        tiempo_desarrollo: '2-4 horas',
        potencial_viral: this.calcularPotencialViral(api.Categoría)
      };
      
      artefactos.push(artefacto);
    }

    return artefactos;
  }

  private generarValorAgregado(categoria: string): string[] {
    const valores: { [key: string]: string[] } = {
      'Finance': ['Alertas en tiempo real', 'Análisis predictivo', 'Portfolio tracking'],
      'Cryptocurrency': ['Alertas de precio', 'Trading signals', 'Market analysis'],
      'News': ['Filtrado inteligente', 'Análisis de sentimiento', 'Trending topics'],
      'Weather': ['Alertas climáticas', 'Predicciones agrícolas', 'Turismo inteligente'],
      'Health': ['Monitoreo de epidemias', 'Análisis de tendencias', 'Alertas sanitarias']
    };
    
    return valores[categoria] || ['Dashboard personalizado', 'API integration', 'Real-time data'];
  }

  private calcularPotencialViral(categoria: string): number {
    const scores: { [key: string]: number } = {
      'Finance': 9,
      'Cryptocurrency': 10,
      'News': 8,
      'Weather': 7,
      'Health': 9
    };
    
    return scores[categoria] || 6;
  }

  // 🔄 Bucle autónomo cada 12 horas
  iniciarHuntingAutonomo(): void {
    if (this.huntingActive) {
      console.log('🔍 API Hunter ya está activo');
      return;
    }

    this.huntingActive = true;
    console.log('🚀 ATLAS API Hunter: Modo autónomo activado');

    // Ejecutar inmediatamente
    this.descubrirApis();

    // Repetir cada 12 horas (43200000 ms)
    setInterval(async () => {
      await this.descubrirApis();
    }, 43200000);
  }

  // 📊 Estadísticas del hunting
  getHuntingStats(): any {
    return {
      hunting_active: this.huntingActive,
      last_hunt: this.lastHunt.toISOString(),
      total_apis_discovered: this.discoveredApis.length,
      apis_by_category: this.getApisByCategory(),
      working_apis: this.discoveredApis.filter(api => api.Testeable).length,
      viral_apis_ready: this.seleccionarApisMasVirales().length,
      next_hunt: this.huntingActive ? 
        new Date(this.lastHunt.getTime() + 43200000).toISOString() : 
        'No programado'
    };
  }

  private getApisByCategory(): { [key: string]: number } {
    const categories: { [key: string]: number } = {};
    this.discoveredApis.forEach(api => {
      categories[api.Categoría] = (categories[api.Categoría] || 0) + 1;
    });
    return categories;
  }

  // 🎯 Obtener APIs por categoría específica
  getApisPorCategoria(categoria: string): ApiUtil[] {
    return this.discoveredApis.filter(api => 
      api.Categoría.toLowerCase() === categoria.toLowerCase() && api.Testeable
    );
  }

  // 📂 Cargar APIs guardadas desde archivo
  cargarApisGuardadas(): boolean {
    try {
      if (fs.existsSync('atlas_apis.json')) {
        const data = JSON.parse(fs.readFileSync('atlas_apis.json', 'utf8'));
        this.discoveredApis = data.apis || [];
        this.lastHunt = new Date(data.timestamp || new Date());
        console.log(`📂 ${this.discoveredApis.length} APIs cargadas desde archivo`);
        return true;
      }
    } catch (error) {
      console.log('❌ Error cargando APIs guardadas');
    }
    return false;
  }
}

export const atlasApiHunter = AtlasApiHunter.getInstance();