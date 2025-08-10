import { Router, Request, Response } from 'express';

const router = Router();

interface MetodoIngreso {
  descripcion: string;
  tiempo_setup: string;
  inversion_inicial: string;
  potencial_diario: string;
  dificultad: string;
  script: string;
  acciones: string[];
}

interface CategoriaMetodos {
  [key: string]: MetodoIngreso;
}

interface MetodosDisponibles {
  [categoria: string]: CategoriaMetodos;
}

class AtlasIngresosMasivos {
  private metodos_disponibles: MetodosDisponibles;
  private ingresos_objetivo: number = 2000;

  constructor() {
    this.inicializarMetodos();
  }

  private inicializarMetodos() {
    this.metodos_disponibles = {
      venta_directa: {
        facebook_marketplace: {
          descripcion: "Vender objetos usados en Facebook Marketplace",
          tiempo_setup: "15 minutos",
          inversion_inicial: "$0",
          potencial_diario: "$50-200",
          dificultad: "Fácil",
          script: "Busca objetos que no uses. Fotografía, publica en Facebook Marketplace con precio competitivo.",
          acciones: ["Inventariar objetos", "Fotografiar", "Crear listados", "Responder mensajes"]
        },
        ebay_reventa: {
          descripcion: "Reventa en eBay con productos digitales",
          tiempo_setup: "30 minutos",
          inversion_inicial: "$0",
          potencial_diario: "$30-150",
          dificultad: "Fácil",
          script: "Crear cuenta eBay, buscar productos digitales con licencia de reventa.",
          acciones: ["Cuenta eBay", "Buscar productos digitales", "Crear listados", "Automatizar envíos"]
        },
        dropshipping: {
          descripcion: "Dropshipping con Shopify + AliExpress",
          tiempo_setup: "2 horas",
          inversion_inicial: "$29/mes",
          potencial_diario: "$100-500",
          dificultad: "Medio",
          script: "Crear tienda Shopify, conectar con AliExpress via Oberlo/Spocket.",
          acciones: ["Setup Shopify", "Conectar proveedores", "Importar productos", "Marketing digital"]
        },
        nfts_arte: {
          descripcion: "Venta de NFTs o arte digital",
          tiempo_setup: "1 hora",
          inversion_inicial: "$50-100",
          potencial_diario: "$20-1000",
          dificultad: "Medio",
          script: "Crear arte con IA, subir a OpenSea/Rarible, promocionar en redes.",
          acciones: ["Generar arte IA", "Setup wallet crypto", "Mint NFTs", "Marketing viral"]
        }
      },
      servicios_freelance: {
        fiverr_servicios: {
          descripcion: "Servicios en Fiverr/Upwork",
          tiempo_setup: "1 hora",
          inversion_inicial: "$0",
          potencial_diario: "$50-300",
          dificultad: "Fácil",
          script: "Crear perfil profesional, ofrecer servicios que domines.",
          acciones: ["Perfil optimizado", "Gigs atractivos", "Portfolio", "Precios competitivos"]
        },
        consultoria_zoom: {
          descripcion: "Consultoría express por Zoom/WhatsApp",
          tiempo_setup: "30 minutos",
          inversion_inicial: "$0",
          potencial_diario: "$200-800",
          dificultad: "Medio",
          script: "Ofrecer consultoría 1-hora en tu área de expertise por $99-299.",
          acciones: ["LinkedIn outreach", "Script consultoría", "Calendario booking", "Zoom setup"]
        },
        creacion_cvs: {
          descripcion: "Creación de CVs y perfiles LinkedIn",
          tiempo_setup: "15 minutos",
          inversion_inicial: "$0",
          potencial_diario: "$100-400",
          dificultad: "Fácil",
          script: "Ofrecer optimización de CV/LinkedIn por $29-99.",
          acciones: ["Templates profesionales", "Marketing directo", "Proceso streamlined", "Garantía satisfacción"]
        }
      },
      microtareas: {
        amazon_mturk: {
          descripcion: "Amazon Mechanical Turk",
          tiempo_setup: "1 hora",
          inversion_inicial: "$0",
          potencial_diario: "$20-80",
          dificultad: "Fácil",
          script: "Registrarse, completar HITs disponibles.",
          acciones: ["Registro verificado", "Calificaciones altas", "HITs rápidos", "Optimizar tiempo"]
        },
        remotasks: {
          descripcion: "Remotasks - Tareas remotas",
          tiempo_setup: "30 minutos",
          inversion_inicial: "$0",
          potencial_diario: "$30-120",
          dificultad: "Fácil",
          script: "Completar entrenamiento, realizar tareas de datos/IA.",
          acciones: ["Training modules", "Accuracy alta", "Tareas consistentes", "Bonos calidad"]
        },
        swagbucks: {
          descripcion: "Swagbucks encuestas pagadas",
          tiempo_setup: "10 minutos",
          inversion_inicial: "$0",
          potencial_diario: "$10-40",
          dificultad: "Muy fácil",
          script: "Completar encuestas, ver videos, compras con cashback.",
          acciones: ["Perfil completo", "Encuestas diarias", "Cashback compras", "Referidos activos"]
        }
      },
      monetizacion_ia: {
        imagenes_ia_redbubble: {
          descripcion: "Generar imágenes IA y vender en Redbubble",
          tiempo_setup: "2 horas",
          inversion_inicial: "$0",
          potencial_diario: "$20-200",
          dificultad: "Medio",
          script: "Usar DALL-E/Midjourney, subir a Redbubble/Etsy como prints.",
          acciones: ["Generar arte IA", "Setup tiendas", "Keywords SEO", "Promoción social"]
        },
        gpts_personalizados: {
          descripcion: "Crear GPTs y vender en GPT Store",
          tiempo_setup: "1 hora",
          inversion_inicial: "$20/mes",
          potencial_diario: "$50-300",
          dificultad: "Medio",
          script: "Crear GPTs especializados, publicar en GPT Store.",
          acciones: ["Nicho específico", "GPT optimizado", "Marketing directo", "Updates regulares"]
        },
        musica_ia: {
          descripcion: "Generar música IA y vender como fondo",
          tiempo_setup: "1 hora",
          inversion_inicial: "$0-50",
          potencial_diario: "$15-100",
          dificultad: "Medio",
          script: "Usar Suno/Beatoven, vender en AudioJungle/Pond5.",
          acciones: ["Generar tracks", "Licencias uso", "Plataformas múltiples", "Catálogo extenso"]
        }
      },
      monetizacion_extrema: {
        mineria_crypto: {
          descripcion: "Minería crypto gratuita",
          tiempo_setup: "30 minutos",
          inversion_inicial: "$0",
          potencial_diario: "$5-30",
          dificultad: "Fácil",
          script: "CryptoTab browser, Coinpot faucets, mining pools gratuitos.",
          acciones: ["Browser mining", "Faucets automatizados", "Referidos activos", "Withdraw regular"]
        },
        prestamos_apps: {
          descripcion: "Apps préstamos instantáneos",
          tiempo_setup: "1 hora",
          inversion_inicial: "$0",
          potencial_diario: "$100-500",
          dificultad: "Fácil",
          script: "Dave, MoneyLion, Earnin, Chime - adelantos sin interés.",
          acciones: ["Múltiples apps", "Direct deposit", "Build credit", "Maximize limits"]
        }
      }
    };
  }

