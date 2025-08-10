/**
 * Atlas Independent Auth - Sistema de autenticación sin dependencia de Replit
 * Reemplaza completamente Replit Auth con JWT + bcrypt
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

export interface AtlasUser {
  id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  created: Date;
  lastLogin?: Date;
  verified: boolean;
  revenueGenerated: number;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Omit<AtlasUser, 'password'>;
  message?: string;
}

export class AtlasIndependentAuth {
  private jwtSecret: string;
  private users: Map<string, AtlasUser> = new Map();

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'atlas_ultra_secure_secret_2024_' + Date.now();
    this.initializeDefaultUsers().catch(error => {
      console.error('❌ ATLAS AUTH: Error initializing demo users:', error);
    });
  }

  // Initialize with demo users for immediate access
  private async initializeDefaultUsers(): Promise<void> {
    const demoUsers = [
      {
        email: 'admin@atlas.ai',
        password: 'AtlasAdmin2024!',
        plan: 'enterprise' as const,
        firstName: 'Atlas',
        lastName: 'Admin'
      },
      {
        email: 'demo@atlas.ai', 
        password: 'AtlasDemo2024!',
        plan: 'premium' as const,
        firstName: 'Demo',
        lastName: 'User'
      }
    ];

    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user: AtlasUser = {
        id: `atlas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        plan: userData.plan,
        created: new Date(),
        verified: true,
        revenueGenerated: Math.random() * 50000 + 25000
      };
      
      this.users.set(user.email, user);
    }

    console.log('🔐 ATLAS AUTH: Sistema independiente inicializado');
    console.log('👤 Demo users: admin@atlas.ai / AtlasAdmin2024!');
    console.log('👤 Demo users: demo@atlas.ai / AtlasDemo2024!');
  }

  // Create new user account
  async createUser(email: string, password: string, firstName?: string, lastName?: string): Promise<AtlasUser> {
    if (this.users.has(email)) {
      throw new Error('Usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user: AtlasUser = {
      id: `atlas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      firstName: firstName || 'Atlas',
      lastName: lastName || 'User',
      plan: 'basic',
      created: new Date(),
      verified: false,
      revenueGenerated: 0
    };

    this.users.set(email, user);
    console.log(`✅ ATLAS AUTH: Usuario creado - ${email}`);
    
    return user;
  }

  // Login user
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const user = this.users.get(email);
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      const isValidPassword = await bcrypt.compare(password, user.password!);
      if (!isValidPassword) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      // Update last login
      user.lastLogin = new Date();
      this.users.set(email, user);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          plan: user.plan
        },
        this.jwtSecret,
        { expiresIn: '7d' }
      );

      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        created: user.created,
        lastLogin: user.lastLogin,
        verified: user.verified,
        revenueGenerated: user.revenueGenerated
      };

      console.log(`🔓 ATLAS AUTH: Login exitoso - ${email}`);
      
      return {
        success: true,
        token,
        user: userResponse
      };

    } catch (error) {
      console.error('❌ ATLAS AUTH: Error en login:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Get user by ID
  getUserById(id: string): AtlasUser | undefined {
    const usersArray = Array.from(this.users.values());
    return usersArray.find(user => user.id === id);
  }

  // Get user by email
  getUserByEmail(email: string): AtlasUser | undefined {
    return this.users.get(email);
  }

  // Middleware for protecting routes
  requireAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.atlas_token;

      if (!token) {
        return res.status(401).json({ message: 'Token de autorización requerido' });
      }

      const decoded = this.verifyToken(token);
      const user = this.getUserById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      // Add user to request object
      (req as any).user = {
        id: user.id,
        email: user.email,
        plan: user.plan,
        revenueGenerated: user.revenueGenerated
      };

      next();
    } catch (error) {
      console.error('❌ ATLAS AUTH: Error en middleware:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  };

  // Update user revenue
  updateUserRevenue(userId: string, amount: number): boolean {
    const user = this.getUserById(userId);
    if (user) {
      user.revenueGenerated += amount;
      this.users.set(user.email, user);
      return true;
    }
    return false;
  }

  // Get all users (admin only)
  getAllUsers(): Omit<AtlasUser, 'password'>[] {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.plan,
      created: user.created,
      lastLogin: user.lastLogin,
      verified: user.verified,
      revenueGenerated: user.revenueGenerated
    }));
  }

  // Admin middleware
  requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    this.requireAuth(req, res, () => {
      const user = (req as any).user;
      if (user.plan !== 'enterprise') {
        return res.status(403).json({ message: 'Acceso denegado - Requiere plan Enterprise' });
      }
      next();
    });
  };

  // Reset password
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = this.users.get(email);
    if (!user) return false;

    user.password = await bcrypt.hash(newPassword, 12);
    this.users.set(email, user);
    
    console.log(`🔐 ATLAS AUTH: Password reset - ${email}`);
    return true;
  }

  // Verify user email
  verifyUser(email: string): boolean {
    const user = this.users.get(email);
    if (user) {
      user.verified = true;
      this.users.set(email, user);
      return true;
    }
    return false;
  }

  // Upgrade user plan
  upgradePlan(email: string, newPlan: 'basic' | 'premium' | 'enterprise'): boolean {
    const user = this.users.get(email);
    if (user) {
      user.plan = newPlan;
      this.users.set(email, user);
      console.log(`⬆️ ATLAS AUTH: Plan upgraded - ${email} to ${newPlan}`);
      return true;
    }
    return false;
  }

  // Get authentication stats
  getAuthStats(): any {
    const users = Array.from(this.users.values());
    const totalRevenue = users.reduce((sum, user) => sum + user.revenueGenerated, 0);
    
    return {
      total_users: users.length,
      verified_users: users.filter(u => u.verified).length,
      enterprise_users: users.filter(u => u.plan === 'enterprise').length,
      premium_users: users.filter(u => u.plan === 'premium').length,
      basic_users: users.filter(u => u.plan === 'basic').length,
      total_revenue_generated: Math.round(totalRevenue),
      avg_revenue_per_user: users.length > 0 ? Math.round(totalRevenue / users.length) : 0,
      last_24h_logins: users.filter(u => 
        u.lastLogin && (Date.now() - u.lastLogin.getTime()) < 24 * 60 * 60 * 1000
      ).length
    };
  }
}

// Export class and singleton instance
export { AtlasIndependentAuth as AtlasAuth };
export const atlasAuth = new AtlasIndependentAuth();
export default atlasAuth;