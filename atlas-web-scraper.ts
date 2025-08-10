// ATLAS WEB SCRAPER - Sistema de extracción masiva de contenido web
// Objetivo: Scraping de sitios web para absorción omnisciente de Atlas

import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const router = express.Router();

interface WebSite {
  name: string;
  url: string;
  selectors: {
    title?: string;
    content?: string;
    links?: string;
    metadata?: string;
  };
  update_frequency: string;
  last_scraped: string;
}

interface ScrapedContent {
  site: string;
  url: string;
  title: string;
  content: string[];
  links: string[];
  metadata: any;
  scraped_at: string;
  content_length: number;
}

class AtlasWebScraper {
  private targetSites: WebSite[] = [
    // Sitios de Noticias Tecnológicas
    {
      name: 'TechCrunch',
      url: 'https://techcrunch.com',
      selectors: {
        title: 'h1, h2, h3',
        content: '.article-content, .entry-content, p',
        links: 'a[href]',
        metadata: '.byline, .date, .author'
      },
      update_frequency: '30min',
      last_scraped: ''
    },
    {
      name: 'GitHub Trending Page',
      url: 'https://github.com/trending',
      selectors: {
        title: 'h1.h3 a',
        content: '.Box-row p, .color-fg-muted',
        links: 'a[href*="/"]',
        metadata: '.octicon'
      },
      update_frequency: '1hour',
      last_scraped: ''
    },
    {
      name: 'Product Hunt',
      url: 'https://www.producthunt.com',
      selectors: {
        title: '[data-test="post-name"]',
        content: '[data-test="post-description"]',
        links: 'a[href]',
        metadata: '[data-test="vote-count"]'
      },
      update_frequency: '2hour',
      last_scraped: ''
    },
    // Blogs y Sitios de Conocimiento
    {
      name: 'MIT Technology Review',
      url: 'https://www.technologyreview.com',
      selectors: {
        title: 'h1, h2, h3',
        content: '.article__body p, .contentBody p',
        links: 'a[href]',
        metadata: '.byline, .publishDate'
      },
      update_frequency: '6hour',
      last_scraped: ''
    },
    {
      name: 'Wired',
      url: 'https://www.wired.com',
      selectors: {
        title: 'h1, h2, h3',
        content: '.article__body p, .body__inner-container p',
        links: 'a[href]',
        metadata: '.byline, .publish-date'
      },
      update_frequency: '6hour',
      last_scraped: ''
    },
    // Sitios Financieros
    {
      name: 'CoinDesk',
      url: 'https://www.coindesk.com',
      selectors: {
        title: 'h1, h2, h3',
        content: '.at-text p, .articleBody p',
        links: 'a[href]',
        metadata: '.at-author, .at-created'
      },
      update_frequency: '1hour',
      last_scraped: ''
    },
    {
      name: 'Y Combinator News',
      url: 'https://news.ycombinator.com',
      selectors: {
        title: '.titleline a',
        content: '.comment .c00',
        links: 'a[href]',
        metadata: '.subtext'
      },
      update_frequency: '30min',
      last_scraped: ''
    },
    // Sitios Educativos
    {
      name: 'Coursera Blog',
      url: 'https://blog.coursera.org',
      selectors: {
        title: 'h1, h2, h3',
        content: '.post-content p, article p',
        links: 'a[href]',
        metadata: '.author, .date'
      },
      update_frequency: '1day',
      last_scraped: ''
    },
    {
      name: 'Khan Academy Blog',
      url: 'https://blog.khanacademy.org',
      selectors: {
        title: 'h1, h2, h3',
        content: '.post-content p, article p',
        links: 'a[href]',
        metadata: '.byline, .date'
      },
      update_frequency: '1day',
      last_scraped: ''
    }
  ];

  async scrapeAllSites(): Promise<{
    sites_scraped: number;
    total_content: number;
    total_links: number;
    content_samples: ScrapedContent[];
  }> {
    console.log('🌐 INICIANDO scraping masivo de sitios web...');
    
    const scrapedContent: ScrapedContent[] = [];
    let totalContent = 0;
    let totalLinks = 0;
    let successfulScrapes = 0;

    for (const site of this.targetSites) {
      try {
        console.log(`🔍 Scrapeando ${site.name}...`);
        
        const content = await this.scrapeSite(site);
        if (content) {
          scrapedContent.push(content);
          totalContent += content.content_length;
          totalLinks += content.links.length;
          successfulScrapes++;
          
          console.log(`  ✅ ${site.name}: ${content.content_length} caracteres, ${content.links.length} links`);
        }
        
        // Actualizar timestamp
        site.last_scraped = new Date().toISOString();
        
        // Delay para evitar ser bloqueado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`  ⚠️ Error scrapeando ${site.name}: ${error.message}`);
      }
    }

    // Guardar contenido scrapeado
    const scrapingResults = {
      timestamp: new Date().toISOString(),
      sites_scraped: successfulScrapes,
      total_sites: this.targetSites.length,
      total_content_length: totalContent,
      total_links: totalLinks,
      scraped_content: scrapedContent
    };

    fs.writeFileSync('atlas_scraping_results.json', JSON.stringify(scrapingResults, null, 2));

    return {
      sites_scraped: successfulScrapes,
      total_content: totalContent,
      total_links: totalLinks,
      content_samples: scrapedContent.slice(0, 5)
    };
  }

