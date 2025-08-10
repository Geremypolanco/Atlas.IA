#!/usr/bin/env python3
"""
Atlas IA - Data Preprocessing for AI Training
Processes cloned AI responses and prepares them for training
"""

import json
import re
from datetime import datetime
from collections import defaultdict, Counter
import hashlib

class AtlasDataPreprocessor:
    def __init__(self, input_file='atlas_dataset.jsonl', output_file='atlas_processed_dataset.jsonl'):
        self.input_file = input_file
        self.output_file = output_file
        self.processed_data = []
        self.stats = {
            'total_entries': 0,
            'duplicate_removed': 0,
            'entries_enhanced': 0,
            'quality_score_avg': 0
        }

    def load_dataset(self):
        """Load the raw dataset from JSONL file"""
        print("📁 Loading dataset...")
        
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        entry = json.loads(line)
                        self.processed_data.append(entry)
            
            self.stats['total_entries'] = len(self.processed_data)
            print(f"✅ Loaded {self.stats['total_entries']} entries")
            
        except FileNotFoundError:
            print(f"❌ Dataset file {self.input_file} not found")
            return False
        
        return True

    def remove_duplicates(self):
        """Remove duplicate entries based on content hash"""
        print("🔍 Removing duplicates...")
        
        seen_hashes = set()
        unique_data = []
        
        for entry in self.processed_data:
            # Create hash of input + output content
            content = entry.get('input', '') + entry.get('output', '')
            content_hash = hashlib.md5(content.encode()).hexdigest()
            
            if content_hash not in seen_hashes:
                seen_hashes.add(content_hash)
                unique_data.append(entry)
            else:
                self.stats['duplicate_removed'] += 1
        
        self.processed_data = unique_data
        print(f"✅ Removed {self.stats['duplicate_removed']} duplicates")

    def enhance_entries(self):
        """Enhance entries with additional metadata and improved formatting"""
        print("🚀 Enhancing entries...")
        
        enhanced_data = []
        
        for entry in self.processed_data:
            enhanced_entry = self.enhance_single_entry(entry)
            enhanced_data.append(enhanced_entry)
            self.stats['entries_enhanced'] += 1
        
        self.processed_data = enhanced_data
        print(f"✅ Enhanced {self.stats['entries_enhanced']} entries")

    def enhance_single_entry(self, entry):
        """Enhance a single entry with additional metadata"""
        enhanced = entry.copy()
        
        # Calculate quality score
        quality_score = self.calculate_quality_score(entry)
        enhanced['quality_score'] = quality_score
        
        # Extract key topics
        topics = self.extract_topics(entry.get('input', '') + ' ' + entry.get('output', ''))
        enhanced['topics'] = topics
        
        # Determine difficulty level
        difficulty = self.determine_difficulty(entry)
        enhanced['difficulty_level'] = difficulty
        
        # Add training metadata
        enhanced['training_metadata'] = {
            'word_count': len(entry.get('output', '').split()),
            'response_type': self.classify_response_type(entry),
            'requires_reasoning': self.requires_reasoning(entry),
            'factual_content': self.has_factual_content(entry),
            'actionable_advice': self.has_actionable_advice(entry)
        }
        
        # Format for training
        enhanced['formatted_prompt'] = self.format_training_prompt(entry)
        enhanced['formatted_response'] = self.format_training_response(entry)
        
        return enhanced

    def calculate_quality_score(self, entry):
        """Calculate quality score for an entry (0-100)"""
        score = 50  # Base score
        
        input_text = entry.get('input', '')
        output_text = entry.get('output', '')
        
        # Length factors
        if len(output_text.split()) > 100:
            score += 15
        elif len(output_text.split()) > 50:
            score += 10
        
        # Structure factors
        if '**' in output_text or '*' in output_text:  # Has formatting
            score += 10
        
        if any(marker in output_text for marker in ['1.', '2.', '3.', '-', '•']):  # Has lists
            score += 10
        
        # Content factors
        if any(word in output_text.lower() for word in ['strategy', 'analysis', 'recommendation', 'solution']):
            score += 10
        
        if entry.get('confidence', 0) > 0.8:
            score += 5
        
        # AI source quality
        ai_source = entry.get('ai_source', '')
        if ai_source in ['claude_clone', 'chatgpt_clone']:
            score += 5
        
        return min(100, max(0, score))

    def extract_topics(self, text):
        """Extract key topics from text"""
        topics = []
        
        # Common business/AI topics
        topic_keywords = {
            'revenue': ['revenue', 'money', 'income', 'profit', 'sales', 'monetize'],
            'ai_technology': ['ai', 'artificial intelligence', 'machine learning', 'automation'],
            'business_strategy': ['strategy', 'business', 'market', 'competition', 'growth'],
            'crisis_management': ['crisis', 'emergency', 'urgent', 'problem', 'solution'],
            'marketing': ['marketing', 'promotion', 'advertising', 'brand', 'customer'],
            'technology': ['technology', 'software', 'programming', 'development', 'coding'],
            'entrepreneurship': ['entrepreneur', 'startup', 'innovation', 'opportunity'],
            'productivity': ['productivity', 'efficiency', 'optimization', 'performance']
        }
        
        text_lower = text.lower()
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                topics.append(topic)
        
        return topics

    def determine_difficulty(self, entry):
        """Determine difficulty level of the entry"""
        input_text = entry.get('input', '').lower()
        output_text = entry.get('output', '').lower()
        
        # Complex indicators
        complex_indicators = ['analyze', 'strategy', 'framework', 'comprehensive', 'advanced', 'optimization']
        medium_indicators = ['how to', 'what are', 'explain', 'describe', 'implement']
        
        complex_count = sum(1 for indicator in complex_indicators if indicator in input_text + output_text)
        medium_count = sum(1 for indicator in medium_indicators if indicator in input_text)
        
        if complex_count >= 2:
            return 'advanced'
        elif complex_count >= 1 or medium_count >= 1:
            return 'intermediate'
        else:
            return 'basic'

    def classify_response_type(self, entry):
        """Classify the type of response"""
        output_text = entry.get('output', '').lower()
        
        if 'step' in output_text or ('1.' in output_text and '2.' in output_text):
            return 'procedural'
        elif 'analysis' in output_text or 'perspective' in output_text:
            return 'analytical'
        elif 'create' in output_text or 'generate' in output_text:
            return 'creative'
        elif 'research' in output_text or 'data' in output_text:
            return 'informational'
        else:
            return 'conversational'

    def requires_reasoning(self, entry):
        """Check if entry requires complex reasoning"""
        indicators = ['analyze', 'compare', 'evaluate', 'strategy', 'decision', 'framework']
        text = (entry.get('input', '') + ' ' + entry.get('output', '')).lower()
        return any(indicator in text for indicator in indicators)

    def has_factual_content(self, entry):
        """Check if entry contains factual content"""
        indicators = ['data', 'statistics', 'research', 'study', 'report', 'according to']
        text = entry.get('output', '').lower()
        return any(indicator in text for indicator in indicators)

    def has_actionable_advice(self, entry):
        """Check if entry contains actionable advice"""
        indicators = ['implement', 'start', 'create', 'build', 'develop', 'apply', 'use']
        text = entry.get('output', '').lower()
        return any(indicator in text for indicator in indicators)

    def format_training_prompt(self, entry):
        """Format prompt for training"""
        ai_source = entry.get('ai_source', 'atlas')
        function_type = entry.get('function_type', 'general')
        
        prompt = f"[{ai_source.upper()}] [{function_type.upper()}] {entry.get('input', '')}"
        return prompt

    def format_training_response(self, entry):
        """Format response for training"""
        response = entry.get('output', '')
        
        # Add capabilities context if available
        capabilities = entry.get('capabilities', [])
        if capabilities:
            cap_text = ", ".join(capabilities)
            response = f"[Capabilities: {cap_text}]\n\n{response}"
        
        return response

    def filter_by_quality(self, min_score=60):
        """Filter entries by minimum quality score"""
        print(f"🔍 Filtering by quality score >= {min_score}...")
        
        before_count = len(self.processed_data)
        self.processed_data = [entry for entry in self.processed_data if entry.get('quality_score', 0) >= min_score]
        after_count = len(self.processed_data)
        
        filtered_count = before_count - after_count
        print(f"✅ Filtered out {filtered_count} low-quality entries")

    def balance_dataset(self):
        """Balance dataset across different AI sources and function types"""
        print("⚖️ Balancing dataset...")
        
        # Group by AI source
        source_groups = defaultdict(list)
        for entry in self.processed_data:
            source = entry.get('ai_source', 'unknown')
            source_groups[source].append(entry)
        
        # Ensure minimum representation from each source
        min_per_source = 10
        balanced_data = []
        
        for source, entries in source_groups.items():
            # Sort by quality score and take best entries
            sorted_entries = sorted(entries, key=lambda x: x.get('quality_score', 0), reverse=True)
            selected_count = max(min_per_source, len(sorted_entries) // 2)
            balanced_data.extend(sorted_entries[:selected_count])
        
        self.processed_data = balanced_data
        print(f"✅ Balanced dataset: {len(self.processed_data)} entries")

    def save_processed_dataset(self):
        """Save processed dataset"""
        print(f"💾 Saving processed dataset to {self.output_file}...")
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            for entry in self.processed_data:
                f.write(json.dumps(entry, ensure_ascii=False) + '\n')
        
        # Calculate average quality score
        if self.processed_data:
            avg_quality = sum(entry.get('quality_score', 0) for entry in self.processed_data) / len(self.processed_data)
            self.stats['quality_score_avg'] = round(avg_quality, 2)
        
        print(f"✅ Saved {len(self.processed_data)} processed entries")

    def generate_training_config(self):
        """Generate training configuration based on processed data"""
        config = {
            "dataset_info": {
                "total_entries": len(self.processed_data),
                "avg_quality_score": self.stats['quality_score_avg'],
                "ai_sources": list(set(entry.get('ai_source', '') for entry in self.processed_data)),
                "function_types": list(set(entry.get('function_type', '') for entry in self.processed_data)),
                "difficulty_levels": list(set(entry.get('difficulty_level', '') for entry in self.processed_data))
            },
            "training_params": {
                "batch_size": min(8, len(self.processed_data) // 10),
                "learning_rate": 2e-5,
                "num_epochs": 3,
                "warmup_steps": 100,
                "max_length": 512,
                "gradient_accumulation_steps": 2
            },
            "model_config": {
                "base_model": "microsoft/DialoGPT-medium",
                "lora_r": 16,
                "lora_alpha": 32,
                "lora_dropout": 0.1,
                "target_modules": ["c_attn", "c_proj"]
            }
        }
        
        # Save training config
        with open('training_config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        print("✅ Generated training_config.json")
        return config

    def process_complete_pipeline(self):
        """Execute the complete preprocessing pipeline"""
        print("🚀 Starting Atlas Data Preprocessing Pipeline...")
        
        # Load dataset
        if not self.load_dataset():
            return False
        
        # Process data
        self.remove_duplicates()
        self.enhance_entries()
        self.filter_by_quality(min_score=65)
        self.balance_dataset()
        
        # Save results
        self.save_processed_dataset()
        config = self.generate_training_config()
        
        # Print final statistics
        print(f"""
✅ Preprocessing Complete!

📊 Final Statistics:
- Original entries: {self.stats['total_entries']}
- Duplicates removed: {self.stats['duplicate_removed']}
- Entries enhanced: {self.stats['entries_enhanced']}
- Final dataset size: {len(self.processed_data)}
- Average quality score: {self.stats['quality_score_avg']}

📁 Output Files:
- {self.output_file}
- training_config.json

🎯 Ready for training with AtlasCore!
        """)
        
        return True

if __name__ == "__main__":
    preprocessor = AtlasDataPreprocessor()
    preprocessor.process_complete_pipeline()