import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { checkPermission, checkUsageLimit, requireNonAdmin, getUserPermissions } from "./middleware/accessControl";
import { AtlasAuth } from './atlas-independent-auth';

export async function registerRBACRoutes(app: Express): Promise<Server> {
  // Initialize Atlas Auth system
  const atlasAuth = new AtlasAuth();

  // Atlas independent auth routes - these take priority over Replit auth
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await atlasAuth.login(email, password);
      
      if (result.success) {
        res.cookie('atlas_token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ATLAS AUTH: Login error:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await atlasAuth.register(email, password, firstName, lastName);
      res.json(result);
    } catch (error) {
      console.error('❌ ATLAS AUTH: Register error:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  // Auth middleware - prefer Atlas auth over Replit
  await setupAuth(app);

  // Atlas independent user route with fallback to Replit
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Try Atlas auth first
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.atlas_token;

      if (token) {
        try {
          const decoded = atlasAuth.verifyToken(token);
          const user = atlasAuth.getUserById(decoded.userId);
          
          if (user) {
            return res.json({
              id: user.id,
              email: user.email,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              plan: user.plan,
              revenueGenerated: user.revenueGenerated,
              userType: null, // Will be set when user selects type
              subscriptionTier: user.plan === 'enterprise' ? 'enterprise' : user.plan === 'premium' ? 'premium' : 'free'
            });
          }
        } catch (atlasError) {
          console.log('Atlas auth failed, trying Replit auth');
        }
      }

      // Fallback to Replit auth
      if (req.isAuthenticated && req.isAuthenticated()) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Get user permissions
        const permissions = getUserPermissions(user.userType, user.subscriptionTier);
        
        return res.json({
          ...user,
          permissions
        });
      }

      return res.status(401).json({ message: "No autorizado" });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(401).json({ message: "No autorizado" });
    }
  });

  // User type selection - works with both Atlas and Replit auth
  app.post('/api/user/select-type', async (req: any, res) => {
    try {
      let userId;
      
      // Try Atlas auth first
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.atlas_token;

      if (token) {
        try {
          const decoded = atlasAuth.verifyToken(token);
          const user = atlasAuth.getUserById(decoded.userId);
          if (user) {
            userId = user.id;
          }
        } catch (atlasError) {
          // Fall back to Replit auth
          if (req.isAuthenticated && req.isAuthenticated()) {
            userId = req.user.claims.sub;
          }
        }
      } else if (req.isAuthenticated && req.isAuthenticated()) {
        userId = req.user.claims.sub;
      }

      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const { userType, organizationName, organizationSize, sector, country } = req.body;

      if (!['individual', 'business', 'government'].includes(userType)) {
        return res.status(400).json({ error: 'Tipo de usuario inválido' });
      }

      const user = await storage.upsertUser({
        id: userId,
        userType,
        organizationName,
        organizationSize,
        sector,
        country,
        subscriptionTier: 'free', // Default to free tier
        maxChatRequests: userType === 'individual' ? 10 : userType === 'business' ? 50 : 100,
        maxWorkflows: userType === 'individual' ? 1 : userType === 'business' ? 3 : 5,
        maxAssistants: userType === 'individual' ? 3 : userType === 'business' ? 5 : 10,
      });

      const permissions = getUserPermissions(user.userType, user.subscriptionTier);
      
      res.json({
        ...user,
        permissions
      });
    } catch (error) {
      console.error("Error selecting user type:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Protected chat endpoint for individuals
  app.post('/api/atlas/chat', 
    isAuthenticated, 
    requireNonAdmin,
    checkPermission('basic_chat'), 
    checkUsageLimit('chatRequests'),
    async (req: any, res) => {
      try {
        const { message } = req.body;
        const user = req.userData;

        // Increment usage
        const currentMonth = new Date().toISOString().substring(0, 7);
        const usage = await storage.getUserUsage(user.id, currentMonth);
        await storage.updateUserUsage(user.id, currentMonth, {
          chatRequests: (usage?.chatRequests || 0) + 1
        });

        // Simple response based on user type
        let response = "";
        switch (user.userType) {
          case 'individual':
            response = `Atlas AI Personal: ${message} - Respuesta personalizada para ti.`;
            break;
          case 'business':
            response = `Atlas AI Business: ${message} - Análisis empresarial incluido.`;
            break;
          case 'government':
            response = `Atlas AI Government: ${message} - Respuesta con protocolos de seguridad.`;
            break;
          default:
            response = `Atlas AI: ${message}`;
        }

        res.json({
          response,
          userType: user.userType,
          usageInfo: {
            chatRequests: (usage?.chatRequests || 0) + 1,
            maxChatRequests: user.maxChatRequests
          }
        });
      } catch (error) {
        console.error("Error in chat:", error);
        res.status(500).json({ error: "Error en el chat" });
      }
    }
  );

  // Workflow execution endpoint
  app.post('/api/atlas/execute-workflow',
    isAuthenticated,
    requireNonAdmin,
    checkPermission('basic_workflows'),
    checkUsageLimit('workflowExecutions'),
    async (req: any, res) => {
      try {
        const { workflowId, parameters } = req.body;
        const user = req.userData;

        // Increment usage
        const currentMonth = new Date().toISOString().substring(0, 7);
        const usage = await storage.getUserUsage(user.id, currentMonth);
        await storage.updateUserUsage(user.id, currentMonth, {
          workflowExecutions: (usage?.workflowExecutions || 0) + 1
        });

        // Mock workflow execution
        const result = {
          workflowId,
          status: 'completed',
          result: `Workflow ${workflowId} ejecutado exitosamente para ${user.userType}`,
          timestamp: new Date().toISOString(),
          userType: user.userType
        };

        res.json(result);
      } catch (error) {
        console.error("Error executing workflow:", error);
        res.status(500).json({ error: "Error ejecutando workflow" });
      }
    }
  );

  // Assistant access endpoint
  app.get('/api/atlas/assistants',
    isAuthenticated,
    requireNonAdmin,
    checkPermission('assistant_access'),
    async (req: any, res) => {
      try {
        const user = req.userData;
        const permissions = req.userPermissions;

        // Return assistants based on user type and subscription
        const assistants = [];
        const maxAssistants = permissions.maxAssistants;

        for (let i = 1; i <= Math.min(maxAssistants, 100); i++) {
          assistants.push({
            id: `assistant_${i}`,
            name: `Atlas Assistant ${i}`,
            type: user.userType,
            specialized: i <= 10 ? 'basic' : i <= 25 ? 'advanced' : 'premium',
            available: i <= maxAssistants
          });
        }

        res.json({
          assistants,
          maxAssistants: permissions.maxAssistants,
          userType: user.userType,
          subscriptionTier: user.subscriptionTier
        });
      } catch (error) {
        console.error("Error fetching assistants:", error);
        res.status(500).json({ error: "Error obteniendo asistentes" });
      }
    }
  );

  // Usage statistics endpoint
  app.get('/api/user/usage',
    isAuthenticated,
    requireNonAdmin,
    async (req: any, res) => {
      try {
        const user = req.userData;
        const currentMonth = new Date().toISOString().substring(0, 7);
        const usage = await storage.getUserUsage(user.id, currentMonth);
        const permissions = getUserPermissions(user.userType, user.subscriptionTier);

        res.json({
          currentUsage: usage || {
            chatRequests: 0,
            workflowExecutions: 0,
            assistantsUsed: 0,
            storageUsed: 0,
            apiCalls: 0
          },
          limits: {
            maxChatRequests: permissions.maxChatRequests,
            maxWorkflows: permissions.maxWorkflows,
            maxAssistants: permissions.maxAssistants
          },
          userType: user.userType,
          subscriptionTier: user.subscriptionTier,
          month: currentMonth
        });
      } catch (error) {
        console.error("Error fetching usage:", error);
        res.status(500).json({ error: "Error obteniendo estadísticas de uso" });
      }
    }
  );

  // Upgrade endpoint
  app.post('/api/user/upgrade',
    isAuthenticated,
    requireNonAdmin,
    async (req: any, res) => {
      try {
        const { subscriptionTier } = req.body;
        const user = req.userData;

        if (!['free', 'basic', 'premium', 'enterprise'].includes(subscriptionTier)) {
          return res.status(400).json({ error: 'Nivel de suscripción inválido' });
        }

        // Update user subscription (in a real app, integrate with payment processor)
        const updatedUser = await storage.upsertUser({
          ...user,
          subscriptionTier,
          maxChatRequests: subscriptionTier === 'free' ? (user.userType === 'individual' ? 10 : 50) :
                          subscriptionTier === 'basic' ? (user.userType === 'individual' ? 100 : 1000) :
                          subscriptionTier === 'premium' ? (user.userType === 'individual' ? 500 : 5000) : -1,
          maxWorkflows: subscriptionTier === 'free' ? (user.userType === 'individual' ? 1 : 3) :
                       subscriptionTier === 'basic' ? (user.userType === 'individual' ? 5 : 15) :
                       subscriptionTier === 'premium' ? (user.userType === 'individual' ? 20 : 50) : -1,
          maxAssistants: subscriptionTier === 'free' ? (user.userType === 'individual' ? 3 : 5) :
                        subscriptionTier === 'basic' ? (user.userType === 'individual' ? 10 : 50) :
                        subscriptionTier === 'premium' ? (user.userType === 'individual' ? 25 : 100) : -1,
        });

        const permissions = getUserPermissions(updatedUser.userType, updatedUser.subscriptionTier);

        res.json({
          ...updatedUser,
          permissions,
          message: `Actualizado exitosamente a ${subscriptionTier}`
        });
      } catch (error) {
        console.error("Error upgrading user:", error);
        res.status(500).json({ error: "Error actualizando suscripción" });
      }
    }
  );

  // Get subscription plans
  app.get('/api/subscription-plans/:userType',
    async (req: any, res) => {
      try {
        const { userType } = req.params;

        if (!['individual', 'business', 'government'].includes(userType)) {
          return res.status(400).json({ error: 'Tipo de usuario inválido' });
        }

        // Return plans based on user type (in a real app, fetch from database)
        const plans = {
          individual: [
            {
              tier: 'free',
              name: 'Gratis',
              price: 0,
              features: ['10 chats/mes', '1 workflow', '3 asistentes'],
              limits: { chatRequests: 10, workflows: 1, assistants: 3 }
            },
            {
              tier: 'basic',
              name: 'Básico',
              price: 19,
              features: ['100 chats/mes', '5 workflows', '10 asistentes', 'Soporte email'],
              limits: { chatRequests: 100, workflows: 5, assistants: 10 }
            },
            {
              tier: 'premium',
              name: 'Premium',
              price: 49,
              features: ['500 chats/mes', '20 workflows', '25 asistentes', 'Soporte 24/7'],
              limits: { chatRequests: 500, workflows: 20, assistants: 25 }
            }
          ],
          business: [
            {
              tier: 'free',
              name: 'Startup',
              price: 99,
              features: ['50 chats/usuario', '3 workflows', '5 asistentes', 'Hasta 10 usuarios'],
              limits: { chatRequests: 50, workflows: 3, assistants: 5 }
            },
            {
              tier: 'basic',
              name: 'Profesional',
              price: 299,
              features: ['1000 chats/usuario', '15 workflows', '50 asistentes', 'Hasta 50 usuarios'],
              limits: { chatRequests: 1000, workflows: 15, assistants: 50 }
            },
            {
              tier: 'premium',
              name: 'Enterprise',
              price: 999,
              features: ['Ilimitado', 'Workflows ilimitados', 'Asistentes ilimitados', 'Usuarios ilimitados'],
              limits: { chatRequests: -1, workflows: -1, assistants: -1 }
            }
          ],
          government: [
            {
              tier: 'free',
              name: 'Municipal',
              price: 499,
              features: ['100 chats/ciudadano', '5 servicios', '10 agentes', 'Nivel municipal'],
              limits: { chatRequests: 100, workflows: 5, assistants: 10 }
            },
            {
              tier: 'basic',
              name: 'Regional',
              price: 1999,
              features: ['2000 chats/ciudadano', '25 servicios', '75 agentes', 'Nivel regional'],
              limits: { chatRequests: 2000, workflows: 25, assistants: 75 }
            },
            {
              tier: 'premium',
              name: 'Nacional',
              price: 9999,
              features: ['Ilimitado', 'Servicios ilimitados', 'Agentes ilimitados', 'Nivel nacional'],
              limits: { chatRequests: -1, workflows: -1, assistants: -1 }
            }
          ]
        };

        res.json(plans[userType as keyof typeof plans] || []);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
        res.status(500).json({ error: "Error obteniendo planes de suscripción" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}

export { registerRBACRoutes as registerRoutes };