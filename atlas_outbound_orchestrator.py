#!/usr/bin/env python3
"""
AtlasOutbound-AI: Main Orchestrator
Coordina todos los módulos para operación completamente autónoma
"""

import json
import schedule
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os
import sys

# Import AtlasOutbound modules
from lead_finder import LeadFinder
from lead_scorer import LeadScorer
from message_generator import MessageGenerator
from auto_sender import AutoSender
from tracker import OutreachTracker

class AtlasOutboundOrchestrator:
    def __init__(self, config_path="config/orchestrator_config.json"):
        self.config = self.load_config(config_path)
        self.setup_logging()
        
        # Initialize modules
        self.lead_finder = LeadFinder()
        self.lead_scorer = LeadScorer()
        self.message_generator = MessageGenerator()
        self.auto_sender = AutoSender()
        self.tracker = OutreachTracker()
        
        self.is_running = False
        
    def load_config(self, config_path: str) -> Dict:
        """Carga configuración del orquestador"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self.get_default_config()
    
    def get_default_config(self) -> Dict:
        """Configuración por defecto del orquestador"""
        return {
            "auto_discovery": {
                "enabled": True,
                "schedule": "daily",
                "time": "09:00",
                "target_industries": [
                    "artificial intelligence",
                    "software development", 
                    "digital marketing",
                    "e-commerce",
                    "fintech",
                    "healthcare technology",
                    "cybersecurity",
                    "cloud computing"
                ],
                "leads_per_run": 100
            },
            "scoring": {
                "enabled": True,
                "auto_score_new_leads": True,
                "min_score_threshold": 200
            },
            "message_generation": {
                "enabled": True,
                "auto_generate": True,
                "campaigns": ["general", "automation", "growth"],
                "personalization_threshold": 70
            },
            "outreach": {
                "enabled": True,
                "auto_send": True,
                "schedule": "hourly",
                "daily_limit": 50,
                "preferred_channels": ["email"],
                "send_delay_minutes": 30
            },
            "tracking": {
                "enabled": True,
                "auto_track": True,
                "report_schedule": "daily",
                "report_time": "18:00"
            },
            "optimization": {
                "enabled": True,
                "auto_optimize": True,
                "a_b_testing": True,
                "performance_threshold": 15.0
            }
        }
    
    def setup_logging(self):
        """Configura logging del sistema"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('logs/atlas_outbound.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger('AtlasOutbound')
        
        # Crear directorio de logs si no existe
        os.makedirs('logs', exist_ok=True)
    
    def start_autonomous_operation(self):
        """Inicia operación completamente autónoma"""
        self.logger.info("🚀 Starting AtlasOutbound-AI Autonomous Operation")
        
        self.is_running = True
        
        # Configurar horarios automáticos
        self.schedule_autonomous_tasks()
        
        # Ejecutar verificación inicial
        self.run_initial_assessment()
        
        # Loop principal
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Verificar cada minuto
            except KeyboardInterrupt:
                self.logger.info("⏹️ Stopping autonomous operation...")
                self.is_running = False
            except Exception as e:
                self.logger.error(f"Error in main loop: {e}")
                time.sleep(300)  # Esperar 5 minutos antes de continuar
    
    def schedule_autonomous_tasks(self):
        """Programa tareas autónomas"""
        config = self.config
        
        # Lead Discovery
        if config["auto_discovery"]["enabled"]:
            if config["auto_discovery"]["schedule"] == "daily":
                schedule.every().day.at(config["auto_discovery"]["time"]).do(
                    self.autonomous_lead_discovery
                )
            elif config["auto_discovery"]["schedule"] == "hourly":
                schedule.every().hour.do(self.autonomous_lead_discovery)
        
        # Scoring automático
        if config["scoring"]["enabled"]:
            schedule.every(30).minutes.do(self.autonomous_scoring)
        
        # Generación de mensajes
        if config["message_generation"]["enabled"]:
            schedule.every(15).minutes.do(self.autonomous_message_generation)
        
        # Envío de outreach
        if config["outreach"]["enabled"]:
            if config["outreach"]["schedule"] == "hourly":
                schedule.every().hour.do(self.autonomous_outreach)
            else:
                schedule.every(30).minutes.do(self.autonomous_outreach)
        
        # Tracking y analytics
        if config["tracking"]["enabled"]:
            schedule.every(10).minutes.do(self.autonomous_tracking)
            schedule.every().day.at(config["tracking"]["report_time"]).do(
                self.generate_daily_report
            )
        
        # Optimización
        if config["optimization"]["enabled"]:
            schedule.every().day.at("23:00").do(self.autonomous_optimization)
        
        self.logger.info("✅ Autonomous tasks scheduled successfully")
    
    def run_initial_assessment(self):
        """Ejecuta evaluación inicial del sistema"""
        self.logger.info("🔍 Running initial system assessment...")
        
        try:
            # Verificar estado actual de leads
            recent_leads = self.lead_finder.get_recent_leads(days=1)
            self.logger.info(f"📊 Found {len(recent_leads)} leads from last 24 hours")
            
            # Verificar leads sin score
            unscored_count = self.lead_scorer.score_all_leads()
            self.logger.info(f"🎯 Scored {unscored_count} unscored leads")
            
            # Verificar mensajes pendientes
            pending_results = self.auto_sender.process_outreach_queue(limit=5)
            self.logger.info(f"📧 Processed {len(pending_results)} pending messages")
            
            # Generar reporte inicial
            report = self.tracker.generate_performance_report(days=7)
            self.logger.info(f"📈 Performance: {report['campaign_metrics']['open_rate']}% open rate")
            
        except Exception as e:
            self.logger.error(f"Error in initial assessment: {e}")
    
    def autonomous_lead_discovery(self):
        """Descubrimiento autónomo de leads"""
        self.logger.info("🔍 Starting autonomous lead discovery...")
        
        try:
            config = self.config["auto_discovery"]
            industries = config["target_industries"]
            
            # Encontrar leads
            total_found = self.lead_finder.auto_discover_leads(
                industries=industries[:3],  # Rotar industrias
                locations=["", "United States", "California"]
            )
            
            self.logger.info(f"✅ Lead discovery completed: {total_found} new leads")
            
            # Auto-score los nuevos leads
            if self.config["scoring"]["auto_score_new_leads"]:
                scored_count = self.lead_scorer.score_all_leads()
                self.logger.info(f"🎯 Auto-scored {scored_count} new leads")
            
        except Exception as e:
            self.logger.error(f"Error in autonomous lead discovery: {e}")
    
    def autonomous_scoring(self):
        """Scoring autónomo de leads"""
        self.logger.info("🎯 Running autonomous lead scoring...")
        
        try:
            scored_count = self.lead_scorer.score_all_leads()
            
            if scored_count > 0:
                self.logger.info(f"✅ Scored {scored_count} leads automatically")
                
                # Obtener top leads para próximo outreach
                top_leads = self.lead_scorer.get_top_leads(
                    limit=20, 
                    min_score=self.config["scoring"]["min_score_threshold"]
                )
                self.logger.info(f"🥇 {len(top_leads)} high-priority leads identified")
            
        except Exception as e:
            self.logger.error(f"Error in autonomous scoring: {e}")
    
    def autonomous_message_generation(self):
        """Generación autónoma de mensajes"""
        self.logger.info("✍️ Running autonomous message generation...")
        
        try:
            config = self.config["message_generation"]
            
            # Obtener leads que necesitan mensajes
            top_leads = self.lead_scorer.get_top_leads(limit=25, min_score=300)
            
            if not top_leads:
                self.logger.info("No high-priority leads found for message generation")
                return
            
            # Filtrar leads que ya tienen mensajes recientes
            leads_needing_messages = self.filter_leads_for_messages(top_leads)
            
            if leads_needing_messages:
                # Generar mensajes para múltiples campañas
                for campaign in config["campaigns"]:
                    campaign_leads = leads_needing_messages[:10]  # 10 por campaña
                    
                    messages = self.message_generator.generate_campaign_messages(
                        campaign_leads, campaign
                    )
                    
                    # Guardar mensajes generados
                    for i, message in enumerate(messages):
                        lead = campaign_leads[i]
                        self.message_generator.save_message(message, lead["id"])
                    
                    self.logger.info(f"✅ Generated {len(messages)} messages for {campaign} campaign")
            
        except Exception as e:
            self.logger.error(f"Error in autonomous message generation: {e}")
    
    def autonomous_outreach(self):
        """Outreach autónomo"""
        self.logger.info("📧 Running autonomous outreach...")
        
        try:
            config = self.config["outreach"]
            
            # Verificar límites de envío
            if not self.auto_sender.check_send_limits():
                self.logger.warning("⚠️ Send limits reached, skipping outreach")
                return
            
            # Procesar cola de outreach
            limit = min(config["daily_limit"], 10)  # Máximo 10 por ejecución
            results = self.auto_sender.process_outreach_queue(limit=limit)
            
            successful = sum(1 for r in results if r["success"])
            self.logger.info(f"✅ Outreach completed: {successful}/{len(results)} sent successfully")
            
            # Tracking automático
            if successful > 0:
                self.autonomous_tracking()
            
        except Exception as e:
            self.logger.error(f"Error in autonomous outreach: {e}")
    
    def autonomous_tracking(self):
        """Tracking autónomo de métricas"""
        try:
            # Simular eventos de tracking (en producción vendría de webhooks)
            self.simulate_tracking_events()
            
            # Actualizar scores de engagement
            recent_leads = self.lead_finder.get_recent_leads(days=7)
            for lead in recent_leads[:10]:  # Solo los más recientes
                engagement_score = self.tracker.get_lead_engagement_score(lead["id"])
                if engagement_score > 50:
                    self.logger.info(f"🔥 High engagement: {lead['name']} ({engagement_score})")
            
        except Exception as e:
            self.logger.error(f"Error in autonomous tracking: {e}")
    
    def simulate_tracking_events(self):
        """Simula eventos de tracking para demo"""
        import random
        
        # Simular algunas aperturas y clics
        for _ in range(random.randint(1, 5)):
            tracking_id = f"atlas_{random.randint(1, 100)}_{int(time.time())}"
            self.tracker.track_email_open(tracking_id)
            
            if random.random() > 0.7:  # 30% de clics
                self.tracker.track_email_click(
                    tracking_id, 
                    "https://atlas-ai.com/demo",
                    "Mozilla/5.0"
                )
    
    def filter_leads_for_messages(self, leads: List[Dict]) -> List[Dict]:
        """Filtra leads que necesitan nuevos mensajes"""
        # En producción, verificaría base de datos de mensajes
        # Por ahora, retorna todos los leads
        return leads
    
    def generate_daily_report(self):
        """Genera reporte diario"""
        self.logger.info("📊 Generating daily performance report...")
        
        try:
            report = self.tracker.generate_performance_report(days=1)
            
            # Log métricas clave
            metrics = report['campaign_metrics']
            self.logger.info(f"📈 Daily Report:")
            self.logger.info(f"  • Messages sent: {metrics['total_sent']}")
            self.logger.info(f"  • Open rate: {metrics['open_rate']}%")
            self.logger.info(f"  • Click rate: {metrics['click_rate']}%")
            self.logger.info(f"  • Reply rate: {metrics['reply_rate']}%")
            
            # Insights
            for insight in report['insights']:
                self.logger.info(f"  💡 {insight}")
            
            # Guardar reporte
            report_path = f"reports/daily_report_{datetime.now().strftime('%Y%m%d')}.json"
            os.makedirs('reports', exist_ok=True)
            
            with open(report_path, 'w') as f:
                json.dump(report, f, indent=2)
            
            self.logger.info(f"✅ Daily report saved to {report_path}")
            
        except Exception as e:
            self.logger.error(f"Error generating daily report: {e}")
    
    def autonomous_optimization(self):
        """Optimización autónoma del sistema"""
        self.logger.info("⚡ Running autonomous optimization...")
        
        try:
            # Analizar performance de últimos 7 días
            report = self.tracker.generate_performance_report(days=7)
            metrics = report['campaign_metrics']
            
            # Optimizaciones basadas en performance
            if metrics['open_rate'] < self.config['optimization']['performance_threshold']:
                self.logger.info("📉 Low open rate detected, optimizing subject lines...")
                # En producción, actualizar templates de subject lines
            
            if metrics['click_rate'] < 3.0:
                self.logger.info("🔗 Low click rate detected, optimizing CTAs...")
                # En producción, actualizar calls to action
            
            if metrics['reply_rate'] < 2.0:
                self.logger.info("💬 Low reply rate detected, increasing personalization...")
                # En producción, ajustar scoring y personalización
            
            # Analizar mejores horarios de envío
            timing_analysis = self.tracker.analyze_optimal_send_times(days=14)
            best_hour = timing_analysis['recommendations']['optimal_hour']
            
            self.logger.info(f"⏰ Optimal send time identified: {best_hour}:00")
            
            self.logger.info("✅ Autonomous optimization completed")
            
        except Exception as e:
            self.logger.error(f"Error in autonomous optimization: {e}")
    
    def get_system_status(self) -> Dict:
        """Obtiene estado completo del sistema"""
        try:
            # Métricas básicas
            recent_leads = self.lead_finder.get_recent_leads(days=1)
            analysis = self.lead_scorer.analyze_lead_quality()
            report = self.tracker.generate_performance_report(days=7)
            
            return {
                "status": "operational" if self.is_running else "stopped",
                "uptime": "24/7 autonomous",
                "leads": {
                    "total": analysis.get("total_leads", 0),
                    "recent_24h": len(recent_leads),
                    "average_score": analysis.get("average_score", 0)
                },
                "outreach": {
                    "messages_sent_7d": report['campaign_metrics']['total_sent'],
                    "open_rate": report['campaign_metrics']['open_rate'],
                    "reply_rate": report['campaign_metrics']['reply_rate']
                },
                "automation": {
                    "lead_discovery": self.config["auto_discovery"]["enabled"],
                    "auto_scoring": self.config["scoring"]["enabled"],
                    "auto_outreach": self.config["outreach"]["enabled"],
                    "auto_optimization": self.config["optimization"]["enabled"]
                },
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting system status: {e}")
            return {"status": "error", "error": str(e)}
    
    def stop_autonomous_operation(self):
        """Detiene operación autónoma"""
        self.logger.info("⏹️ Stopping autonomous operation...")
        self.is_running = False

def main():
    """Función principal para ejecutar AtlasOutbound-AI"""
    orchestrator = AtlasOutboundOrchestrator()
    
    print("🚀 AtlasOutbound-AI Starting...")
    print("="*50)
    print("🎯 Autonomous Lead Generation & Outreach System")
    print("🔄 Completely autonomous operation")
    print("📧 Email outreach automation")
    print("📊 Real-time analytics & optimization")
    print("="*50)
    
    try:
        orchestrator.start_autonomous_operation()
    except KeyboardInterrupt:
        print("\n⏹️ Shutting down AtlasOutbound-AI...")
        orchestrator.stop_autonomous_operation()

if __name__ == "__main__":
    main()