  calcularPotencialTotal(): { minimo: number; maximo: number } {
    let potencial_minimo = 0;
    let potencial_maximo = 0;
    
    for (const categoria of Object.values(this.metodos_disponibles)) {
      for (const metodo of Object.values(categoria)) {
        const potencial = metodo.potencial_diario.replace(/\$|-/g, '').split(' ');
        if (potencial.length >= 2) {
          const min_val = parseInt(potencial[0]);
          const max_val = parseInt(potencial[1]);
          if (!isNaN(min_val) && !isNaN(max_val)) {
            potencial_minimo += min_val;
            potencial_maximo += max_val;
          }
        }
      }
    }
    
    return { minimo: potencial_minimo, maximo: potencial_maximo };
  }

  recomendarMetodosUrgentes(tiempo_disponible_horas: number = 5) {
    const recomendaciones = [];
    
    for (const [categoria, metodos] of Object.entries(this.metodos_disponibles)) {
      for (const [metodo_id, config] of Object.entries(metodos)) {
        // Convertir tiempo de setup a minutos
        const tiempo_str = config.tiempo_setup;
        let tiempo_minutos = 60; // Default
        
        if (tiempo_str.includes('minutos')) {
          tiempo_minutos = parseInt(tiempo_str.split(' ')[0]);
        } else if (tiempo_str.includes('hora')) {
          const horas = parseInt(tiempo_str.split(' ')[0]);
          tiempo_minutos = horas * 60;
        }
        
        // Solo recomendar si se puede setup en el tiempo disponible
        if (tiempo_minutos <= (tiempo_disponible_horas * 60)) {
          // Calcular score basado en potencial/tiempo
          const potencial = config.potencial_diario.replace(/\$|-/g, '').split(' ');
          if (potencial.length >= 2) {
            const min_val = parseInt(potencial[0]);
            const max_val = parseInt(potencial[1]);
            if (!isNaN(min_val) && !isNaN(max_val)) {
              const potencial_promedio = (min_val + max_val) / 2;
              const score = potencial_promedio / (tiempo_minutos / 60); // Dinero por hora de setup
              
              recomendaciones.push({
                metodo: metodo_id,
                categoria,
                config,
                score,
                tiempo_setup_minutos: tiempo_minutos
              });
            }
          }
        }
      }
    }
    
    // Ordenar por score descendente
    recomendaciones.sort((a, b) => b.score - a.score);
    return recomendaciones.slice(0, 15); // Top 15 recomendaciones
  }

