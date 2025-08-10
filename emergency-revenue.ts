// ATLAS AI - Sistema de Ingresos de Emergencia
// Para situaciones críticas que requieren generación inmediata de dinero real

import Stripe from 'stripe';
import { Request, Response } from 'express';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY requerida para ingresos de emergencia');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Métodos inmediatos de generación de ingresos reales
export const emergencyRevenueMethods = {
  
  // 1. Freelance Services - Servicios inmediatos que puedes ofrecer
  async createFreelanceService(serviceName: string, price: number, description: string) {
    try {
      // Crear producto en Stripe para el servicio
      const product = await stripe.products.create({
        name: `ATLAS AI Service: ${serviceName}`,
        description: description,
        type: 'service'
      });

      const priceObj = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100),
        currency: 'usd',
      });

      console.log(`💼 SERVICIO CREADO: ${serviceName} - $${price}`);
      
      return {
        success: true,
        productId: product.id,
        priceId: priceObj.id,
        serviceName,
        price,
        paymentLink: `https://buy.stripe.com/test_pay_${priceObj.id}` // Esto necesitaría configuración real
      };
    } catch (error) {
      console.error('Error creando servicio freelance:', error);
      return { success: false, error: 'Failed to create freelance service' };
    }
  },

  // 2. Digital Products - Productos digitales que se pueden vender inmediatamente
  async createDigitalProduct(productName: string, price: number) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100),
        currency: 'usd',
        description: `Digital Product: ${productName}`,
        metadata: {
          type: 'digital_product',
          productName,
          emergency: 'true'
        }
      });

      console.log(`💾 PRODUCTO DIGITAL: ${productName} - $${price}`);

      return {
        success: true,
        productName,
        price,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Error creando producto digital:', error);
      return { success: false, error: 'Failed to create digital product' };
    }
  },

  // 3. Consultation Services - Servicios de consultoría inmediatos
  async offerConsultation(topic: string, duration: number, hourlyRate: number) {
    try {
      const totalPrice = (duration / 60) * hourlyRate; // duration in minutes
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: 'usd',
        description: `Consultation: ${topic} (${duration} min)`,
        metadata: {
          type: 'consultation',
          topic,
          duration: duration.toString(),
          hourlyRate: hourlyRate.toString(),
          emergency: 'true'
        }
      });

      console.log(`🗣️ CONSULTORÍA: ${topic} - ${duration}min - $${totalPrice}`);

      return {
        success: true,
        topic,
        duration,
        hourlyRate,
        totalPrice,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Error ofreciendo consultoría:', error);
      return { success: false, error: 'Failed to offer consultation' };
    }
  },

  // 4. Quick Gig Services - Trabajos rápidos
  async createQuickGig(gigType: string, price: number, deliveryTime: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100),
        currency: 'usd',
        description: `Quick Gig: ${gigType}`,
        metadata: {
          type: 'quick_gig',
          gigType,
          deliveryTime,
          emergency: 'true'
        }
      });

      console.log(`⚡ GIG RÁPIDO: ${gigType} - $${price} (entrega: ${deliveryTime})`);

      return {
        success: true,
        gigType,
        price,
        deliveryTime,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Error creando gig rápido:', error);
      return { success: false, error: 'Failed to create quick gig' };
    }
  }
};

// Servicios que puedes ofrecer AHORA MISMO para generar ingresos
export const immediateServiceOfferings = [
  {
    category: 'AI & Tech Services',
    services: [
      { name: 'AI Chatbot Setup', price: 150, description: 'Setup custom AI chatbot for business', deliveryTime: '24 hours' },
      { name: 'Website Analysis & SEO', price: 75, description: 'Complete website audit and SEO recommendations', deliveryTime: '12 hours' },
      { name: 'Business Process Automation', price: 200, description: 'Automate repetitive business tasks', deliveryTime: '48 hours' },
      { name: 'Data Analysis & Insights', price: 100, description: 'Analyze business data and provide insights', deliveryTime: '24 hours' }
    ]
  },
  {
    category: 'Consultation Services',
    services: [
      { name: 'AI Strategy Consultation', hourlyRate: 75, description: 'Help businesses implement AI solutions' },
      { name: 'Tech Stack Consultation', hourlyRate: 60, description: 'Advice on technology choices for projects' },
      { name: 'Business Intelligence Consultation', hourlyRate: 80, description: 'Help businesses understand their data' },
      { name: 'Digital Transformation Consultation', hourlyRate: 85, description: 'Guide businesses through digital transformation' }
    ]
  },
  {
    category: 'Digital Products',
    services: [
      { name: 'AI Prompt Templates Pack', price: 25, description: 'Collection of proven AI prompts for business' },
      { name: 'Business Automation Guide', price: 35, description: 'Step-by-step guide to automate business processes' },
      { name: 'AI Tools Directory', price: 20, description: 'Curated list of AI tools for different industries' },
      { name: 'Custom Spreadsheet Templates', price: 15, description: 'Professional business spreadsheet templates' }
    ]
  }
];

