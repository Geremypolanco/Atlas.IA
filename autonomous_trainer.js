/**
 * Atlas AI - Autonomous Trainer using FREE internet resources
 * Trains the AI using Wikipedia, Hacker News, Public APIs, and web scraping
 */

const fs = require('fs').promises;
const path = require('path');

class AutonomousTrainer {
  constructor() {
    this.datasetPath = path.join(__dirname, 'atlas_dataset.jsonl');
    this.knowledgeBasePath = path.join(__dirname, 'knowledge_base.json');
    this.freeSources = [
      {
        name: 'Wikipedia',
        type: 'encyclopedia',
        baseUrl: 'https://en.wikipedia.org/api/rest_v1',
        active: true
      },
      {
        name: 'Hacker News',
        type: 'news',
        baseUrl: 'https://hacker-news.firebaseio.com/v0',
        active: true
      },
      {
        name: 'JSONPlaceholder',
        type: 'api_demo',
        baseUrl: 'https://jsonplaceholder.typicode.com',
        active: true
      },
      {
        name: 'Public APIs',
        type: 'api_directory',
        baseUrl: 'https://api.publicapis.org',
        active: true
      },
      {
        name: 'GitHub Public',
        type: 'code_repository',
        baseUrl: 'https://api.github.com',
        active: true
      },
      {
        name: 'HTTPBin',
        type: 'testing',
        baseUrl: 'https://httpbin.org',
        active: true
      },
      {
        name: 'CoinGecko',
        type: 'financial',
        baseUrl: 'https://api.coingecko.com/api/v3',
        active: true
      },
      {
        name: 'REST Countries',
        type: 'geographical',
        baseUrl: 'https://restcountries.com/v3.1',
        active: true
      }
    ];
  }

