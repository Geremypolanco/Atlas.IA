#!/usr/bin/env python3
"""
AtlasOutbound-AI: Lead Scorer Module
Evalúa y prioriza leads según criterios de conversión y fit estratégico
"""

import json
import sqlite3
import requests
import re
from typing import Dict, List, Any
from datetime import datetime, timedelta
import os

class LeadScorer:
    def __init__(self, config_path="config/scoring_rules.json"):
        self.scoring_rules = self.load_scoring_rules(config_path)
        self.db_path = "data/atlas_leads.db"
        
    def load_scoring_rules(self, config_path: str) -> Dict:
        """Carga reglas de scoring"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self.get_default_scoring_rules()
    
    def get_default_scoring_rules(self) -> Dict:
        """Reglas de scoring por defecto"""
        return {
            "position_scores": {
                "CEO": 100,
                "CTO": 95,
                "CMO": 90,
                "VP": 85,
                "Director": 80,
                "Manager": 70,
                "Founder": 100,
                "Owner": 95,
                "Head": 75,
                "Lead": 65
            },
            "industry_scores": {
                "artificial intelligence": 100,
                "software development": 95,
                "digital marketing": 90,
                "e-commerce": 85,
                "fintech": 95,
                "healthcare technology": 90,
                "cybersecurity": 95,
                "cloud computing": 90,
                "saas": 95,
                "technology": 80
            },
            "company_size_scores": {
                "startup": 90,
                "small": 85,
                "medium": 75,
                "large": 60,
                "enterprise": 50
            },
            "location_scores": {
                "Silicon Valley": 100,
                "San Francisco": 95,
                "New York": 90,
                "Austin": 85,
                "Seattle": 90,
                "Boston": 85,
                "Los Angeles": 80,
                "Chicago": 75,
                "Miami": 70,
                "United States": 80
            },
            "buying_signals": {
                "hiring": 20,
                "funding": 25,
                "expansion": 15,
                "new_product": 20,
                "technology_investment": 25,
                "digital_transformation": 30,
                "automation": 25,
                "ai_adoption": 30
            }
        }
    
    def score_lead(self, lead: Dict) -> int:
        """Calcula score total para un lead"""
        total_score = 0
        
        # Score por posición
        position_score = self.score_position(lead.get("position", ""))
        total_score += position_score
        
        # Score por industria
        industry_score = self.score_industry(lead.get("industry", ""))
        total_score += industry_score
        
        # Score por ubicación
        location_score = self.score_location(lead.get("location", ""))
        total_score += location_score
        
        # Score por tamaño de empresa
        company_size_score = self.score_company_size(lead)
        total_score += company_size_score
        
        # Score por señales de compra
        buying_signals_score = self.score_buying_signals(lead)
        total_score += buying_signals_score
        
        # Score por completitud de datos
        completeness_score = self.score_data_completeness(lead)
        total_score += completeness_score
        
        # Score por engagement potencial
        engagement_score = self.score_engagement_potential(lead)
        total_score += engagement_score
        
        return min(total_score, 1000)  # Cap máximo de 1000
    
    def score_position(self, position: str) -> int:
        """Score basado en posición/cargo"""
        position_lower = position.lower()
        
        for key, score in self.scoring_rules["position_scores"].items():
            if key.lower() in position_lower:
                return score
        
        # Score adicional para palabras clave
        if any(keyword in position_lower for keyword in ["chief", "senior", "principal"]):
            return 85
        elif any(keyword in position_lower for keyword in ["junior", "assistant", "coordinator"]):
            return 30
        
        return 50  # Score neutral
    
    def score_industry(self, industry: str) -> int:
        """Score basado en industria"""
        industry_lower = industry.lower()
        
        for key, score in self.scoring_rules["industry_scores"].items():
            if key in industry_lower:
                return score
        
        return 40  # Score neutral para industrias no específicas
    
    def score_location(self, location: str) -> int:
        """Score basado en ubicación"""
        location_lower = location.lower()
        
        for key, score in self.scoring_rules["location_scores"].items():
            if key.lower() in location_lower:
                return score
        
        return 30  # Score neutral para ubicaciones no específicas
    
    def score_company_size(self, lead: Dict) -> int:
        """Score basado en tamaño de empresa"""
        employees = lead.get("employees", "")
        
        if not employees:
            return 20
        
        try:
            emp_count = int(re.findall(r'\d+', str(employees))[0])
            
            if emp_count < 50:
                return self.scoring_rules["company_size_scores"]["startup"]
            elif emp_count < 200:
                return self.scoring_rules["company_size_scores"]["small"]
            elif emp_count < 1000:
                return self.scoring_rules["company_size_scores"]["medium"]
            elif emp_count < 5000:
                return self.scoring_rules["company_size_scores"]["large"]
            else:
                return self.scoring_rules["company_size_scores"]["enterprise"]
        except:
            return 20
    
    def score_buying_signals(self, lead: Dict) -> int:
        """Score basado en señales de compra"""
        signals_text = (lead.get("buying_signals", "") + " " + 
                       lead.get("notes", "") + " " + 
                       lead.get("company", "")).lower()
        
        total_signal_score = 0
        
        for signal, score in self.scoring_rules["buying_signals"].items():
            if signal.replace("_", " ") in signals_text:
                total_signal_score += score
        
        return min(total_signal_score, 100)
    
    def score_data_completeness(self, lead: Dict) -> int:
        """Score basado en completitud de datos"""
        required_fields = ["name", "email", "company", "position"]
        optional_fields = ["linkedin_url", "industry", "location", "phone"]
        
        required_score = sum(20 for field in required_fields if lead.get(field))
        optional_score = sum(5 for field in optional_fields if lead.get(field))
        
        return required_score + optional_score
    
    def score_engagement_potential(self, lead: Dict) -> int:
        """Score basado en potencial de engagement"""
        score = 0
        
        # Bonus por email corporativo
        email = lead.get("email", "")
        if email and not any(domain in email for domain in ["gmail", "yahoo", "hotmail", "outlook"]):
            score += 15
        
        # Bonus por LinkedIn URL
        if lead.get("linkedin_url"):
            score += 10
        
        # Bonus por website de empresa
        if lead.get("company_website"):
            score += 10
        
        # Penalty por falta de email
        if not email:
            score -= 30
        
        return max(score, 0)
    
    def update_lead_score(self, lead_id: int, score: int):
        """Actualiza score de lead en la base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE leads SET score = ? WHERE id = ?",
            (score, lead_id)
        )
        
        conn.commit()
        conn.close()
    
    def score_all_leads(self):
        """Calcula scores para todos los leads sin score"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM leads WHERE score = 0 OR score IS NULL")
        columns = [description[0] for description in cursor.description]
        leads = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        scored_count = 0
        
        for lead in leads:
            score = self.score_lead(lead)
            self.update_lead_score(lead["id"], score)
            scored_count += 1
            
            if scored_count % 10 == 0:
                print(f"✅ Scored {scored_count} leads...")
        
        conn.close()
        print(f"🎯 Finished scoring {scored_count} leads")
        
        return scored_count
    
    def get_top_leads(self, limit: int = 50, min_score: int = 200) -> List[Dict]:
        """Obtiene los mejores leads por score"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM leads 
            WHERE score >= ? AND status = 'new'
            ORDER BY score DESC 
            LIMIT ?
        ''', (min_score, limit))
        
        columns = [description[0] for description in cursor.description]
        leads = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return leads
    
    def get_leads_by_criteria(self, industry: str = None, location: str = None, 
                             min_score: int = 100, limit: int = 25) -> List[Dict]:
        """Obtiene leads filtrados por criterios específicos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT * FROM leads WHERE score >= ?"
        params = [min_score]
        
        if industry:
            query += " AND industry LIKE ?"
            params.append(f"%{industry}%")
        
        if location:
            query += " AND location LIKE ?"
            params.append(f"%{location}%")
        
        query += " ORDER BY score DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        columns = [description[0] for description in cursor.description]
        leads = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return leads
    
    def analyze_lead_quality(self) -> Dict:
        """Analiza la calidad general de los leads"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Estadísticas generales
        cursor.execute("SELECT COUNT(*), AVG(score), MAX(score), MIN(score) FROM leads")
        stats = cursor.fetchone()
        
        # Distribución por score
        cursor.execute('''
            SELECT 
                CASE 
                    WHEN score >= 800 THEN 'Excellent (800+)'
                    WHEN score >= 600 THEN 'Good (600-799)'
                    WHEN score >= 400 THEN 'Average (400-599)'
                    WHEN score >= 200 THEN 'Poor (200-399)'
                    ELSE 'Very Poor (0-199)'
                END as score_range,
                COUNT(*) as count
            FROM leads
            GROUP BY score_range
        ''')
        
        distribution = dict(cursor.fetchall())
        
        # Top industrias
        cursor.execute('''
            SELECT industry, COUNT(*), AVG(score)
            FROM leads
            GROUP BY industry
            ORDER BY AVG(score) DESC
            LIMIT 10
        ''')
        
        top_industries = cursor.fetchall()
        
        conn.close()
        
        return {
            "total_leads": stats[0],
            "average_score": round(stats[1], 2) if stats[1] else 0,
            "max_score": stats[2],
            "min_score": stats[3],
            "score_distribution": distribution,
            "top_industries": top_industries,
            "analysis_date": datetime.now().isoformat()
        }
    
    def prioritize_outreach(self, campaign_type: str = "general") -> List[Dict]:
        """Prioriza leads para campañas de outreach"""
        
        if campaign_type == "high_value":
            min_score = 700
            limit = 20
        elif campaign_type == "enterprise":
            min_score = 500
            limit = 30
        elif campaign_type == "startup":
            min_score = 400
            limit = 50
        else:  # general
            min_score = 300
            limit = 100
        
        leads = self.get_top_leads(limit, min_score)
        
        # Agregar razón de priorización
        for lead in leads:
            lead["priority_reason"] = self.get_priority_reason(lead)
        
        return leads
    
    def get_priority_reason(self, lead: Dict) -> str:
        """Genera razón de priorización para un lead"""
        reasons = []
        
        score = lead.get("score", 0)
        position = lead.get("position", "").lower()
        industry = lead.get("industry", "").lower()
        
        if score >= 800:
            reasons.append("Excellent fit")
        elif score >= 600:
            reasons.append("Strong candidate")
        
        if any(title in position for title in ["ceo", "cto", "founder"]):
            reasons.append("Decision maker")
        
        if any(ind in industry for ind in ["ai", "artificial intelligence", "fintech", "saas"]):
            reasons.append("High-value industry")
        
        if lead.get("buying_signals"):
            reasons.append("Active buying signals")
        
        return "; ".join(reasons) if reasons else "Standard priority"

if __name__ == "__main__":
    # Ejemplo de uso autónomo
    scorer = LeadScorer()
    
    print("🎯 Starting lead scoring process...")
    scored_count = scorer.score_all_leads()
    
    print("\n📊 Lead quality analysis:")
    analysis = scorer.analyze_lead_quality()
    print(json.dumps(analysis, indent=2))
    
    print("\n🥇 Top priority leads:")
    top_leads = scorer.get_top_leads(10)
    for lead in top_leads:
        print(f"  • {lead['name']} ({lead['company']}) - Score: {lead['score']}")