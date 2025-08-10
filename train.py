#!/usr/bin/env python3
"""
Atlas IA - AI Training System
Trains AtlasCore using cloned AI capabilities with LoRA fine-tuning
"""

import json
import torch
import os
from datetime import datetime
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
from peft import LoraConfig, get_peft_model, TaskType
import numpy as np

class AtlasTrainer:
    def __init__(self, config_file='training_config.json', dataset_file='atlas_processed_dataset.jsonl'):
        self.config_file = config_file
        self.dataset_file = dataset_file
        self.model = None
        self.tokenizer = None
        self.dataset = None
        self.training_config = None
        
        # Set device
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"🔧 Using device: {self.device}")

    def load_config(self):
        """Load training configuration"""
        try:
            with open(self.config_file, 'r') as f:
                self.training_config = json.load(f)
            print("✅ Loaded training configuration")
            return True
        except FileNotFoundError:
            print(f"❌ Config file {self.config_file} not found")
            self.create_default_config()
            return True

    def create_default_config(self):
        """Create default training configuration"""
        print("🔧 Creating default training configuration...")
        
        self.training_config = {
            "dataset_info": {
                "total_entries": 100,
                "avg_quality_score": 75,
                "ai_sources": ["chatgpt_clone", "claude_clone", "gemini_clone"],
                "function_types": ["conversational", "analytical", "creative"]
            },
            "training_params": {
                "batch_size": 4,
                "learning_rate": 2e-5,
                "num_epochs": 3,
                "warmup_steps": 100,
                "max_length": 512,
                "gradient_accumulation_steps": 2
            },
            "model_config": {
                "base_model": "microsoft/DialoGPT-small",
                "lora_r": 16,
                "lora_alpha": 32,
                "lora_dropout": 0.1,
                "target_modules": ["c_attn", "c_proj"]
            }
        }

    def load_model_and_tokenizer(self):
        """Load base model and tokenizer"""
        model_name = self.training_config['model_config']['base_model']
        print(f"🤖 Loading model: {model_name}")
        
        try:
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # Add pad token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None
            )
            
            print("✅ Model and tokenizer loaded successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            # Fallback to a smaller, more compatible model
            return self.load_fallback_model()

    def load_fallback_model(self):
        """Load a fallback model if the primary model fails"""
        print("🔄 Loading fallback model...")
        
        try:
            model_name = "distilgpt2"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.tokenizer.pad_token = self.tokenizer.eos_token
            
            self.model = AutoModelForCausalLM.from_pretrained(model_name)
            
            print("✅ Fallback model loaded successfully")
            return True
            
        except Exception as e:
            print(f"❌ Failed to load fallback model: {e}")
            return False

    def setup_lora(self):
        """Setup LoRA configuration for efficient fine-tuning"""
        print("🔧 Setting up LoRA configuration...")
        
        model_config = self.training_config['model_config']
        
        lora_config = LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            inference_mode=False,
            r=model_config['lora_r'],
            lora_alpha=model_config['lora_alpha'],
            lora_dropout=model_config['lora_dropout'],
            target_modules=model_config.get('target_modules', ["c_attn"])
        )
        
        try:
            self.model = get_peft_model(self.model, lora_config)
            print("✅ LoRA configuration applied")
            
            # Print trainable parameters
            trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
            total_params = sum(p.numel() for p in self.model.parameters())
            print(f"📊 Trainable parameters: {trainable_params:,} ({100 * trainable_params / total_params:.2f}%)")
            
            return True
            
        except Exception as e:
            print(f"❌ Error setting up LoRA: {e}")
            print("🔄 Continuing without LoRA...")
            return False

    def load_dataset(self):
        """Load and prepare training dataset"""
        print(f"📁 Loading dataset from {self.dataset_file}...")
        
        try:
            # Load data from JSONL
            data = []
            with open(self.dataset_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        entry = json.loads(line)
                        data.append(entry)
            
            if not data:
                print("⚠️ No data found, creating sample dataset...")
                data = self.create_sample_dataset()
            
            # Prepare training examples
            training_examples = []
            for entry in data:
                prompt = entry.get('formatted_prompt', entry.get('input', ''))
                response = entry.get('formatted_response', entry.get('output', ''))
                
                # Create training text
                training_text = f"User: {prompt}\nAtlas: {response}<|endoftext|>"
                training_examples.append({"text": training_text})
            
            # Create dataset
            self.dataset = Dataset.from_list(training_examples)
            print(f"✅ Loaded {len(training_examples)} training examples")
            
            return True
            
        except FileNotFoundError:
            print(f"❌ Dataset file {self.dataset_file} not found")
            print("🔧 Creating sample dataset...")
            self.dataset = Dataset.from_list(self.create_sample_dataset())
            return True
        except Exception as e:
            print(f"❌ Error loading dataset: {e}")
            return False

    def create_sample_dataset(self):
        """Create sample dataset if no data is available"""
        sample_data = [
            {
                "text": "User: How to generate revenue with AI automation?\nAtlas: I can help you generate revenue through AI automation by implementing several proven strategies: 1) Create automated content generation systems, 2) Build intelligent lead generation tools, 3) Develop AI-powered consulting services, 4) Implement predictive analytics for e-commerce, and 5) Offer automated data processing services. Each strategy can generate $5,000-15,000 monthly when properly implemented.<|endoftext|>"
            },
            {
                "text": "User: What are the best crisis management strategies?\nAtlas: Effective crisis management requires immediate action and long-term planning. Start with: 1) Assess the situation objectively, 2) Secure immediate financial stability, 3) Communicate transparently with stakeholders, 4) Implement emergency protocols, 5) Focus on critical operations only, and 6) Plan recovery strategies. The key is maintaining calm decision-making while taking swift, decisive action.<|endoftext|>"
            },
            {
                "text": "User: How to analyze market trends effectively?\nAtlas: Market trend analysis involves multiple data sources and analytical frameworks. Begin by: 1) Collecting data from industry reports, social media, and competitor analysis, 2) Identifying patterns using both quantitative and qualitative methods, 3) Applying predictive modeling to forecast future trends, 4) Validating insights through market testing, and 5) Continuously monitoring and adjusting your analysis. This comprehensive approach ensures accurate trend identification.<|endoftext|>"
            }
        ]
        
        return sample_data

    def tokenize_dataset(self):
        """Tokenize the dataset for training"""
        print("🔤 Tokenizing dataset...")
        
        def tokenize_function(examples):
            # Tokenize the text
            tokenized = self.tokenizer(
                examples["text"],
                truncation=True,
                padding=False,
                max_length=self.training_config['training_params']['max_length'],
                return_tensors=None
            )
            
            # Set labels same as input_ids for language modeling
            tokenized["labels"] = tokenized["input_ids"].copy()
            
            return tokenized
        
        try:
            self.dataset = self.dataset.map(
                tokenize_function,
                batched=True,
                remove_columns=self.dataset.column_names
            )
            
            print("✅ Dataset tokenized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error tokenizing dataset: {e}")
            return False

    def setup_training_arguments(self):
        """Setup training arguments"""
        print("⚙️ Setting up training arguments...")
        
        params = self.training_config['training_params']
        
        # Create output directory
        output_dir = f"./atlas_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        os.makedirs(output_dir, exist_ok=True)
        
        training_args = TrainingArguments(
            output_dir=output_dir,
            overwrite_output_dir=True,
            num_train_epochs=params['num_epochs'],
            per_device_train_batch_size=params['batch_size'],
            gradient_accumulation_steps=params['gradient_accumulation_steps'],
            warmup_steps=params['warmup_steps'],
            learning_rate=params['learning_rate'],
            fp16=torch.cuda.is_available(),
            logging_steps=10,
            save_steps=100,
            eval_steps=100,
            save_total_limit=2,
            prediction_loss_only=True,
            remove_unused_columns=False,
            dataloader_pin_memory=False,
            report_to=None  # Disable wandb logging
        )
        
        return training_args

    def train_model(self):
        """Train the AtlasCore model"""
        print("🚀 Starting AtlasCore training...")
        
        # Setup training arguments
        training_args = self.setup_training_arguments()
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False,
            pad_to_multiple_of=8 if torch.cuda.is_available() else None
        )
        
        # Initialize trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=self.dataset,
            data_collator=data_collator,
        )
        
        try:
            # Train the model
            print("🏃‍♂️ Training in progress...")
            trainer.train()
            
            # Save the final model
            trainer.save_model()
            self.tokenizer.save_pretrained(training_args.output_dir)
            
            print(f"✅ Training completed! Model saved to {training_args.output_dir}")
            
            return training_args.output_dir
            
        except Exception as e:
            print(f"❌ Training failed: {e}")
            return None

    def test_model(self, model_dir):
        """Test the trained model with sample prompts"""
        print("🧪 Testing trained model...")
        
        try:
            # Load trained model
            model = AutoModelForCausalLM.from_pretrained(model_dir)
            tokenizer = AutoTokenizer.from_pretrained(model_dir)
            
            test_prompts = [
                "How to generate $10,000 per month with AI?",
                "What are emergency income strategies?",
                "How to handle financial crisis as a parent?"
            ]
            
            print("\n📝 Model Test Results:")
            print("=" * 50)
            
            for prompt in test_prompts:
                input_text = f"User: {prompt}\nAtlas:"
                
                # Tokenize input
                inputs = tokenizer.encode(input_text, return_tensors='pt')
                
                # Generate response
                with torch.no_grad():
                    outputs = model.generate(
                        inputs,
                        max_length=inputs.shape[1] + 100,
                        num_return_sequences=1,
                        temperature=0.7,
                        do_sample=True,
                        pad_token_id=tokenizer.eos_token_id
                    )
                
                # Decode response
                response = tokenizer.decode(outputs[0], skip_special_tokens=True)
                atlas_response = response[len(input_text):].strip()
                
                print(f"\n🔹 Prompt: {prompt}")
                print(f"🤖 Atlas: {atlas_response[:200]}...")
                print("-" * 30)
            
            print("✅ Model testing completed")
            return True
            
        except Exception as e:
            print(f"❌ Model testing failed: {e}")
            return False

    def execute_training_pipeline(self):
        """Execute the complete training pipeline"""
        print("🚀 Starting AtlasCore Training Pipeline...")
        print("=" * 60)
        
        # Load configuration
        if not self.load_config():
            return False
        
        # Load model and tokenizer
        if not self.load_model_and_tokenizer():
            return False
        
        # Setup LoRA for efficient training
        self.setup_lora()
        
        # Load and prepare dataset
        if not self.load_dataset():
            return False
        
        # Tokenize dataset
        if not self.tokenize_dataset():
            return False
        
        # Train the model
        model_dir = self.train_model()
        if not model_dir:
            return False
        
        # Test the trained model
        self.test_model(model_dir)
        
        print(f"""
🎉 AtlasCore Training Complete!

📊 Training Summary:
- Model trained with AI capabilities from multiple sources
- Dataset size: {len(self.dataset)} examples
- Output directory: {model_dir}
- Ready for deployment

🚀 Next Steps:
1. Deploy with app.py for autonomous operation
2. Integrate with AtlasEcosystem dashboard
3. Enable continuous learning from internet sources

AtlasCore is now independent and ready for autonomous operation!
        """)
        
        return True

if __name__ == "__main__":
    trainer = AtlasTrainer()
    trainer.execute_training_pipeline()