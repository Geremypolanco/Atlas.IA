"""
Atlas AI Independent Crawler
Autonomously learns from internet without external dependencies
"""

import requests
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
import asyncio
import aiohttp
from typing import List, Dict, Any

class AtlasCrawler:
    def __init__(self):
        self.knowledge_base_path = "./knowledge_base.json"
        self.dataset_path = "./atlas_dataset.jsonl"
        self.sources = [
            "https://en.wikipedia.org/wiki/Artificial_intelligence",
            "https://en.wikipedia.org/wiki/Machine_learning",
            "https://en.wikipedia.org/wiki/Business_intelligence",
            "https://arxiv.org/list/cs.AI/recent",
            "https://news.ycombinator.com",
            "https://www.reddit.com/r/MachineLearning/hot.json",
            "https://api.github.com/repos/microsoft/DeepSpeed/contents/README.md"
        ]
        
    def load_knowledge_base(self) -> Dict:
        """Load existing knowledge base"""
        try:
            with open(self.knowledge_base_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "knowledge_database": {
                    "last_updated": datetime.now().isoformat(),
                    "sources": [],
                    "entries": [],
                    "training_data": [],
                    "learned_patterns": [],
                    "autonomous_insights": []
                },
                "learning_metrics": {
                    "total_entries": 0,
                    "accuracy_score": 0,
                    "confidence_level": 0,
                    "autonomous_level": 0
                }
            }
    
    def save_knowledge_base(self, knowledge_base: Dict):
        """Save knowledge base to file"""
        with open(self.knowledge_base_path, 'w') as f:
            json.dump(knowledge_base, f, indent=2)
    
    async def crawl_url(self, session: aiohttp.ClientSession, url: str) -> Dict:
        """Crawl a single URL and extract knowledge"""
        try:
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Extract text content
                    for script in soup(["script", "style"]):
                        script.decompose()
                    
                    text = soup.get_text()
                    lines = (line.strip() for line in text.splitlines())
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    text = ' '.join(chunk for chunk in chunks if chunk)
                    
                    return {
                        "url": url,
                        "content": text[:5000],  # Limit content size
                        "timestamp": datetime.now().isoformat(),
                        "word_count": len(text.split()),
                        "status": "success"
                    }
        except Exception as e:
            return {
                "url": url,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "status": "failed"
            }
    
    async def autonomous_learning_cycle(self):
        """Main learning cycle that crawls and processes data"""
        print("🧠 Atlas AI: Starting autonomous learning cycle...")
        
        knowledge_base = self.load_knowledge_base()
        
        async with aiohttp.ClientSession() as session:
            tasks = [self.crawl_url(session, url) for url in self.sources]
            results = await asyncio.gather(*tasks)
        
        # Process successful crawls
        successful_crawls = [r for r in results if r.get("status") == "success"]
        
        for crawl_data in successful_crawls:
            # Add to knowledge base
            knowledge_base["knowledge_database"]["entries"].append(crawl_data)
            
            # Create training data entry
            training_entry = {
                "input": f"Knowledge from {crawl_data['url']}",
                "output": crawl_data["content"][:1000],
                "source": crawl_data["url"],
                "confidence": 0.8,
                "timestamp": crawl_data["timestamp"]
            }
            
            knowledge_base["knowledge_database"]["training_data"].append(training_entry)
            
            # Add to JSONL dataset
            with open(self.dataset_path, 'a') as f:
                f.write(json.dumps(training_entry) + '\n')
        
        # Update metrics
        knowledge_base["learning_metrics"]["total_entries"] = len(knowledge_base["knowledge_database"]["entries"])
        knowledge_base["learning_metrics"]["autonomous_level"] = min(100, len(successful_crawls) * 10)
        knowledge_base["knowledge_database"]["last_updated"] = datetime.now().isoformat()
        
        self.save_knowledge_base(knowledge_base)
        
        print(f"✅ Atlas AI: Learned from {len(successful_crawls)} sources")
        print(f"📊 Total knowledge entries: {knowledge_base['learning_metrics']['total_entries']}")
        print(f"🎯 Autonomy level: {knowledge_base['learning_metrics']['autonomous_level']}%")
        
        return {
            "success": True,
            "sources_processed": len(successful_crawls),
            "total_entries": knowledge_base["learning_metrics"]["total_entries"],
            "autonomy_level": knowledge_base["learning_metrics"]["autonomous_level"]
        }

if __name__ == "__main__":
    crawler = AtlasCrawler()
    asyncio.run(crawler.autonomous_learning_cycle())