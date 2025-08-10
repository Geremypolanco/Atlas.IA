#!/usr/bin/env python3
"""
AtlasOutbound-AI: Auto Sender Module
Envía mensajes por email, LinkedIn o WhatsApp usando SMTP o APIs externas
"""

import json
import smtplib
import sqlite3
import requests
import time
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Any
from datetime import datetime, timedelta
import os

class AutoSender:
    def __init__(self, config_path="config/api_keys.json"):
        self.config = self.load_config(config_path)
        self.db_path = "data/atlas_leads.db"
        self.init_tracking_tables()
        
    def load_config(self, config_path: str) -> Dict:
        """Carga configuración de APIs y SMTP"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "smtp_server": "smtp.gmail.com",
                "smtp_port": 587,
                "smtp_username": "",
                "smtp_password": "",
                "sendgrid_api_key": "",
                "mailgun_api_key": "",
                "mailgun_domain": "",
                "linkedin_access_token": "",
                "twilio_account_sid": "",
                "twilio_auth_token": "",
                "twilio_phone_number": "",
                "daily_send_limit": 50,
                "hourly_send_limit": 10,
                "delay_between_sends": 30
            }
    
    def init_tracking_tables(self):
        """Inicializa tablas de tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de mensajes (si no existe)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lead_id INTEGER,
                subject TEXT,
                body TEXT,
                tone TEXT,
                message_type TEXT,
                campaign TEXT,
                personalization_score INTEGER,
                status TEXT DEFAULT 'draft',
                generated_at TIMESTAMP,
                sent_at TIMESTAMP,
                opened_at TIMESTAMP,
                clicked_at TIMESTAMP,
                replied_at TIMESTAMP,
                delivery_status TEXT,
                send_channel TEXT,
                tracking_id TEXT,
                error_message TEXT,
                FOREIGN KEY (lead_id) REFERENCES leads (id)
            )
        ''')
        
        # Tabla de métricas de envío
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS send_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE,
                channel TEXT,
                sent_count INTEGER DEFAULT 0,
                delivered_count INTEGER DEFAULT 0,
                opened_count INTEGER DEFAULT 0,
                clicked_count INTEGER DEFAULT 0,
                replied_count INTEGER DEFAULT 0,
                bounced_count INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def send_email_smtp(self, to_email: str, subject: str, body: str, lead_id: int = None) -> Dict:
        """Envía email usando SMTP"""
        try:
            # Configurar mensaje
            msg = MIMEMultipart()
            msg['From'] = self.config["smtp_username"]
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Agregar tracking pixel (opcional)
            tracking_id = f"atlas_{lead_id}_{int(time.time())}" if lead_id else None
            
            # Convertir texto a HTML básico
            html_body = body.replace('\n', '<br>')
            if tracking_id:
                html_body += f'<img src="https://tracking.atlas-ai.com/pixel/{tracking_id}.png" width="1" height="1" style="display:none;">'
            
            msg.attach(MIMEText(html_body, 'html'))
            
            # Conectar y enviar
            server = smtplib.SMTP(self.config["smtp_server"], self.config["smtp_port"])
            server.starttls()
            server.login(self.config["smtp_username"], self.config["smtp_password"])
            
            text = msg.as_string()
            server.sendmail(self.config["smtp_username"], to_email, text)
            server.quit()
            
            return {
                "success": True,
                "channel": "smtp",
                "tracking_id": tracking_id,
                "sent_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "channel": "smtp",
                "error": str(e)
            }
    
    def send_email_sendgrid(self, to_email: str, subject: str, body: str, lead_id: int = None) -> Dict:
        """Envía email usando SendGrid API"""
        if not self.config.get("sendgrid_api_key"):
            return {"success": False, "error": "SendGrid API key not configured"}
        
        try:
            tracking_id = f"atlas_{lead_id}_{int(time.time())}" if lead_id else None
            
            headers = {
                "Authorization": f"Bearer {self.config['sendgrid_api_key']}",
                "Content-Type": "application/json"
            }
            
            # Convertir a HTML con tracking
            html_content = body.replace('\n', '<br>')
            if tracking_id:
                html_content += f'<img src="https://tracking.atlas-ai.com/pixel/{tracking_id}.png" width="1" height="1" style="display:none;">'
            
            payload = {
                "personalizations": [{
                    "to": [{"email": to_email}],
                    "custom_args": {"tracking_id": tracking_id} if tracking_id else {}
                }],
                "from": {"email": self.config["smtp_username"]},
                "subject": subject,
                "content": [
                    {"type": "text/plain", "value": body},
                    {"type": "text/html", "value": html_content}
                ],
                "tracking_settings": {
                    "click_tracking": {"enable": True},
                    "open_tracking": {"enable": True}
                }
            }
            
            response = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 202:
                return {
                    "success": True,
                    "channel": "sendgrid",
                    "tracking_id": tracking_id,
                    "sent_at": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "channel": "sendgrid",
                    "error": f"SendGrid error: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "channel": "sendgrid",
                "error": str(e)
            }
    
    def send_email_mailgun(self, to_email: str, subject: str, body: str, lead_id: int = None) -> Dict:
        """Envía email usando Mailgun API"""
        if not self.config.get("mailgun_api_key") or not self.config.get("mailgun_domain"):
            return {"success": False, "error": "Mailgun not configured"}
        
        try:
            tracking_id = f"atlas_{lead_id}_{int(time.time())}" if lead_id else None
            
            # Preparar datos
            data = {
                "from": f"Atlas AI <noreply@{self.config['mailgun_domain']}>",
                "to": to_email,
                "subject": subject,
                "text": body,
                "html": body.replace('\n', '<br>'),
                "o:tracking": "yes",
                "o:tracking-clicks": "yes",
                "o:tracking-opens": "yes"
            }
            
            if tracking_id:
                data["v:tracking_id"] = tracking_id
            
            response = requests.post(
                f"https://api.mailgun.net/v3/{self.config['mailgun_domain']}/messages",
                auth=("api", self.config["mailgun_api_key"]),
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "channel": "mailgun",
                    "tracking_id": tracking_id,
                    "mailgun_id": response.json().get("id"),
                    "sent_at": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "channel": "mailgun",
                    "error": f"Mailgun error: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "channel": "mailgun",
                "error": str(e)
            }
    
    def send_linkedin_message(self, linkedin_url: str, message: str, lead_id: int = None) -> Dict:
        """Envía mensaje por LinkedIn (requiere API o automatización)"""
        # Nota: LinkedIn API tiene restricciones estrictas para mensajería
        # Esta implementación es conceptual y requeriría autorización específica
        
        if not self.config.get("linkedin_access_token"):
            return {"success": False, "error": "LinkedIn access token not configured"}
        
        try:
            # Extraer user ID de URL de LinkedIn
            user_id = self.extract_linkedin_user_id(linkedin_url)
            if not user_id:
                return {"success": False, "error": "Could not extract LinkedIn user ID"}
            
            headers = {
                "Authorization": f"Bearer {self.config['linkedin_access_token']}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            }
            
            payload = {
                "recipients": [f"urn:li:person:{user_id}"],
                "message": {
                    "subject": "Connection from Atlas AI",
                    "body": message
                }
            }
            
            # Nota: Este endpoint es conceptual - LinkedIn API real requiere aprobación
            response = requests.post(
                "https://api.linkedin.com/v2/messages",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 201:
                return {
                    "success": True,
                    "channel": "linkedin",
                    "sent_at": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "channel": "linkedin",
                    "error": f"LinkedIn error: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "channel": "linkedin",
                "error": str(e)
            }
    
    def send_whatsapp_message(self, phone_number: str, message: str, lead_id: int = None) -> Dict:
        """Envía mensaje por WhatsApp usando Twilio"""
        if not self.config.get("twilio_account_sid") or not self.config.get("twilio_auth_token"):
            return {"success": False, "error": "Twilio not configured"}
        
        try:
            from twilio.rest import Client
            
            client = Client(
                self.config["twilio_account_sid"],
                self.config["twilio_auth_token"]
            )
            
            message_obj = client.messages.create(
                body=message,
                from_=f"whatsapp:{self.config['twilio_phone_number']}",
                to=f"whatsapp:{phone_number}"
            )
            
            return {
                "success": True,
                "channel": "whatsapp",
                "twilio_sid": message_obj.sid,
                "sent_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "channel": "whatsapp",
                "error": str(e)
            }
    
    def extract_linkedin_user_id(self, linkedin_url: str) -> str:
        """Extrae user ID de URL de LinkedIn"""
        # Implementación simplificada - en producción usaría LinkedIn API
        import re
        match = re.search(r'/in/([^/?]+)', linkedin_url)
        return match.group(1) if match else None
    
    def send_message_to_lead(self, lead: Dict, message: Dict, channel: str = "auto") -> Dict:
        """Envía mensaje a un lead usando el canal especificado"""
        
        # Determinar canal automáticamente si no se especifica
        if channel == "auto":
            channel = self.determine_best_channel(lead)
        
        # Verificar límites de envío
        if not self.check_send_limits():
            return {
                "success": False,
                "error": "Daily or hourly send limit reached"
            }
        
        result = {"success": False, "channel": channel}
        
        try:
            if channel == "email":
                email = lead.get("email")
                if not email:
                    return {"success": False, "error": "No email address available"}
                
                # Probar múltiples proveedores en orden de preferencia
                if self.config.get("sendgrid_api_key"):
                    result = self.send_email_sendgrid(email, message["subject"], message["body"], lead.get("id"))
                elif self.config.get("mailgun_api_key"):
                    result = self.send_email_mailgun(email, message["subject"], message["body"], lead.get("id"))
                else:
                    result = self.send_email_smtp(email, message["subject"], message["body"], lead.get("id"))
            
            elif channel == "linkedin":
                linkedin_url = lead.get("linkedin_url")
                if not linkedin_url:
                    return {"success": False, "error": "No LinkedIn URL available"}
                
                result = self.send_linkedin_message(linkedin_url, message["body"], lead.get("id"))
            
            elif channel == "whatsapp":
                phone = lead.get("phone")
                if not phone:
                    return {"success": False, "error": "No phone number available"}
                
                result = self.send_whatsapp_message(phone, message["body"], lead.get("id"))
            
            # Actualizar estado en base de datos
            if result["success"]:
                self.update_message_status(message.get("id"), "sent", result)
                self.update_lead_status(lead.get("id"), "contacted")
                self.track_send_metrics(channel)
            else:
                self.update_message_status(message.get("id"), "failed", result)
            
            # Delay entre envíos
            delay = self.config.get("delay_between_sends", 30)
            time.sleep(random.uniform(delay * 0.5, delay * 1.5))
            
            return result
            
        except Exception as e:
            result["error"] = str(e)
            self.update_message_status(message.get("id"), "failed", result)
            return result
    
    def determine_best_channel(self, lead: Dict) -> str:
        """Determina el mejor canal para contactar un lead"""
        # Priorizar email si está disponible
        if lead.get("email"):
            return "email"
        elif lead.get("linkedin_url"):
            return "linkedin"
        elif lead.get("phone"):
            return "whatsapp"
        else:
            return "email"  # Fallback
    
    def check_send_limits(self) -> bool:
        """Verifica límites de envío diarios y por hora"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        today = datetime.now().date()
        hour_ago = datetime.now() - timedelta(hours=1)
        
        # Verificar límite diario
        cursor.execute('''
            SELECT COUNT(*) FROM messages 
            WHERE DATE(sent_at) = ? AND status = 'sent'
        ''', (today,))
        
        daily_count = cursor.fetchone()[0]
        daily_limit = self.config.get("daily_send_limit", 50)
        
        # Verificar límite por hora
        cursor.execute('''
            SELECT COUNT(*) FROM messages 
            WHERE sent_at >= ? AND status = 'sent'
        ''', (hour_ago.isoformat(),))
        
        hourly_count = cursor.fetchone()[0]
        hourly_limit = self.config.get("hourly_send_limit", 10)
        
        conn.close()
        
        return daily_count < daily_limit and hourly_count < hourly_limit
    
    def update_message_status(self, message_id: int, status: str, result: Dict):
        """Actualiza estado del mensaje en la base de datos"""
        if not message_id:
            return
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        update_data = {
            "status": status,
            "send_channel": result.get("channel"),
            "tracking_id": result.get("tracking_id"),
            "delivery_status": "sent" if result.get("success") else "failed",
            "error_message": result.get("error")
        }
        
        if result.get("success"):
            update_data["sent_at"] = result.get("sent_at", datetime.now().isoformat())
        
        # Construir query dinámicamente
        set_clause = ", ".join([f"{key} = ?" for key in update_data.keys()])
        values = list(update_data.values()) + [message_id]
        
        cursor.execute(f"UPDATE messages SET {set_clause} WHERE id = ?", values)
        conn.commit()
        conn.close()
    
    def update_lead_status(self, lead_id: int, status: str):
        """Actualiza estado del lead"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE leads SET status = ?, last_contacted = ? WHERE id = ?",
            (status, datetime.now().isoformat(), lead_id)
        )
        
        conn.commit()
        conn.close()
    
    def track_send_metrics(self, channel: str):
        """Registra métricas de envío"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        today = datetime.now().date()
        
        # Verificar si existe registro para hoy
        cursor.execute(
            "SELECT id FROM send_metrics WHERE date = ? AND channel = ?",
            (today, channel)
        )
        
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute(
                "UPDATE send_metrics SET sent_count = sent_count + 1 WHERE id = ?",
                (existing[0],)
            )
        else:
            cursor.execute(
                "INSERT INTO send_metrics (date, channel, sent_count) VALUES (?, ?, 1)",
                (today, channel)
            )
        
        conn.commit()
        conn.close()
    
    def process_outreach_queue(self, limit: int = None):
        """Procesa cola de mensajes pendientes"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener mensajes pendientes
        query = '''
            SELECT m.*, l.email, l.linkedin_url, l.phone, l.name, l.company
            FROM messages m
            JOIN leads l ON m.lead_id = l.id
            WHERE m.status = 'draft'
            ORDER BY l.score DESC
        '''
        
        if limit:
            query += f" LIMIT {limit}"
        
        cursor.execute(query)
        columns = [description[0] for description in cursor.description]
        pending_messages = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        
        results = []
        processed = 0
        
        for msg_data in pending_messages:
            if not self.check_send_limits():
                print(f"⚠️ Send limits reached. Processed {processed} messages.")
                break
            
            # Construir objetos lead y message
            lead = {
                "id": msg_data["lead_id"],
                "email": msg_data["email"],
                "linkedin_url": msg_data["linkedin_url"],
                "phone": msg_data["phone"],
                "name": msg_data["name"],
                "company": msg_data["company"]
            }
            
            message = {
                "id": msg_data["id"],
                "subject": msg_data["subject"],
                "body": msg_data["body"]
            }
            
            print(f"📧 Sending message to {lead['name']} at {lead.get('company', 'Unknown Company')}...")
            
            result = self.send_message_to_lead(lead, message, "email")
            results.append(result)
            processed += 1
            
            if result["success"]:
                print(f"  ✅ Sent successfully via {result['channel']}")
            else:
                print(f"  ❌ Failed: {result.get('error', 'Unknown error')}")
        
        print(f"🎯 Processed {processed} messages from outreach queue")
        return results

if __name__ == "__main__":
    # Ejemplo de uso autónomo
    sender = AutoSender()
    
    print("📧 Starting automated outreach process...")
    results = sender.process_outreach_queue(limit=10)
    
    successful = sum(1 for r in results if r["success"])
    print(f"✅ Successfully sent {successful}/{len(results)} messages")