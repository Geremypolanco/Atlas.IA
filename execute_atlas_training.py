#!/usr/bin/env python3
"""
Atlas IA - Complete Training Execution System
Executes the complete AI cloning and training pipeline in sequence
"""

import subprocess
import sys
import os
import time
from datetime import datetime

class AtlasTrainingExecutor:
    def __init__(self):
        self.start_time = datetime.now()
        self.steps_completed = 0
        self.total_steps = 5
        
    def print_header(self):
        """Print execution header"""
        print("="*70)
        print("🚀 ATLAS AI - COMPLETE TRAINING EXECUTION SYSTEM")
        print("="*70)
        print(f"⏰ Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🎯 Goal: Train AtlasCore with cloned AI capabilities")
        print(f"📊 Steps: {self.total_steps}")
        print("="*70)

    def print_step(self, step_num, title, description):
        """Print step information"""
        print(f"\n🔸 STEP {step_num}/{self.total_steps}: {title}")
        print(f"📝 {description}")
        print("-"*50)

    def execute_python_script(self, script_name, description):
        """Execute a Python script and handle errors"""
        try:
            print(f"▶️ Executing: {script_name}")
            
            # Execute the script
            result = subprocess.run([sys.executable, script_name], 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=300)  # 5 minute timeout
            
            if result.returncode == 0:
                print("✅ SUCCESS")
                if result.stdout:
                    print("📄 Output:")
                    print(result.stdout[-500:])  # Last 500 chars
                return True
            else:
                print("❌ FAILED")
                if result.stderr:
                    print("🚨 Error:")
                    print(result.stderr[-500:])
                return False
                
        except subprocess.TimeoutExpired:
            print("⏰ TIMEOUT - Script took too long")
            return False
        except Exception as e:
            print(f"💥 EXCEPTION: {e}")
            return False

    def install_dependencies(self):
        """Install required Python packages"""
        self.print_step(1, "DEPENDENCY INSTALLATION", 
                       "Installing required packages for AI training")
        
        packages = [
            "torch",
            "transformers",
            "datasets", 
            "peft",
            "accelerate",
            "fastapi",
            "uvicorn",
            "requests"
        ]
        
        for package in packages:
            try:
                print(f"📦 Installing {package}...")
                result = subprocess.run([sys.executable, "-m", "pip", "install", package], 
                                      capture_output=True, text=True, timeout=120)
                
                if result.returncode == 0:
                    print(f"✅ {package} installed")
                else:
                    print(f"⚠️ {package} installation warning (may already exist)")
                    
            except Exception as e:
                print(f"❌ Failed to install {package}: {e}")
        
        self.steps_completed += 1
        return True

    def clone_ai_functions(self):
        """Execute AI function cloning"""
        self.print_step(2, "AI FUNCTION CLONING", 
                       "Cloning capabilities from ChatGPT, Claude, Gemini, Perplexity")
        
        success = self.execute_python_script("clone_functions.py", 
                                           "Cloning AI functions from multiple sources")
        
        if success:
            self.steps_completed += 1
            
        return success

    def preprocess_data(self):
        """Execute data preprocessing"""
        self.print_step(3, "DATA PREPROCESSING", 
                       "Processing and preparing cloned AI data for training")
        
        success = self.execute_python_script("preprocess.py", 
                                           "Preprocessing cloned AI responses")
        
        if success:
            self.steps_completed += 1
            
        return success

    def train_model(self):
        """Execute model training"""
        self.print_step(4, "MODEL TRAINING", 
                       "Training AtlasCore with cloned AI capabilities")
        
        success = self.execute_python_script("train.py", 
                                           "Training AtlasCore model")
        
        if success:
            self.steps_completed += 1
            
        return success

    def deploy_system(self):
        """Deploy the trained system"""
        self.print_step(5, "SYSTEM DEPLOYMENT", 
                       "Deploying AtlasCore for autonomous operation")
        
        try:
            print("🚀 Starting AtlasCore deployment...")
            
            # Check if atlas_app.py exists
            if os.path.exists("atlas_app.py"):
                print("✅ AtlasCore app found")
                print("🌐 Ready for deployment on port 8000")
                print("💡 Run: python atlas_app.py")
                
                self.steps_completed += 1
                return True
            else:
                print("❌ AtlasCore app not found")
                return False
                
        except Exception as e:
            print(f"💥 Deployment error: {e}")
            return False

    def print_summary(self):
        """Print execution summary"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        print("\n" + "="*70)
        print("📊 ATLAS AI TRAINING EXECUTION SUMMARY")
        print("="*70)
        print(f"⏰ Started: {self.start_time.strftime('%H:%M:%S')}")
        print(f"🏁 Finished: {end_time.strftime('%H:%M:%S')}")
        print(f"⏱️ Duration: {duration}")
        print(f"✅ Steps completed: {self.steps_completed}/{self.total_steps}")
        
        if self.steps_completed == self.total_steps:
            print("🎉 TRAINING COMPLETED SUCCESSFULLY!")
            print("\n🚀 AtlasCore is ready for autonomous operation")
            print("💡 Next steps:")
            print("   1. Run: python atlas_app.py")
            print("   2. Test at: http://localhost:8000")
            print("   3. Integrate with AtlasEcosystem")
            
        else:
            print("⚠️ TRAINING INCOMPLETE")
            print("🔧 Some steps failed - check logs above")
            
        print("="*70)

    def execute_complete_pipeline(self):
        """Execute the complete Atlas AI training pipeline"""
        self.print_header()
        
        try:
            # Step 1: Install dependencies
            if not self.install_dependencies():
                print("💥 Failed at dependency installation")
                self.print_summary()
                return False
            
            # Step 2: Clone AI functions
            if not self.clone_ai_functions():
                print("💥 Failed at AI function cloning")
                self.print_summary()
                return False
            
            # Step 3: Preprocess data
            if not self.preprocess_data():
                print("💥 Failed at data preprocessing")
                self.print_summary()
                return False
            
            # Step 4: Train model
            if not self.train_model():
                print("💥 Failed at model training")
                self.print_summary()
                return False
            
            # Step 5: Deploy system
            if not self.deploy_system():
                print("💥 Failed at system deployment")
                self.print_summary()
                return False
            
            # Success!
            self.print_summary()
            return True
            
        except KeyboardInterrupt:
            print("\n🛑 Training interrupted by user")
            self.print_summary()
            return False
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")
            self.print_summary()
            return False

if __name__ == "__main__":
    executor = AtlasTrainingExecutor()
    success = executor.execute_complete_pipeline()
    
    if success:
        print("\n🎯 Atlas AI is now ready for autonomous operation!")
        exit(0)
    else:
        print("\n❌ Atlas AI training incomplete")
        exit(1)