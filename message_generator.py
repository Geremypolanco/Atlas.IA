#!/usr/bin/env python3
"""
AtlasOutbound-AI: Message Generator Module
Genera mensajes personalizados usando plantillas dinámicas y tono adaptativo
"""

import json
import random
import re
from typing import Dict, List, Any
from datetime import datetime
import sqlite3

class MessageGenerator:
    def __init__(self, templates_path="config/templates.json"):
        self.templates = self.load_templates(templates_path)
        self.db_path = "data/atlas_leads.db"
        
    def load_templates(self, templates_path: str) -> Dict:
        """Carga plantillas de mensajes"""
        try:
            with open(templates_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self.get_default_templates()
    
    def get_default_templates(self) -> Dict:
        """Plantillas de mensajes por defecto"""
        return {
            "subject_lines": {
                "general": [
                    "Quick question about {company}'s growth strategy",
                    "Helping {company} scale with AI automation",
                    "{name}, thought you'd find this interesting",
                    "Atlas AI solution for {industry} leaders",
                    "5-minute chat about {company}'s digital transformation?",
                    "AI implementation strategy for {company}",
                    "{name}, scaling {company} with intelligent automation"
                ],
                "ceo": [
                    "{name}, scaling {company} with AI leadership",
                    "Strategic AI implementation for {company}",
                    "CEO-to-CEO: AI transformation insights",
                    "{name}, executive briefing on AI ROI",
                    "Board-level AI strategy for {company}"
                ],
                "cto": [
                    "Technical deep-dive: AI architecture for {company}",
                    "{name}, engineering-first AI implementation",
                    "CTO insights: AI infrastructure at scale",
                    "Technical roadmap for {company}'s AI journey",
                    "{name}, developer-friendly AI integration"
                ]
            },
            "openers": {
                "personal": [
                    "Hi {name},",
                    "Hello {name},",
                    "{name},",
                    "Hi there {name},"
                ],
                "formal": [
                    "Dear {name},",
                    "Hello Mr./Ms. {name},",
                    "Greetings {name},"
                ],
                "casual": [
                    "Hey {name},",
                    "{name} -",
                    "Hi {name}!"
                ]
            },
            "intros": {
                "industry_specific": [
                    "I noticed {company} is making waves in the {industry} space.",
                    "Your work at {company} in {industry} caught my attention.",
                    "I've been following {company}'s growth in {industry}.",
                    "Impressive work you're doing at {company} in the {industry} sector."
                ],
                "position_specific": [
                    "As {position} at {company}, you probably deal with...",
                    "In your role as {position}, I imagine you're focused on...",
                    "Leading {company} as {position} must involve..."
                ],
                "general": [
                    "I hope this message finds you well.",
                    "I wanted to reach out with a quick thought.",
                    "I'm reaching out because..."
                ]
            },
            "value_props": {
                "ai_automation": [
                    "Atlas AI helps companies like {company} automate repetitive tasks and increase productivity by 40%.",
                    "We've helped similar {industry} companies reduce operational costs by 35% through intelligent automation.",
                    "Our AI solutions have enabled {industry} leaders to scale operations without proportional staff increases."
                ],
                "revenue_growth": [
                    "Atlas AI has helped companies in {industry} increase revenue by an average of 28% in 6 months.",
                    "We've enabled {industry} businesses to identify new revenue streams through AI-powered insights.",
                    "Companies using Atlas AI report 45% faster customer acquisition in the {industry} space."
                ],
                "competitive_advantage": [
                    "Atlas AI gives {industry} companies a competitive edge through advanced analytics and automation.",
                    "Stay ahead in {industry} with AI-powered decision making and predictive insights.",
                    "Join leading {industry} companies already using Atlas AI to outpace competitors."
                ]
            },
            "social_proof": [
                "We've helped over 500+ companies achieve similar results.",
                "Companies like TechCorp and InnovateLabs have seen 40% efficiency gains.",
                "Our clients in {industry} consistently report ROI within 90 days.",
                "Leading {industry} companies trust Atlas AI for their automation needs."
            ],
            "calls_to_action": {
                "soft": [
                    "Would a brief 15-minute call make sense to explore if there's a fit?",
                    "Interested in a quick conversation about your current challenges?",
                    "Worth a brief chat to see if we can help {company}?",
                    "Open to a short discussion about your automation goals?"
                ],
                "direct": [
                    "Let's schedule a 20-minute demo this week.",
                    "I'd love to show you exactly how this works for {company}.",
                    "Can we book 15 minutes this week to discuss your specific needs?",
                    "I'll send you a calendar link for a brief demo."
                ],
                "value_focused": [
                    "I'll show you exactly how {company} can save $X annually with Atlas AI.",
                    "Let me walk you through a ROI projection specific to {company}.",
                    "I'll prepare a custom analysis of {company}'s automation potential."
                ]
            },
            "closings": [
                "Best regards,",
                "Best,",
                "Thanks,",
                "Looking forward to connecting,",
                "Warm regards,"
            ],
            "signatures": [
                "Atlas AI Team\nAutomating the Future of Business",
                "Atlas AI Solutions\nIntelligent Automation for Modern Enterprises",
                "The Atlas AI Team\nEmpowering Businesses Through AI"
            ]
        }
    
    def generate_message(self, lead: Dict, message_type: str = "initial", 
                        tone: str = "professional", campaign: str = "general") -> Dict:
        """Genera mensaje personalizado para un lead"""
        
        # Determinar tono basado en posición y industria
        if tone == "auto":
            tone = self.determine_tone(lead)
        
        # Seleccionar plantillas apropiadas
        subject = self.generate_subject_line(lead, campaign)
        opener = self.select_opener(lead, tone)
        intro = self.generate_intro(lead)
        value_prop = self.select_value_proposition(lead, campaign)
        social_proof = self.select_social_proof(lead)
        cta = self.select_call_to_action(lead, tone)
        closing = random.choice(self.templates["closings"])
        signature = random.choice(self.templates["signatures"])
        
        # Construir mensaje
        message_body = f"""{opener}

{intro}

{value_prop}

{social_proof}

{cta}

{closing}
{signature}"""
        
        # Personalizar mensaje
        personalized_message = self.personalize_message(message_body, lead)
        personalized_subject = self.personalize_message(subject, lead)
        
        return {
            "subject": personalized_subject,
            "body": personalized_message,
            "tone": tone,
            "message_type": message_type,
            "campaign": campaign,
            "generated_at": datetime.now().isoformat(),
            "lead_id": lead.get("id"),
            "personalization_score": self.calculate_personalization_score(lead)
        }
    
    def determine_tone(self, lead: Dict) -> str:
        """Determina el tono apropiado basado en el lead"""
        position = lead.get("position", "").lower()
        industry = lead.get("industry", "").lower()
        
        if any(title in position for title in ["ceo", "founder", "president"]):
            return "formal"
        elif any(title in position for title in ["developer", "engineer", "technical"]):
            return "casual"
        elif "startup" in industry or "tech" in industry:
            return "casual"
        else:
            return "professional"
    
    def generate_subject_line(self, lead: Dict, campaign: str) -> str:
        """Genera línea de asunto personalizada"""
        position = lead.get("position", "").lower()
        
        if "ceo" in position or "founder" in position:
            subjects = self.templates["subject_lines"]["ceo"]
        elif "cto" in position or "technical" in position:
            subjects = self.templates["subject_lines"]["cto"]
        else:
            subjects = self.templates["subject_lines"]["general"]
        
        return random.choice(subjects)
    
    def select_opener(self, lead: Dict, tone: str) -> str:
        """Selecciona saludo apropiado"""
        if tone == "formal":
            openers = self.templates["openers"]["formal"]
        elif tone == "casual":
            openers = self.templates["openers"]["casual"]
        else:
            openers = self.templates["openers"]["personal"]
        
        return random.choice(openers)
    
    def generate_intro(self, lead: Dict) -> str:
        """Genera introducción personalizada"""
        intros = []
        
        # Priorizar intros específicas de industria/posición
        if lead.get("industry") and lead.get("company"):
            intros.extend(self.templates["intros"]["industry_specific"])
        
        if lead.get("position") and lead.get("company"):
            intros.extend(self.templates["intros"]["position_specific"])
        
        # Fallback a intros generales
        if not intros:
            intros = self.templates["intros"]["general"]
        
        return random.choice(intros)
    
    def select_value_proposition(self, lead: Dict, campaign: str) -> str:
        """Selecciona propuesta de valor apropiada"""
        if campaign == "automation":
            value_props = self.templates["value_props"]["ai_automation"]
        elif campaign == "growth":
            value_props = self.templates["value_props"]["revenue_growth"]
        elif campaign == "competitive":
            value_props = self.templates["value_props"]["competitive_advantage"]
        else:
            # Seleccionar basado en industria/posición
            all_props = []
            all_props.extend(self.templates["value_props"]["ai_automation"])
            all_props.extend(self.templates["value_props"]["revenue_growth"])
            value_props = all_props
        
        return random.choice(value_props)
    
    def select_social_proof(self, lead: Dict) -> str:
        """Selecciona prueba social apropiada"""
        return random.choice(self.templates["social_proof"])
    
    def select_call_to_action(self, lead: Dict, tone: str) -> str:
        """Selecciona call to action apropiado"""
        position = lead.get("position", "").lower()
        
        if "ceo" in position or "founder" in position:
            ctas = self.templates["calls_to_action"]["value_focused"]
        elif tone == "casual":
            ctas = self.templates["calls_to_action"]["soft"]
        else:
            ctas = self.templates["calls_to_action"]["direct"]
        
        return random.choice(ctas)
    
    def personalize_message(self, message: str, lead: Dict) -> str:
        """Personaliza mensaje con datos del lead"""
        replacements = {
            "{name}": lead.get("name", "there").split()[0],  # Solo primer nombre
            "{full_name}": lead.get("name", ""),
            "{company}": lead.get("company", "your company"),
            "{position}": lead.get("position", "your role"),
            "{industry}": lead.get("industry", "your industry"),
            "{location}": lead.get("location", "")
        }
        
        personalized = message
        for placeholder, value in replacements.items():
            if value:  # Solo reemplazar si hay valor
                personalized = personalized.replace(placeholder, value)
        
        return personalized
    
    def calculate_personalization_score(self, lead: Dict) -> int:
        """Calcula score de personalización basado en datos disponibles"""
        score = 0
        
        if lead.get("name"):
            score += 25
        if lead.get("company"):
            score += 25
        if lead.get("position"):
            score += 20
        if lead.get("industry"):
            score += 15
        if lead.get("location"):
            score += 10
        if lead.get("buying_signals"):
            score += 5
        
        return score
    
    def generate_follow_up_message(self, lead: Dict, previous_message: Dict) -> Dict:
        """Genera mensaje de seguimiento"""
        follow_up_intros = [
            "I wanted to follow up on my previous message.",
            "Just wanted to circle back on our conversation.",
            "Hope you had a chance to review my previous note.",
            "Following up on my message from last week."
        ]
        
        follow_up_value_props = [
            "I thought you might be interested in a quick case study from a similar {industry} company.",
            "I've prepared some specific insights that might be valuable for {company}.",
            "Would love to share how we've helped other {industry} leaders achieve similar results."
        ]
        
        # Construir mensaje de follow-up
        opener = self.select_opener(lead, "professional")
        intro = random.choice(follow_up_intros)
        value_prop = random.choice(follow_up_value_props)
        cta = "Would 10 minutes this week work for a brief conversation?"
        closing = random.choice(self.templates["closings"])
        signature = random.choice(self.templates["signatures"])
        
        message_body = f"""{opener}

{intro}

{value_prop}

{cta}

{closing}
{signature}"""
        
        personalized_message = self.personalize_message(message_body, lead)
        
        return {
            "subject": f"Re: {previous_message.get('subject', 'Following up')}",
            "body": personalized_message,
            "tone": "professional",
            "message_type": "follow_up",
            "generated_at": datetime.now().isoformat(),
            "lead_id": lead.get("id"),
            "previous_message_id": previous_message.get("id")
        }
    
    def generate_campaign_messages(self, leads: List[Dict], campaign_type: str = "general") -> List[Dict]:
        """Genera mensajes para una campaña completa"""
        messages = []
        
        for lead in leads:
            message = self.generate_message(lead, campaign=campaign_type)
            messages.append(message)
        
        return messages
    
    def save_message(self, message: Dict, lead_id: int):
        """Guarda mensaje generado en la base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Crear tabla de mensajes si no existe
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
                FOREIGN KEY (lead_id) REFERENCES leads (id)
            )
        ''')
        
        cursor.execute('''
            INSERT INTO messages (
                lead_id, subject, body, tone, message_type, campaign,
                personalization_score, generated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            lead_id,
            message["subject"],
            message["body"],
            message["tone"],
            message["message_type"],
            message["campaign"],
            message["personalization_score"],
            message["generated_at"]
        ))
        
        message_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return message_id

if __name__ == "__main__":
    # Ejemplo de uso autónomo
    generator = MessageGenerator()
    
    # Lead de ejemplo
    sample_lead = {
        "id": 1,
        "name": "John Smith",
        "company": "TechCorp Inc",
        "position": "CEO",
        "industry": "artificial intelligence",
        "location": "San Francisco",
        "email": "john@techcorp.com"
    }
    
    # Generar mensaje
    message = generator.generate_message(sample_lead, campaign="growth")
    
    print("📧 Generated Message:")
    print(f"Subject: {message['subject']}")
    print(f"Body:\n{message['body']}")
    print(f"Personalization Score: {message['personalization_score']}")