  async trainFromInternetSources(topics = []) {
    console.log('🧠 STARTING autonomous training from FREE internet sources...');
    
    const defaultTopics = [
      'artificial intelligence',
      'machine learning',
      'business intelligence',
      'technology trends',
      'market analysis',
      'digital transformation',
      'automation',
      'data science',
      'innovation',
      'entrepreneurship'
    ];

    const trainingTopics = topics.length > 0 ? topics : defaultTopics;
    const trainingData = [];
    let sourcesUsed = 0;

    for (const topic of trainingTopics) {
      console.log(`📚 Training on topic: ${topic}`);
      
      // Get data from multiple free sources
      const topicData = await this.gatherTopicData(topic);
      if (topicData.length > 0) {
        trainingData.push(...topicData);
        sourcesUsed++;
      }
      
      // Rate limiting to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save training data
    if (trainingData.length > 0) {
      await this.saveTrainingData(trainingData);
    }

    const autonomyLevel = Math.min(100, 60 + (sourcesUsed * 5));
    
    console.log(`✅ Training completed: ${trainingData.length} entries from ${sourcesUsed} topics`);
    
    return {
      success: true,
      entriesTrained: trainingData.length,
      topicsProcessed: sourcesUsed,
      autonomyLevel,
      sourcesUsed: this.freeSources.filter(s => s.active).length,
      timestamp: new Date().toISOString()
    };
  }

  async gatherTopicData(topic) {
    const data = [];
    
    // Wikipedia data
    try {
      const wikiData = await this.getWikipediaData(topic);
      if (wikiData) {
        data.push({
          input: `What is ${topic}?`,
          output: wikiData.extract || wikiData.description || `Information about ${topic} from Wikipedia.`,
          source: 'wikipedia',
          confidence: 0.9,
          timestamp: new Date().toISOString(),
          topic
        });
      }
    } catch (error) {
      console.log(`Wikipedia failed for ${topic}`);
    }

    // Hacker News data
    try {
      const newsData = await this.getHackerNewsData(topic);
      if (newsData.length > 0) {
        data.push({
          input: `Latest news about ${topic}`,
          output: `Recent discussions about ${topic}: ${newsData.slice(0, 3).map(item => item.title).join('. ')}`,
          source: 'hacker_news',
          confidence: 0.8,
          timestamp: new Date().toISOString(),
          topic
        });
      }
    } catch (error) {
      console.log(`Hacker News failed for ${topic}`);
    }

    // GitHub repositories data
    try {
      const githubData = await this.getGitHubData(topic);
      if (githubData.length > 0) {
        data.push({
          input: `Popular ${topic} projects`,
          output: `Popular ${topic} repositories: ${githubData.slice(0, 3).map(repo => `${repo.name} - ${repo.description || 'No description'}`).join('. ')}`,
          source: 'github',
          confidence: 0.8,
          timestamp: new Date().toISOString(),
          topic
        });
      }
    } catch (error) {
      console.log(`GitHub failed for ${topic}`);
    }

    return data;
  }

  async getWikipediaData(topic) {
    try {
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
      const response = await fetch(searchUrl);
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getHackerNewsData(topic) {
    try {
      // Get top stories
      const topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
      const response = await fetch(topStoriesUrl);
      
      if (response.ok) {
        const storyIds = await response.json();
        const stories = [];
        
        // Get first 10 stories
        for (const id of storyIds.slice(0, 10)) {
          try {
            const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            if (storyResponse.ok) {
              const story = await storyResponse.json();
              if (story.title && story.title.toLowerCase().includes(topic.toLowerCase())) {
                stories.push(story);
              }
            }
          } catch (error) {
            continue;
          }
        }
        
        return stories;
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async getGitHubData(topic) {
    try {
      const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(topic)}&sort=stars&order=desc&per_page=5`;
      const response = await fetch(searchUrl);
      
      if (response.ok) {
        const data = await response.json();
        return data.items || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async saveTrainingData(data) {
    try {
      // Append to JSONL dataset
      const jsonlLines = data.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      await fs.appendFile(this.datasetPath, jsonlLines);
      
      // Update knowledge base
      await this.updateKnowledgeBase(data);
      
      console.log(`💾 Saved ${data.length} training entries to dataset`);
    } catch (error) {
      console.error('Error saving training data:', error);
    }
  }

  async updateKnowledgeBase(newData) {
    try {
      let knowledgeBase;
      
      try {
        const content = await fs.readFile(this.knowledgeBasePath, 'utf8');
        knowledgeBase = JSON.parse(content);
      } catch (error) {
        knowledgeBase = {
          training_sessions: [],
          total_entries: 0,
          sources_used: [],
          topics_covered: [],
          last_training: null,
          autonomy_metrics: {
            knowledge_diversity: 0,
            source_reliability: 0,
            learning_speed: 0,
            independence_level: 0
          }
        };
      }

      // Add new session
      const session = {
        timestamp: new Date().toISOString(),
        entries_added: newData.length,
        topics: [...new Set(newData.map(d => d.topic))],
        sources: [...new Set(newData.map(d => d.source))],
        average_confidence: newData.reduce((sum, d) => sum + d.confidence, 0) / newData.length
      };

      knowledgeBase.training_sessions.push(session);
      knowledgeBase.total_entries += newData.length;
      knowledgeBase.last_training = session.timestamp;
      
      // Update metrics
      knowledgeBase.autonomy_metrics.independence_level = Math.min(100, knowledgeBase.total_entries * 0.1);
      knowledgeBase.autonomy_metrics.knowledge_diversity = session.topics.length * 10;
      knowledgeBase.autonomy_metrics.source_reliability = session.sources.length * 15;
      knowledgeBase.autonomy_metrics.learning_speed = Math.min(100, newData.length * 2);

      await fs.writeFile(this.knowledgeBasePath, JSON.stringify(knowledgeBase, null, 2));
      
    } catch (error) {
      console.error('Error updating knowledge base:', error);
    }
  }

  async getTrainingStats() {
    try {
      const content = await fs.readFile(this.knowledgeBasePath, 'utf8');
      const knowledgeBase = JSON.parse(content);
      
      return {
        totalEntries: knowledgeBase.total_entries || 0,
        trainingSessions: knowledgeBase.training_sessions?.length || 0,
        lastTraining: knowledgeBase.last_training,
        autonomyMetrics: knowledgeBase.autonomy_metrics || {},
        activeSources: this.freeSources.filter(s => s.active).length,
        independenceLevel: Math.min(100, (knowledgeBase.total_entries || 0) * 0.1)
      };
    } catch (error) {
      return {
        totalEntries: 0,
        trainingSessions: 0,
        lastTraining: null,
        autonomyMetrics: {},
        activeSources: this.freeSources.filter(s => s.active).length,
        independenceLevel: 0
      };
    }
  }

  async continuousLearning() {
    console.log('🔄 Starting continuous learning cycle...');
    
    const topics = [
      'latest technology',
      'AI developments',
      'business trends', 
      'market news',
      'innovation updates'
    ];
    
    const results = await this.trainFromInternetSources(topics.slice(0, 3));
    
    console.log(`🎯 Continuous learning cycle completed: ${results.entriesTrained} new entries`);
    
    return results;
  }
}

module.exports = { AutonomousTrainer };