  generarPlanEmergencia() {
    const recomendaciones = this.recomendarMetodosUrgentes(5);
    
    return {
      objetivo: `$${this.ingresos_objetivo}`,
      tiempo_disponible: "5 horas",
      estrategia: "Ejecutar métodos paralelos de mayor ROI",
      recomendaciones,
      timeline: {
        hora_1: [
          "Setup apps préstamos (Dave, MoneyLion, Earnin)",
          "Publicar objetos en Facebook Marketplace",
          "Crear perfil Fiverr/Upwork optimizado"
        ],
        hora_2: [
          "Aplicar a múltiples préstamos",
          "Outreach LinkedIn para consultoría",
          "Setup Swagbucks + completar encuestas"
        ],
        hora_3: [
          "Crear primer producto digital para Gumroad",
          "Activar CryptoTab mining",
          "Responder inquiries Marketplace/Fiverr"
        ],
        hora_4: [
          "Marketing viral producto digital",
          "Follow-up consultoría LinkedIn",
          "Setup Amazon MTurk + primeras tareas"
        ],
        hora_5: [
          "Optimizar canales que respondan mejor",
          "Push final todos los métodos activos",
          "Cobrar/withdraw todo disponible"
        ]
      }
    };
  }

  generarDashboardData() {
    const potencial = this.calcularPotencialTotal();
    const recomendaciones = this.recomendarMetodosUrgentes(5);
    const total_metodos = Object.values(this.metodos_disponibles).reduce(
      (total, categoria) => total + Object.keys(categoria).length, 0
    );
    
    return {
      timestamp: new Date().toISOString(),
      total_metodos_disponibles: total_metodos,
      categorias: Object.keys(this.metodos_disponibles).length,
      potencial_diario_total: `$${potencial.minimo}-${potencial.maximo}`,
      recomendaciones_top: recomendaciones.slice(0, 5),
      plan_emergencia: this.generarPlanEmergencia(),
      metodos_por_categoria: Object.fromEntries(
        Object.entries(this.metodos_disponibles).map(([cat, metodos]) => 
          [cat, Object.keys(metodos).length]
        )
      ),
      estado: "METODOS_MASIVOS_DISPONIBLES",
      ejecutable_inmediatamente: recomendaciones.filter(r => r.tiempo_setup_minutos <= 30).length,
      todos_los_metodos: this.metodos_disponibles
    };
  }
}

// Instancia global del sistema
const atlasMasivos = new AtlasIngresosMasivos();

// Rutas API
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const data = atlasMasivos.generarDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Error en dashboard atlas-ingresos-masivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/recomendaciones/:horas?', async (req: Request, res: Response) => {
  try {
    const horas = parseInt(req.params.horas || '5');
    const recomendaciones = atlasMasivos.recomendarMetodosUrgentes(horas);
    
    res.json({
      tiempo_disponible: `${horas} horas`,
      total_recomendaciones: recomendaciones.length,
      recomendaciones
    });
  } catch (error) {
    console.error('Error en recomendaciones atlas-ingresos-masivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/plan-emergencia', async (req: Request, res: Response) => {
  try {
    const plan = atlasMasivos.generarPlanEmergencia();
    res.json(plan);
  } catch (error) {
    console.error('Error en plan-emergencia atlas-ingresos-masivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/categoria/:categoria', async (req: Request, res: Response) => {
  try {
    const categoria = req.params.categoria;
    const data = atlasMasivos.generarDashboardData();
    
    if (data.todos_los_metodos[categoria]) {
      res.json({
        categoria,
        metodos: data.todos_los_metodos[categoria],
        total_metodos: Object.keys(data.todos_los_metodos[categoria]).length
      });
    } else {
      res.status(404).json({ error: 'Categoría no encontrada' });
    }
  } catch (error) {
    console.error('Error en categoria atlas-ingresos-masivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;