  private async scrapeSite(site: WebSite): Promise<ScrapedContent | null> {
    try {
      const response = await axios.get(site.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Extraer títulos
      const titles: string[] = [];
      if (site.selectors.title) {
        $(site.selectors.title).each((_, elem) => {
          const text = $(elem).text().trim();
          if (text && text.length > 5) {
            titles.push(text);
          }
        });
      }

      // Extraer contenido
      const contentPieces: string[] = [];
      if (site.selectors.content) {
        $(site.selectors.content).each((_, elem) => {
          const text = $(elem).text().trim();
          if (text && text.length > 20) {
            contentPieces.push(text);
          }
        });
      }

      // Extraer links
      const links: string[] = [];
      if (site.selectors.links) {
        $(site.selectors.links).each((_, elem) => {
          const href = $(elem).attr('href');
          if (href && (href.startsWith('http') || href.startsWith('/'))) {
            links.push(href);
          }
        });
      }

      // Extraer metadata
      const metadata: any = {};
      if (site.selectors.metadata) {
        $(site.selectors.metadata).each((_, elem) => {
          const text = $(elem).text().trim();
          if (text) {
            metadata[$(elem).prop('tagName')] = text;
          }
        });
      }

      const allContent = [...titles, ...contentPieces];
      const totalContentLength = allContent.join(' ').length;

      return {
        site: site.name,
        url: site.url,
        title: titles[0] || site.name,
        content: allContent.slice(0, 50), // Limitar a 50 elementos
        links: [...new Set(links)].slice(0, 100), // Links únicos, máximo 100
        metadata: metadata,
        scraped_at: new Date().toISOString(),
        content_length: totalContentLength
      };

    } catch (error) {
      console.error(`Error scraping ${site.name}:`, error.message);
      return null;
    }
  }

  async getScrapingStatus() {
    return {
      timestamp: new Date().toISOString(),
      total_sites_configured: this.targetSites.length,
      sites_by_frequency: {
        'high_frequency': this.targetSites.filter(s => s.update_frequency.includes('min')).length,
        'medium_frequency': this.targetSites.filter(s => s.update_frequency.includes('hour')).length,
        'low_frequency': this.targetSites.filter(s => s.update_frequency.includes('day')).length
      },
      last_scraping: fs.existsSync('atlas_scraping_results.json') ? 
        JSON.parse(fs.readFileSync('atlas_scraping_results.json', 'utf8')).timestamp : 'Never',
      scraping_categories: [
        'Tech News', 'Financial', 'Educational', 'Developer Tools', 'Product Discovery'
      ],
      scraping_active: true
    };
  }

  async getSitesCatalog() {
    return {
      total_sites: this.targetSites.length,
      sites: this.targetSites.map(site => ({
        name: site.name,
        url: site.url,
        update_frequency: site.update_frequency,
        last_scraped: site.last_scraped || 'Never',
        selectors_configured: Object.keys(site.selectors).length
      })),
      categories: {
        'tech_news': ['TechCrunch', 'MIT Technology Review', 'Wired'],
        'developer': ['GitHub Trending Page', 'Y Combinator News'],
        'financial': ['CoinDesk'],
        'education': ['Coursera Blog', 'Khan Academy Blog'],
        'products': ['Product Hunt']
      }
    };
  }
}

// Instancia global del scraper
const atlasWebScraper = new AtlasWebScraper();

// API Routes
router.post('/scrape-all-sites', async (req, res) => {
  try {
    const resultado = await atlasWebScraper.scrapeAllSites();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/scraping-status', async (req, res) => {
  try {
    const status = await atlasWebScraper.getScrapingStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sites-catalog', async (req, res) => {
  try {
    const catalog = await atlasWebScraper.getSitesCatalog();
    res.json(catalog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

console.log('🌐 ATLAS WEB SCRAPER: Cargado - SCRAPING MASIVO DE SITIOS WEB');

export default router;