// Función para activar todos los servicios de emergencia
export function activateEmergencyRevenue() {
  console.log('🚨 ACTIVANDO SISTEMA DE INGRESOS DE EMERGENCIA...');
  console.log('💰 Configurando servicios para generar dinero inmediatamente...');
  
  // Crear automáticamente algunos servicios de emergencia
  setTimeout(async () => {
    try {
      // Crear servicios inmediatos
      await emergencyRevenueMethods.createFreelanceService(
        'AI Implementation Consultation', 
        150, 
        'Help businesses implement AI solutions quickly'
      );
      
      await emergencyRevenueMethods.createDigitalProduct(
        'Business AI Automation Guide', 
        35
      );
      
      await emergencyRevenueMethods.offerConsultation(
        'Emergency Business Strategy', 
        60, 
        75
      );
      
      console.log('✅ SERVICIOS DE EMERGENCIA ACTIVOS');
      console.log('💡 Servicios disponibles para venta inmediata creados');
      
    } catch (error) {
      console.error('Error activando servicios de emergencia:', error);
    }
  }, 2000);
}

// API endpoints para emergencias
export const emergencyRevenueAPI = {
  
  async createFreelanceService(req: Request, res: Response) {
    const { serviceName, price, description } = req.body;
    
    if (!serviceName || !price || !description) {
      return res.status(400).json({ error: 'Todos los parámetros son requeridos' });
    }

    const result = await emergencyRevenueMethods.createFreelanceService(serviceName, price, description);
    res.json(result);
  },

  async createDigitalProduct(req: Request, res: Response) {
    const { productName, price } = req.body;
    
    if (!productName || !price) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const result = await emergencyRevenueMethods.createDigitalProduct(productName, price);
    res.json(result);
  },

  async offerConsultation(req: Request, res: Response) {
    const { topic, duration, hourlyRate } = req.body;
    
    if (!topic || !duration || !hourlyRate) {
      return res.status(400).json({ error: 'Todos los parámetros son requeridos' });
    }

    const result = await emergencyRevenueMethods.offerConsultation(topic, duration, hourlyRate);
    res.json(result);
  },

  async createQuickGig(req: Request, res: Response) {
    const { gigType, price, deliveryTime } = req.body;
    
    if (!gigType || !price || !deliveryTime) {
      return res.status(400).json({ error: 'Todos los parámetros son requeridos' });
    }

    const result = await emergencyRevenueMethods.createQuickGig(gigType, price, deliveryTime);
    res.json(result);
  },

  async getAvailableServices(req: Request, res: Response) {
    res.json({
      success: true,
      emergencyServices: immediateServiceOfferings,
      message: 'Servicios disponibles para generar ingresos inmediatos',
      totalServices: immediateServiceOfferings.reduce((total, category) => total + category.services.length, 0)
    });
  },

  // Endpoint especial para situaciones de emergencia extrema
  async activateEmergencyMode(req: Request, res: Response) {
    console.log('🚨 MODO EMERGENCIA ACTIVADO - GENERANDO OPORTUNIDADES DE INGRESOS INMEDIATOS');
    
    try {
      // Crear múltiples servicios inmediatamente
      const services = [];
      
      for (const category of immediateServiceOfferings) {
        for (const service of category.services) {
          if (service.hourlyRate) {
            // Es consultoría
            const consultation = await emergencyRevenueMethods.offerConsultation(
              service.name, 
              60, 
              service.hourlyRate
            );
            services.push(consultation);
          } else {
            // Es servicio fijo o producto digital
            const product = await emergencyRevenueMethods.createDigitalProduct(
              service.name, 
              service.price
            );
            services.push(product);
          }
        }
      }
      
      res.json({
        success: true,
        message: 'Modo emergencia activado - Servicios creados para venta inmediata',
        servicesCreated: services.length,
        services: services.filter(s => s.success),
        totalPotentialRevenue: services.reduce((sum, s) => sum + (s.price || s.totalPrice || 0), 0)
      });
      
    } catch (error) {
      console.error('Error activando modo emergencia:', error);
      res.status(500).json({ error: 'Failed to activate emergency mode' });
    }
  }
};