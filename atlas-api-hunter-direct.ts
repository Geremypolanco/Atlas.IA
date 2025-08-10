/**
 * 🔍 ATLAS API Hunter - Direct Implementation
 * Ejecutar directamente el protocolo de Geremy
 */

import axios from 'axios';
import fs from 'fs';

console.log('🔍 ATLAS API Hunter: Iniciando descubrimiento directo...');

async function huntApisDirectly() {
  try {
    // 1. Conectar a la fuente principal
    console.log('📡 Conectando a api.publicapis.org...');
    const response = await axios.get('https://api.publicapis.org/entries', { 
      timeout: 15000,
      headers: { 'User-Agent': 'ATLAS-API-Hunter/1.0' }
    });
    
    console.log(`✅ Conectado! Total entries: ${response.data.count}`);
    
    // 2. Filtrar APIs útiles
    const apisUtiles = [];
    const categoriasRelevantes = [
      "Weather", "Finance", "Health", "Open Data", "Machine Learning",
      "News", "Cryptocurrency", "Government", "Sports", "Science & Math"
    ];
    
    for (const api of response.data.entries || []) {
      if ((api.Auth === "" || api.Auth === "No") && 
          api.HTTPS && 
          categoriasRelevantes.includes(api.Category)) {
        apisUtiles.push({
          Nombre: api.API,
          Descripción: api.Description,
          URL: api.Link,
          Categoría: api.Category,
          Cors: api.Cors
        });
      }
    }
    
    console.log(`🎯 APIs útiles encontradas: ${apisUtiles.length}`);
    
    // 3. Guardar en atlas_apis.json
    const apisData = {
      timestamp: new Date().toISOString(),
      total_discovered: apisUtiles.length,
      fuente: "api.publicapis.org",
      filtros_aplicados: ["Sin Auth", "HTTPS", "Categorías relevantes"],
      apis: apisUtiles
    };
    
    fs.writeFileSync('atlas_apis.json', JSON.stringify(apisData, null, 2));
    console.log(`✅ ${apisUtiles.length} APIs guardadas en atlas_apis.json`);
    
    // 4. Mostrar primeras 5 APIs
    console.log('\n🔥 Primeras 5 APIs descubiertas:');
    apisUtiles.slice(0, 5).forEach((api, i) => {
      console.log(`  ${i+1}. ${api.Nombre} (${api.Categoría})`);
      console.log(`     ${api.Descripción.substring(0, 80)}...`);
    });
    
    // 5. APIs más virales
    const categoriasVirales = ['Finance', 'Cryptocurrency', 'News', 'Weather', 'Health'];
    const apisVirales = apisUtiles
      .filter(api => categoriasVirales.includes(api.Categoría))
      .slice(0, 5);
    
    console.log(`\n💰 APIs más virales para monetizar: ${apisVirales.length}`);
    apisVirales.forEach((api, i) => {
      const precio = api.Categoría === 'Finance' ? 49.99 : 
                    api.Categoría === 'Cryptocurrency' ? 39.99 : 29.99;
      console.log(`  ${i+1}. ${api.Nombre} → Dashboard Pro ($${precio})`);
    });
    
    return { success: true, total: apisUtiles.length, viral: apisVirales.length };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    
    // Fallback: usar APIs conocidas
    const fallbackApis = [
      {
        Nombre: "JSONPlaceholder",
        Descripción: "Fake JSON REST API for testing and prototyping",
        URL: "https://jsonplaceholder.typicode.com",
        Categoría: "Open Data"
      },
      {
        Nombre: "GitHub API",
        Descripción: "GitHub's REST API",
        URL: "https://api.github.com",
        Categoría: "Technology"
      },
      {
        Nombre: "CoinGecko",
        Descripción: "Cryptocurrency data API",
        URL: "https://api.coingecko.com",
        Categoría: "Finance"
      }
    ];
    
    fs.writeFileSync('atlas_apis.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      total_discovered: fallbackApis.length,
      fuente: "fallback_apis",
      error: error.message,
      apis: fallbackApis
    }, null, 2));
    
    console.log(`🛠️ Usando ${fallbackApis.length} APIs de respaldo`);
    return { success: false, total: fallbackApis.length, error: error.message };
  }
}

// Ejecutar inmediatamente
huntApisDirectly().then(result => {
  console.log('\n🚀 ATLAS API Hunter completado');
  console.log(`📊 Total APIs: ${result.total}`);
  if (result.success) {
    console.log('✅ Descubrimiento exitoso');
  } else {
    console.log('⚠️ Usando fallback APIs');
  }
}).catch(console.error);