#!/usr/bin/env python3
"""
AtlasOutbound-AI: Tracker Module
Monitorea aperturas, clics, respuestas y ajusta estrategia en tiempo real
"""

import json
import sqlite3
import requests
import time
from typing import Dict, List, Any
from datetime import datetime, timedelta
import re

class OutreachTracker:
    def __init__(self, config_path="config/api_keys.json"):
        self.config = self.load_config(config_path)
        self.db_path = "data/atlas_leads.db"
        self.init_tracking_tables()
        
    def load_config(self, config_path: str) -> Dict:
        """Carga configuración de tracking"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "sendgrid_api_key": "",
                "mailgun_api_key": "",
                "mailgun_domain": "",
                "tracking_domain": "tracking.atlas-ai.com",
                "webhook_secret": "atlas_webhook_secret_key"
            }
    
    def init_tracking_tables(self):
        """Inicializa tablas de tracking adicionales"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de eventos de tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tracking_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER,
                lead_id INTEGER,
                event_type TEXT,
                event_data TEXT,
                user_agent TEXT,
                ip_address TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages (id),
                FOREIGN KEY (lead_id) REFERENCES leads (id)
            )
        ''')
        
        # Tabla de performance de campañas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS campaign_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_name TEXT,
                date DATE,
                sent_count INTEGER DEFAULT 0,
                delivered_count INTEGER DEFAULT 0,
                opened_count INTEGER DEFAULT 0,
                clicked_count INTEGER DEFAULT 0,
                replied_count INTEGER DEFAULT 0,
                converted_count INTEGER DEFAULT 0,
                open_rate REAL DEFAULT 0,
                click_rate REAL DEFAULT 0,
                reply_rate REAL DEFAULT 0,
                conversion_rate REAL DEFAULT 0
            )
        ''')
        
        # Tabla de A/B testing
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ab_tests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_name TEXT,
                variant TEXT,
                message_id INTEGER,
                lead_id INTEGER,
                result TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages (id),
                FOREIGN KEY (lead_id) REFERENCES leads (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def track_email_open(self, tracking_id: str, user_agent: str = "", ip_address: str = "") -> bool:
        """Registra apertura de email"""
        try:
            # Extraer información del tracking ID
            message_id, lead_id = self.parse_tracking_id(tracking_id)
            if not message_id:
                return False
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verificar si ya fue registrada la apertura
            cursor.execute(
                "SELECT id FROM tracking_events WHERE message_id = ? AND event_type = 'email_open'",
                (message_id,)
            )
            
            if cursor.fetchone():
                conn.close()
                return True  # Ya registrada
            
            # Registrar evento
            cursor.execute('''
                INSERT INTO tracking_events (
                    message_id, lead_id, event_type, user_agent, ip_address
                ) VALUES (?, ?, 'email_open', ?, ?)
            ''', (message_id, lead_id, user_agent, ip_address))
            
            # Actualizar mensaje
            cursor.execute(
                "UPDATE messages SET opened_at = ? WHERE id = ?",
                (datetime.now().isoformat(), message_id)
            )
            
            # Actualizar métricas del lead
            cursor.execute(
                "UPDATE leads SET response_status = 'opened' WHERE id = ? AND response_status IS NULL",
                (lead_id,)
            )
            
            conn.commit()
            conn.close()
            
            print(f"📧 Email opened: Message {message_id} by Lead {lead_id}")
            return True
            
        except Exception as e:
            print(f"Error tracking email open: {e}")
            return False
    
    def track_email_click(self, tracking_id: str, clicked_url: str, user_agent: str = "", ip_address: str = "") -> bool:
        """Registra clic en email"""
        try:
            message_id, lead_id = self.parse_tracking_id(tracking_id)
            if not message_id:
                return False
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Registrar evento
            event_data = json.dumps({"clicked_url": clicked_url})
            cursor.execute('''
                INSERT INTO tracking_events (
                    message_id, lead_id, event_type, event_data, user_agent, ip_address
                ) VALUES (?, ?, 'email_click', ?, ?, ?)
            ''', (message_id, lead_id, event_data, user_agent, ip_address))
            
            # Actualizar mensaje (solo el primer clic)
            cursor.execute("SELECT clicked_at FROM messages WHERE id = ?", (message_id,))
            if not cursor.fetchone()[0]:
                cursor.execute(
                    "UPDATE messages SET clicked_at = ? WHERE id = ?",
                    (datetime.now().isoformat(), message_id)
                )
            
            # Actualizar métricas del lead
            cursor.execute(
                "UPDATE leads SET response_status = 'clicked' WHERE id = ?",
                (lead_id,)
            )
            
            conn.commit()
            conn.close()
            
            print(f"🔗 Email clicked: Message {message_id} by Lead {lead_id} -> {clicked_url}")
            return True
            
        except Exception as e:
            print(f"Error tracking email click: {e}")
            return False
    
    def track_email_reply(self, message_id: int, reply_content: str = "") -> bool:
        """Registra respuesta a email"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Obtener lead_id
            cursor.execute("SELECT lead_id FROM messages WHERE id = ?", (message_id,))
            result = cursor.fetchone()
            if not result:
                conn.close()
                return False
            
            lead_id = result[0]
            
            # Registrar evento
            event_data = json.dumps({"reply_content": reply_content[:500]})  # Truncar contenido
            cursor.execute('''
                INSERT INTO tracking_events (
                    message_id, lead_id, event_type, event_data
                ) VALUES (?, ?, 'email_reply', ?)
            ''', (message_id, lead_id, event_data))
            
            # Actualizar mensaje
            cursor.execute(
                "UPDATE messages SET replied_at = ? WHERE id = ?",
                (datetime.now().isoformat(), message_id)
            )
            
            # Actualizar lead como respondido
            cursor.execute(
                "UPDATE leads SET response_status = 'replied', status = 'engaged' WHERE id = ?",
                (lead_id,)
            )
            
            conn.commit()
            conn.close()
            
            print(f"📨 Email reply received: Message {message_id} from Lead {lead_id}")
            return True
            
        except Exception as e:
            print(f"Error tracking email reply: {e}")
            return False
    
    def track_bounce(self, message_id: int, bounce_type: str = "hard") -> bool:
        """Registra rebote de email"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Obtener lead_id
            cursor.execute("SELECT lead_id FROM messages WHERE id = ?", (message_id,))
            result = cursor.fetchone()
            if not result:
                conn.close()
                return False
            
            lead_id = result[0]
            
            # Registrar evento
            event_data = json.dumps({"bounce_type": bounce_type})
            cursor.execute('''
                INSERT INTO tracking_events (
                    message_id, lead_id, event_type, event_data
                ) VALUES (?, ?, 'email_bounce', ?)
            ''', (message_id, lead_id, event_data))
            
            # Actualizar mensaje
            cursor.execute(
                "UPDATE messages SET delivery_status = 'bounced' WHERE id = ?",
                (message_id,)
            )
            
            # Marcar email como inválido si es hard bounce
            if bounce_type == "hard":
                cursor.execute(
                    "UPDATE leads SET response_status = 'invalid_email', status = 'invalid' WHERE id = ?",
                    (lead_id,)
                )
            
            conn.commit()
            conn.close()
            
            print(f"⚠️ Email bounced: Message {message_id} ({bounce_type} bounce)")
            return True
            
        except Exception as e:
            print(f"Error tracking bounce: {e}")
            return False
    
    def parse_tracking_id(self, tracking_id: str) -> tuple:
        """Extrae message_id y lead_id del tracking ID"""
        try:
            # Formato: atlas_{lead_id}_{timestamp}
            parts = tracking_id.split('_')
            if len(parts) >= 3 and parts[0] == "atlas":
                lead_id = int(parts[1])
                
                # Buscar message_id correspondiente
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute(
                    "SELECT id FROM messages WHERE lead_id = ? AND tracking_id = ?",
                    (lead_id, tracking_id)
                )
                
                result = cursor.fetchone()
                conn.close()
                
                if result:
                    return result[0], lead_id
            
            return None, None
            
        except Exception:
            return None, None
    
    def get_message_metrics(self, message_id: int) -> Dict:
        """Obtiene métricas específicas de un mensaje"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Información básica del mensaje
        cursor.execute('''
            SELECT m.*, l.name, l.company, l.email
            FROM messages m
            JOIN leads l ON m.lead_id = l.id
            WHERE m.id = ?
        ''', (message_id,))
        
        columns = [description[0] for description in cursor.description]
        message_data = cursor.fetchone()
        
        if not message_data:
            conn.close()
            return {}
        
        message = dict(zip(columns, message_data))
        
        # Eventos de tracking
        cursor.execute('''
            SELECT event_type, timestamp, event_data
            FROM tracking_events
            WHERE message_id = ?
            ORDER BY timestamp
        ''', (message_id,))
        
        events = cursor.fetchall()
        conn.close()
        
        # Calcular métricas
        metrics = {
            "message_id": message_id,
            "lead_name": message.get("name"),
            "company": message.get("company"),
            "email": message.get("email"),
            "sent_at": message.get("sent_at"),
            "opened_at": message.get("opened_at"),
            "clicked_at": message.get("clicked_at"),
            "replied_at": message.get("replied_at"),
            "delivery_status": message.get("delivery_status"),
            "events": [{"type": e[0], "timestamp": e[1], "data": json.loads(e[2]) if e[2] else {}} for e in events],
            "is_delivered": message.get("delivery_status") == "sent",
            "is_opened": message.get("opened_at") is not None,
            "is_clicked": message.get("clicked_at") is not None,
            "is_replied": message.get("replied_at") is not None
        }
        
        return metrics
    
    def get_campaign_metrics(self, campaign: str, days: int = 30) -> Dict:
        """Obtiene métricas de campaña"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Métricas básicas
        cursor.execute('''
            SELECT 
                COUNT(*) as total_sent,
                SUM(CASE WHEN delivery_status = 'sent' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
                SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
                SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) as replied
            FROM messages
            WHERE campaign = ? AND sent_at >= ?
        ''', (campaign, start_date))
        
        stats = cursor.fetchone()
        
        # Performance por día
        cursor.execute('''
            SELECT 
                DATE(sent_at) as date,
                COUNT(*) as sent,
                SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
                SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
                SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) as replied
            FROM messages
            WHERE campaign = ? AND sent_at >= ?
            GROUP BY DATE(sent_at)
            ORDER BY date DESC
        ''', (campaign, start_date))
        
        daily_stats = cursor.fetchall()
        
        conn.close()
        
        # Calcular rates
        total_sent = stats[0] if stats[0] > 0 else 1  # Evitar división por cero
        delivered = stats[1]
        opened = stats[2]
        clicked = stats[3]
        replied = stats[4]
        
        metrics = {
            "campaign": campaign,
            "period_days": days,
            "total_sent": total_sent,
            "delivered": delivered,
            "opened": opened,
            "clicked": clicked,
            "replied": replied,
            "delivery_rate": round((delivered / total_sent) * 100, 2),
            "open_rate": round((opened / delivered) * 100, 2) if delivered > 0 else 0,
            "click_rate": round((clicked / opened) * 100, 2) if opened > 0 else 0,
            "reply_rate": round((replied / delivered) * 100, 2) if delivered > 0 else 0,
            "click_to_open_rate": round((clicked / opened) * 100, 2) if opened > 0 else 0,
            "daily_performance": [
                {
                    "date": row[0],
                    "sent": row[1],
                    "opened": row[2],
                    "clicked": row[3],
                    "replied": row[4],
                    "open_rate": round((row[2] / row[1]) * 100, 2) if row[1] > 0 else 0
                }
                for row in daily_stats
            ]
        }
        
        return metrics
    
    def get_lead_engagement_score(self, lead_id: int) -> int:
        """Calcula score de engagement para un lead"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener eventos del lead
        cursor.execute('''
            SELECT event_type, timestamp
            FROM tracking_events
            WHERE lead_id = ?
            ORDER BY timestamp DESC
        ''', (lead_id,))
        
        events = cursor.fetchall()
        
        # Obtener información de mensajes
        cursor.execute('''
            SELECT COUNT(*) as total_messages,
                   SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
                   SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicks,
                   SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) as replies
            FROM messages
            WHERE lead_id = ?
        ''', (lead_id,))
        
        message_stats = cursor.fetchone()
        conn.close()
        
        # Calcular score de engagement
        score = 0
        
        if message_stats:
            total_messages = message_stats[0]
            opens = message_stats[1]
            clicks = message_stats[2]
            replies = message_stats[3]
            
            if total_messages > 0:
                # Puntos por apertura
                score += (opens / total_messages) * 30
                
                # Puntos por clics
                score += (clicks / total_messages) * 50
                
                # Puntos por respuestas
                score += (replies / total_messages) * 100
                
                # Bonus por múltiples interacciones
                if opens > 1:
                    score += 10
                if clicks > 1:
                    score += 20
                if replies > 0:
                    score += 50
        
        # Bonus por recencia de actividad
        recent_events = [e for e in events if (datetime.now() - datetime.fromisoformat(e[1])).days <= 7]
        score += len(recent_events) * 5
        
        return min(int(score), 100)  # Cap a 100
    
    def analyze_optimal_send_times(self, days: int = 30) -> Dict:
        """Analiza los mejores momentos para enviar mensajes"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Análisis por hora del día
        cursor.execute('''
            SELECT 
                CAST(strftime('%H', sent_at) AS INTEGER) as hour,
                COUNT(*) as sent,
                SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
                SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked
            FROM messages
            WHERE sent_at >= ?
            GROUP BY hour
            ORDER BY hour
        ''', (start_date,))
        
        hourly_stats = cursor.fetchall()
        
        # Análisis por día de la semana
        cursor.execute('''
            SELECT 
                CAST(strftime('%w', sent_at) AS INTEGER) as day_of_week,
                COUNT(*) as sent,
                SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
                SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked
            FROM messages
            WHERE sent_at >= ?
            GROUP BY day_of_week
            ORDER BY day_of_week
        ''', (start_date,))
        
        daily_stats = cursor.fetchall()
        conn.close()
        
        days_map = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 
                   4: "Thursday", 5: "Friday", 6: "Saturday"}
        
        # Procesar estadísticas
        best_hours = []
        for hour, sent, opened, clicked in hourly_stats:
            if sent > 0:
                open_rate = (opened / sent) * 100
                click_rate = (clicked / sent) * 100
                best_hours.append({
                    "hour": hour,
                    "sent": sent,
                    "open_rate": round(open_rate, 2),
                    "click_rate": round(click_rate, 2),
                    "score": round(open_rate + click_rate * 2, 2)  # Weighted score
                })
        
        best_days = []
        for day_num, sent, opened, clicked in daily_stats:
            if sent > 0:
                open_rate = (opened / sent) * 100
                click_rate = (clicked / sent) * 100
                best_days.append({
                    "day": days_map[day_num],
                    "day_number": day_num,
                    "sent": sent,
                    "open_rate": round(open_rate, 2),
                    "click_rate": round(click_rate, 2),
                    "score": round(open_rate + click_rate * 2, 2)
                })
        
        # Ordenar por score
        best_hours.sort(key=lambda x: x["score"], reverse=True)
        best_days.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "analysis_period_days": days,
            "best_hours": best_hours[:5],  # Top 5 horas
            "best_days": best_days[:3],    # Top 3 días
            "recommendations": {
                "optimal_hour": best_hours[0]["hour"] if best_hours else 10,
                "optimal_day": best_days[0]["day"] if best_days else "Tuesday",
                "avoid_hours": [h["hour"] for h in best_hours[-2:]] if len(best_hours) > 2 else [],
                "avoid_days": [d["day"] for d in best_days[-2:]] if len(best_days) > 2 else []
            }
        }
    
    def generate_performance_report(self, campaign: str = None, days: int = 7) -> Dict:
        """Genera reporte completo de performance"""
        
        if campaign:
            campaign_metrics = self.get_campaign_metrics(campaign, days)
        else:
            # Métricas generales
            campaign_metrics = self.get_campaign_metrics("general", days)
        
        send_time_analysis = self.analyze_optimal_send_times(days)
        
        # Top performers
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Mejores leads por engagement
        cursor.execute('''
            SELECT l.name, l.company, l.email, l.response_status,
                   COUNT(m.id) as messages_sent,
                   SUM(CASE WHEN m.opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
                   SUM(CASE WHEN m.clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicks,
                   SUM(CASE WHEN m.replied_at IS NOT NULL THEN 1 ELSE 0 END) as replies
            FROM leads l
            JOIN messages m ON l.id = m.lead_id
            WHERE m.sent_at >= ?
            GROUP BY l.id
            HAVING opens > 0 OR clicks > 0 OR replies > 0
            ORDER BY replies DESC, clicks DESC, opens DESC
            LIMIT 10
        ''', (start_date,))
        
        top_engaged_leads = cursor.fetchall()
        conn.close()
        
        report = {
            "report_date": datetime.now().isoformat(),
            "period_days": days,
            "campaign": campaign or "All Campaigns",
            "campaign_metrics": campaign_metrics,
            "send_time_analysis": send_time_analysis,
            "top_engaged_leads": [
                {
                    "name": row[0],
                    "company": row[1],
                    "email": row[2],
                    "status": row[3],
                    "messages_sent": row[4],
                    "opens": row[5],
                    "clicks": row[6],
                    "replies": row[7]
                }
                for row in top_engaged_leads
            ],
            "insights": self.generate_insights(campaign_metrics, send_time_analysis)
        }
        
        return report
    
    def generate_insights(self, metrics: Dict, timing: Dict) -> List[str]:
        """Genera insights basados en métricas"""
        insights = []
        
        open_rate = metrics.get("open_rate", 0)
        click_rate = metrics.get("click_rate", 0)
        reply_rate = metrics.get("reply_rate", 0)
        
        # Insights sobre open rate
        if open_rate > 25:
            insights.append(f"📈 Excellent open rate ({open_rate}%) - subject lines are working well")
        elif open_rate < 15:
            insights.append(f"📉 Low open rate ({open_rate}%) - consider testing new subject lines")
        
        # Insights sobre click rate
        if click_rate > 5:
            insights.append(f"🎯 Strong click rate ({click_rate}%) - content is engaging")
        elif click_rate < 2:
            insights.append(f"🔗 Low click rate ({click_rate}%) - improve call-to-action and content")
        
        # Insights sobre reply rate
        if reply_rate > 3:
            insights.append(f"💬 Great reply rate ({reply_rate}%) - leads are interested")
        elif reply_rate < 1:
            insights.append(f"📧 Low reply rate ({reply_rate}%) - personalize messages more")
        
        # Insights sobre timing
        best_hour = timing.get("recommendations", {}).get("optimal_hour", 10)
        best_day = timing.get("recommendations", {}).get("optimal_day", "Tuesday")
        
        insights.append(f"⏰ Best send time: {best_day}s at {best_hour}:00")
        
        return insights

if __name__ == "__main__":
    # Ejemplo de uso autónomo
    tracker = OutreachTracker()
    
    # Generar reporte de performance
    report = tracker.generate_performance_report(days=7)
    
    print("📊 ATLAS OUTBOUND PERFORMANCE REPORT")
    print("=" * 50)
    print(f"Campaign: {report['campaign']}")
    print(f"Period: Last {report['period_days']} days")
    print()
    
    metrics = report['campaign_metrics']
    print(f"📧 Messages sent: {metrics['total_sent']}")
    print(f"📈 Open rate: {metrics['open_rate']}%")
    print(f"🔗 Click rate: {metrics['click_rate']}%")
    print(f"💬 Reply rate: {metrics['reply_rate']}%")
    print()
    
    print("💡 Key Insights:")
    for insight in report['insights']:
        print(f"  • {insight}")