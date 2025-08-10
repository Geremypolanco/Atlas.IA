// Notification system - Real email/SMS automation for Atlas AI
import nodemailer from 'nodemailer';
import twilio from 'twilio';

export class NotificationEngine {
  constructor() {
    this.setupEmailTransporter();
    this.setupSMSClient();
    this.notificationLog = [];
  }

  setupEmailTransporter() {
    try {
      this.emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'atlas.emergency@gmail.com',
          pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD
        }
      });
    } catch (error) {
      console.error('Email setup error:', error);
    }
  }

  setupSMSClient() {
    try {
      if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
        this.smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      }
    } catch (error) {
      console.error('SMS setup error:', error);
    }
  }

  async sendEmail(to, subject, message, isHTML = true) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter not configured');
      }

      const mailOptions = {
        from: process.env.EMAIL_USER || 'Atlas AI Emergency <atlas.emergency@gmail.com>',
        to: to,
        subject: subject,
        [isHTML ? 'html' : 'text']: message
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      this.logNotification('email', to, subject, 'sent', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logNotification('email', to, subject, 'failed', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async sendSMS(to, message) {
    try {
      if (!this.smsClient) {
        throw new Error('SMS client not configured - need TWILIO_SID and TWILIO_TOKEN');
      }

      const result = await this.smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE || '+1234567890',
        to: to
      });

      this.logNotification('sms', to, message.substring(0, 50), 'sent', result.sid);

      return {
        success: true,
        sid: result.sid,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logNotification('sms', to, message.substring(0, 50), 'failed', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async enviarAlerta(evento) {
    const alertTemplates = {
      emergency_revenue: {
        email: {
          subject: '🚨 ATLAS AI - ALERTA DE EMERGENCIA: $0 Generados',
          message: `
            <h2>🚨 ALERTA CRÍTICA DE ATLAS AI</h2>
            <p><strong>Estado actual:</strong> $0 generados en las últimas 24 horas</p>
            <p><strong>Acción requerida:</strong> Activar protocolo de emergencia inmediatamente</p>
            
            <h3>📱 PASOS INMEDIATOS:</h3>
            <ol>
              <li>Descargar apps: Dave, Earnin, MoneyLion</li>
              <li>Completar verificación de identidad</li>
              <li>Solicitar adelantos ($800-1,200 potencial)</li>
              <li>Activar distribución viral</li>
            </ol>
            
            <p><strong>Tiempo crítico:</strong> 72 horas para objetivo $2,000</p>
            <p><strong>Protocolo:</strong> <a href="/emergency-protocol">Activar ahora</a></p>
          `
        },
        sms: '🚨 ATLAS EMERGENCY: $0 generados. Activa protocolo cash advance AHORA. Dave+Earnin=$1200 potencial en 24h.'
      },
      
      viral_activation: {
        email: {
          subject: '🚀 ATLAS AI - Activar Distribución Viral AHORA',
          message: `
            <h2>🚀 PROTOCOLO VIRAL ACTIVADO</h2>
            <p>El contenido viral está listo para distribución masiva</p>
            
            <h3>📲 DISTRIBUCIÓN INMEDIATA:</h3>
            <ul>
              <li>WhatsApp: 20+ contactos personales</li>
              <li>Facebook/Instagram: Stories + Posts</li>
              <li>TikTok: Videos de 60s preparados</li>
              <li>LinkedIn: Posts profesionales listos</li>
            </ul>
            
            <p><strong>Objetivo:</strong> 100+ conversiones en 48h</p>
            <p><strong>Revenue potencial:</strong> $10K-30K</p>
          `
        },
        sms: '🚀 ATLAS VIRAL: Contenido listo. Distribuye en WhatsApp+Redes AHORA. 100 conversiones=$10K potencial.'
      },

      revenue_milestone: {
        email: {
          subject: '💰 ATLAS AI - Milestone de Revenue Alcanzado',
          message: `
            <h2>💰 MILESTONE ALCANZADO</h2>
            <p>Atlas AI ha generado revenue significativo</p>
            
            <h3>📊 MÉTRICAS ACTUALES:</h3>
            <ul>
              <li>Revenue total: $${evento.revenue || 0}</li>
              <li>Conversiones: ${evento.conversions || 0}</li>
              <li>Tasa conversión: ${evento.conversionRate || 0}%</li>
            </ul>
            
            <p><strong>Próximo objetivo:</strong> Escalar a $50K/mes</p>
          `
        },
        sms: `💰 ATLAS MILESTONE: $${evento.revenue || 0} generados! Escalando a $50K/mes. Mantén distribución viral activa.`
      }
    };

    const template = alertTemplates[evento.tipo] || alertTemplates.emergency_revenue;
    const results = {
      email: null,
      sms: null,
      timestamp: new Date().toISOString()
    };

    // Enviar email
    if (evento.email) {
      results.email = await this.sendEmail(
        evento.email,
        template.email.subject,
        template.email.message,
        true
      );
    }

    // Enviar SMS
    if (evento.phone) {
      results.sms = await this.sendSMS(evento.phone, template.sms);
    }

    return results;
  }

  logNotification(type, destination, content, status, details) {
    this.notificationLog.push({
      type,
      destination,
      content: content.substring(0, 100),
      status,
      details,
      timestamp: new Date().toISOString()
    });

    // Mantener solo los últimos 100 logs
    if (this.notificationLog.length > 100) {
      this.notificationLog = this.notificationLog.slice(-100);
    }
  }

  getNotificationHistory() {
    return this.notificationLog;
  }

  getStats() {
    const total = this.notificationLog.length;
    const sent = this.notificationLog.filter(log => log.status === 'sent').length;
    const failed = this.notificationLog.filter(log => log.status === 'failed').length;

    return {
      total,
      sent,
      failed,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
      lastNotification: this.notificationLog[this.notificationLog.length - 1] || null
    };
  }
}

export const notifications = new NotificationEngine();