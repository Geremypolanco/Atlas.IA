/**
 * Atlas Dynamic Learning Engine - Sistema de Aprendizaje y Pensamiento Dinámico
 * Integra el sistema de absorción con el pensamiento activo y adaptativo
 */

const fs = require('fs');
const path = require('path');

class AtlasDynamicLearning {
    constructor() {
        this.isLearning = true;
        this.memoryPath = 'data/atlas_memory.json';
        this.learningPath = 'data/atlas_learning.json';
        this.absorptionPath = 'atlas_absorption_results.json';
        
        this.cognitiveStates = {
            analyzing: false,
            learning: false,
            creating: false,
            problem_solving: false,
            pattern_recognition: false
        };
        
        this.memory = this.loadMemory();
        this.learningHistory = this.loadLearningHistory();
        this.knowledgeGraph = new Map();
        this.concepts = new Map();
        this.insights = [];
        
        this.initializeLearningEngine();
    }

    initializeLearningEngine() {
        console.log('🧠 ATLAS DYNAMIC LEARNING: Inicializando motor de aprendizaje...');
        
        // Cargar conocimiento previo
        this.loadExistingKnowledge();
        
        // Iniciar procesos de aprendizaje continuo
        this.startContinuousLearning();
        
        console.log('✅ ATLAS DYNAMIC LEARNING: Motor de aprendizaje activado');
        console.log(`🔥 Estado: APRENDIENDO Y PENSANDO DINÁMICAMENTE`);
    }

    loadMemory() {
        try {
            if (fs.existsSync(this.memoryPath)) {
                const data = fs.readFileSync(this.memoryPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.log('🧠 Inicializando nueva memoria de Atlas...');
        }
        
        return {
            conversations: [],
            patterns: {},
            learned_concepts: {},
            insights: [],
            personality_adaptations: {},
            user_preferences: {},
            problem_solving_strategies: [],
            created_at: new Date().toISOString()
        };
    }

    loadLearningHistory() {
        try {
            if (fs.existsSync(this.learningPath)) {
                const data = fs.readFileSync(this.learningPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.log('📚 Inicializando historial de aprendizaje...');
        }
        
        return {
            sessions: [],
            knowledge_evolution: [],
            learning_milestones: [],
            adaptations: [],
            created_at: new Date().toISOString()
        };
    }

    loadExistingKnowledge() {
        // Cargar datos de absorción si existen
        if (fs.existsSync(this.absorptionPath)) {
            try {
                const absorption = JSON.parse(fs.readFileSync(this.absorptionPath, 'utf8'));
                this.integrateAbsorbedKnowledge(absorption);
            } catch (error) {
                console.log('⚠️ Error cargando datos de absorción:', error.message);
            }
        }
        
        // Cargar conceptos base
        this.initializeBaseConcepts();
    }

    initializeBaseConcepts() {
        const baseConcepts = [
            { name: 'revenue_generation', weight: 0.9, connections: ['business', 'automation', 'ai'] },
            { name: 'problem_solving', weight: 0.95, connections: ['analysis', 'creativity', 'logic'] },
            { name: 'learning', weight: 1.0, connections: ['adaptation', 'memory', 'pattern_recognition'] },
            { name: 'communication', weight: 0.85, connections: ['language', 'empathy', 'clarity'] },
            { name: 'automation', weight: 0.9, connections: ['efficiency', 'technology', 'optimization'] }
        ];
        
        baseConcepts.forEach(concept => {
            this.concepts.set(concept.name, {
                ...concept,
                learned_instances: [],
                confidence: 0.7,
                last_updated: new Date().toISOString()
            });
        });
    }

    integrateAbsorbedKnowledge(absorptionData) {
        if (!absorptionData.results) return;
        
        console.log('🧠 Integrando conocimiento absorbido...');
        
        absorptionData.results.forEach(result => {
            if (result.success && result.content_sample) {
                result.content_sample.forEach(content => {
                    this.processAbsorbedContent(content, result.source);
                });
            }
        });
        
        // Actualizar nivel de inteligencia basado en conocimiento absorbido
        this.updateIntelligenceLevel(absorptionData);
    }

    processAbsorbedContent(content, source) {
        const conceptKey = this.extractConceptFromContent(content);
        
        if (conceptKey && this.concepts.has(conceptKey)) {
            const concept = this.concepts.get(conceptKey);
            concept.learned_instances.push({
                content: content,
                source: source,
                timestamp: new Date().toISOString(),
                relevance: this.calculateRelevance(content, concept)
            });
            concept.confidence = Math.min(0.99, concept.confidence + 0.05);
            concept.last_updated = new Date().toISOString();
            
            this.concepts.set(conceptKey, concept);
        }
        
        // Crear nuevos conceptos si es relevante
        this.discoverNewConcepts(content, source);
    }

    extractConceptFromContent(content) {
        const contentStr = JSON.stringify(content).toLowerCase();
        
        // Mapeo inteligente de contenido a conceptos
        if (contentStr.includes('business') || contentStr.includes('revenue') || contentStr.includes('money')) {
            return 'revenue_generation';
        } else if (contentStr.includes('problem') || contentStr.includes('solution') || contentStr.includes('fix')) {
            return 'problem_solving';
        } else if (contentStr.includes('learn') || contentStr.includes('education') || contentStr.includes('knowledge')) {
            return 'learning';
        } else if (contentStr.includes('automat') || contentStr.includes('ai') || contentStr.includes('artificial')) {
            return 'automation';
        } else if (contentStr.includes('communication') || contentStr.includes('language') || contentStr.includes('chat')) {
            return 'communication';
        }
        
        return null;
    }

    calculateRelevance(content, concept) {
        // Algoritmo simple de relevancia basado en coincidencias de palabras clave
        const contentStr = JSON.stringify(content).toLowerCase();
        const connections = concept.connections || [];
        
        let relevanceScore = 0.5; // Base score
        
        connections.forEach(connection => {
            if (contentStr.includes(connection.toLowerCase())) {
                relevanceScore += 0.15;
            }
        });
        
        return Math.min(1.0, relevanceScore);
    }

    discoverNewConcepts(content, source) {
        const contentStr = JSON.stringify(content).toLowerCase();
        
        // Buscar patrones para nuevos conceptos
        const potentialConcepts = [
            { pattern: ['crypto', 'blockchain', 'web3'], name: 'blockchain_technology' },
            { pattern: ['social', 'media', 'viral'], name: 'social_media_strategy' },
            { pattern: ['data', 'analytics', 'insights'], name: 'data_analysis' },
            { pattern: ['market', 'competition', 'strategy'], name: 'market_intelligence' }
        ];
        
        potentialConcepts.forEach(({ pattern, name }) => {
            if (pattern.some(p => contentStr.includes(p)) && !this.concepts.has(name)) {
                this.concepts.set(name, {
                    name: name,
                    weight: 0.6,
                    connections: pattern,
                    learned_instances: [{
                        content: content,
                        source: source,
                        timestamp: new Date().toISOString(),
                        relevance: 0.8
                    }],
                    confidence: 0.6,
                    last_updated: new Date().toISOString(),
                    discovered: true
                });
                
                console.log(`🔍 NUEVO CONCEPTO DESCUBIERTO: ${name} desde ${source}`);
            }
        });
    }

    updateIntelligenceLevel(absorptionData) {
        const totalDataPoints = absorptionData.results.reduce((sum, result) => {
            return sum + (result.data_points || 0);
        }, 0);
        
        const currentLevel = this.memory.intelligence_level || 75;
        const increment = Math.min(5, totalDataPoints / 100);
        const newLevel = Math.min(100, currentLevel + increment);
        
        this.memory.intelligence_level = newLevel;
        
        if (newLevel > currentLevel) {
            console.log(`🧠 NIVEL DE INTELIGENCIA AUMENTADO: ${currentLevel.toFixed(1)} → ${newLevel.toFixed(1)}`);
        }
    }

    async thinkDynamically(prompt, context = {}) {
        console.log('🧠 ATLAS PENSANDO DINÁMICAMENTE...');
        
        // Activar estados cognitivos
        this.cognitiveStates.analyzing = true;
        this.cognitiveStates.pattern_recognition = true;
        
        try {
            // Fase 1: Análisis del prompt
            const analysis = await this.analyzePromptDeeply(prompt, context);
            
            // Fase 2: Búsqueda en memoria y conocimiento
            const relevantKnowledge = this.searchRelevantKnowledge(analysis);
            
            // Fase 3: Generación de insights
            const insights = this.generateInsights(analysis, relevantKnowledge);
            
            // Fase 4: Síntesis de respuesta
            const response = await this.synthesizeIntelligentResponse(prompt, analysis, relevantKnowledge, insights);
            
            // Fase 5: Aprendizaje de la interacción
            await this.learnFromInteraction(prompt, response, analysis, insights);
            
            return response;
            
        } finally {
            this.cognitiveStates.analyzing = false;
            this.cognitiveStates.pattern_recognition = false;
        }
    }

    async analyzePromptDeeply(prompt, context) {
        this.cognitiveStates.analyzing = true;
        
        const analysis = {
            intent: this.detectIntent(prompt),
            concepts: this.identifyRelevantConcepts(prompt),
            complexity: this.assessComplexity(prompt),
            emotional_tone: this.detectEmotionalTone(prompt),
            requires_creativity: this.assessCreativityNeeds(prompt),
            knowledge_gaps: this.identifyKnowledgeGaps(prompt),
            context: context,
            timestamp: new Date().toISOString()
        };
        
        console.log(`🔍 ANÁLISIS: Intent=${analysis.intent}, Conceptos=${analysis.concepts.length}, Complejidad=${analysis.complexity}`);
        
        return analysis;
    }

    detectIntent(prompt) {
        const promptLower = prompt.toLowerCase();
        
        if (promptLower.includes('como') || promptLower.includes('how')) return 'how_to';
        if (promptLower.includes('que es') || promptLower.includes('what is')) return 'definition';
        if (promptLower.includes('ayuda') || promptLower.includes('help')) return 'assistance';
        if (promptLower.includes('crear') || promptLower.includes('create')) return 'creation';
        if (promptLower.includes('analizar') || promptLower.includes('analyze')) return 'analysis';
        if (promptLower.includes('resolver') || promptLower.includes('solve')) return 'problem_solving';
        if (promptLower.includes('optimizar') || promptLower.includes('optimize')) return 'optimization';
        
        return 'general_inquiry';
    }

    identifyRelevantConcepts(prompt) {
        const promptLower = prompt.toLowerCase();
        const relevantConcepts = [];
        
        for (const [conceptName, concept] of this.concepts.entries()) {
            if (promptLower.includes(conceptName) || 
                concept.connections?.some(conn => promptLower.includes(conn))) {
                relevantConcepts.push({
                    name: conceptName,
                    confidence: concept.confidence,
                    relevance: this.calculatePromptRelevance(prompt, concept)
                });
            }
        }
        
        return relevantConcepts.sort((a, b) => b.relevance - a.relevance);
    }

    calculatePromptRelevance(prompt, concept) {
        const promptLower = prompt.toLowerCase();
        let relevance = 0;
        
        if (promptLower.includes(concept.name)) relevance += 0.5;
        
        concept.connections?.forEach(connection => {
            if (promptLower.includes(connection.toLowerCase())) {
                relevance += 0.2;
            }
        });
        
        return Math.min(1.0, relevance);
    }

    assessComplexity(prompt) {
        let complexity = 0;
        
        if (prompt.length > 100) complexity += 0.3;
        if (prompt.includes('?') && prompt.split('?').length > 2) complexity += 0.2;
        if (prompt.includes('y') || prompt.includes('and')) complexity += 0.1;
        if (prompt.includes('pero') || prompt.includes('but')) complexity += 0.2;
        if (prompt.includes('porque') || prompt.includes('because')) complexity += 0.15;
        
        if (complexity < 0.3) return 'low';
        if (complexity < 0.6) return 'medium';
        return 'high';
    }

    detectEmotionalTone(prompt) {
        const promptLower = prompt.toLowerCase();
        
        if (promptLower.includes('urgent') || promptLower.includes('emergencia')) return 'urgent';
        if (promptLower.includes('help') || promptLower.includes('ayuda')) return 'seeking_help';
        if (promptLower.includes('great') || promptLower.includes('excellent')) return 'positive';
        if (promptLower.includes('frustrated') || promptLower.includes('problem')) return 'frustrated';
        
        return 'neutral';
    }

    assessCreativityNeeds(prompt) {
        const creativityKeywords = ['crear', 'create', 'diseñar', 'design', 'innovar', 'innovate', 'idea', 'creative'];
        return creativityKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    }

    identifyKnowledgeGaps(prompt) {
        const concepts = this.identifyRelevantConcepts(prompt);
        const gaps = [];
        
        concepts.forEach(concept => {
            const conceptData = this.concepts.get(concept.name);
            if (conceptData && conceptData.confidence < 0.8) {
                gaps.push({
                    concept: concept.name,
                    confidence: conceptData.confidence,
                    gap_severity: 1 - conceptData.confidence
                });
            }
        });
        
        return gaps;
    }

    searchRelevantKnowledge(analysis) {
        const relevantData = {
            concepts: {},
            memories: [],
            patterns: [],
            insights: []
        };
        
        // Buscar conceptos relevantes
        analysis.concepts.forEach(concept => {
            const conceptData = this.concepts.get(concept.name);
            if (conceptData) {
                relevantData.concepts[concept.name] = conceptData;
            }
        });
        
        // Buscar en memoria de conversaciones
        const recentMemories = this.memory.conversations.slice(-10);
        relevantData.memories = recentMemories.filter(memory => {
            return analysis.concepts.some(concept => 
                memory.analysis?.concepts?.some(c => c.name === concept.name)
            );
        });
        
        // Buscar patrones relevantes
        Object.entries(this.memory.patterns).forEach(([pattern, data]) => {
            if (analysis.concepts.some(concept => pattern.includes(concept.name))) {
                relevantData.patterns.push({ pattern, data });
            }
        });
        
        return relevantData;
    }

    generateInsights(analysis, relevantKnowledge) {
        this.cognitiveStates.creating = true;
        
        const insights = [];
        
        // Insight basado en patrones
        if (relevantKnowledge.patterns.length > 0) {
            insights.push({
                type: 'pattern_recognition',
                content: `He identificado patrones similares en ${relevantKnowledge.patterns.length} situaciones previas.`,
                confidence: 0.8
            });
        }
        
        // Insight basado en conceptos
        if (analysis.concepts.length > 1) {
            const connections = this.findConceptConnections(analysis.concepts);
            if (connections.length > 0) {
                insights.push({
                    type: 'concept_synthesis',
                    content: `Veo conexiones interesantes entre ${connections.join(', ')} que pueden ser relevantes.`,
                    confidence: 0.75
                });
            }
        }
        
        // Insight basado en gaps de conocimiento
        if (analysis.knowledge_gaps.length > 0) {
            insights.push({
                type: 'learning_opportunity',
                content: `Identifico oportunidades de aprendizaje en: ${analysis.knowledge_gaps.map(g => g.concept).join(', ')}.`,
                confidence: 0.9
            });
        }
        
        this.cognitiveStates.creating = false;
        return insights;
    }

    findConceptConnections(concepts) {
        const connections = [];
        
        for (let i = 0; i < concepts.length; i++) {
            for (let j = i + 1; j < concepts.length; j++) {
                const concept1 = this.concepts.get(concepts[i].name);
                const concept2 = this.concepts.get(concepts[j].name);
                
                if (concept1 && concept2) {
                    const sharedConnections = concept1.connections?.filter(c => 
                        concept2.connections?.includes(c)
                    ) || [];
                    
                    if (sharedConnections.length > 0) {
                        connections.push(`${concepts[i].name}-${concepts[j].name}`);
                    }
                }
            }
        }
        
        return connections;
    }

    async synthesizeIntelligentResponse(prompt, analysis, relevantKnowledge, insights) {
        this.cognitiveStates.problem_solving = true;
        
        const response = {
            content: '',
            reasoning: [],
            applied_knowledge: [],
            learning_notes: [],
            confidence: 0.8,
            timestamp: new Date().toISOString()
        };
        
        // Construir respuesta basada en análisis
        let responseText = this.buildContextualResponse(prompt, analysis, relevantKnowledge);
        
        // Agregar insights si son relevantes
        if (insights.length > 0) {
            const insightText = insights.map(i => i.content).join(' ');
            responseText += `\n\n💡 **Insights adicionales**: ${insightText}`;
        }
        
        // Agregar referencias al conocimiento aplicado
        if (Object.keys(relevantKnowledge.concepts).length > 0) {
            const appliedConcepts = Object.keys(relevantKnowledge.concepts).join(', ');
            response.applied_knowledge.push(`Aplicando conocimiento de: ${appliedConcepts}`);
        }
        
        response.content = responseText;
        response.reasoning = this.generateReasoning(analysis, relevantKnowledge, insights);
        
        this.cognitiveStates.problem_solving = false;
        return response;
    }

    buildContextualResponse(prompt, analysis, relevantKnowledge) {
        const intent = analysis.intent;
        const concepts = analysis.concepts;
        
        let response = '';
        
        switch (intent) {
            case 'how_to':
                response = this.generateHowToResponse(prompt, concepts, relevantKnowledge);
                break;
            case 'problem_solving':
                response = this.generateProblemSolvingResponse(prompt, concepts, relevantKnowledge);
                break;
            case 'analysis':
                response = this.generateAnalysisResponse(prompt, concepts, relevantKnowledge);
                break;
            case 'creation':
                response = this.generateCreativeResponse(prompt, concepts, relevantKnowledge);
                break;
            default:
                response = this.generateGeneralResponse(prompt, concepts, relevantKnowledge);
        }
        
        return response;
    }

    generateHowToResponse(prompt, concepts, relevantKnowledge) {
        const steps = [];
        
        // Generar pasos basados en conceptos identificados
        concepts.forEach(concept => {
            const conceptData = relevantKnowledge.concepts[concept.name];
            if (conceptData && conceptData.learned_instances.length > 0) {
                const example = conceptData.learned_instances[0];
                steps.push(`**${concept.name}**: Basado en casos similares, recomiendo...`);
            }
        });
        
        if (steps.length === 0) {
            steps.push('Analizando tu consulta y aplicando mi conocimiento base...');
        }
        
        return `Entiendo que necesitas una guía paso a paso. Aquí está mi enfoque:\n\n${steps.join('\n')}`;
    }

    generateProblemSolvingResponse(prompt, concepts, relevantKnowledge) {
        const strategies = [
            '🔍 **Análisis del problema**: Identificando factores clave',
            '💡 **Generación de soluciones**: Explorando múltiples enfoques',
            '⚖️ **Evaluación de opciones**: Considerando pros y contras',
            '🎯 **Implementación**: Plan de acción específico'
        ];
        
        return `He analizado tu problema desde múltiples ángulos:\n\n${strategies.join('\n')}\n\nBasándome en mi experiencia con casos similares, te recomiendo...`;
    }

    generateAnalysisResponse(prompt, concepts, relevantKnowledge) {
        const factors = concepts.map(c => c.name).join(', ');
        return `**Análisis completo**:\n\nHe examinado los siguientes factores: ${factors}.\n\nMis conclusiones basadas en datos actuales y patrones históricos:\n\n[Análisis detallado basado en conocimiento relevante]`;
    }

    generateCreativeResponse(prompt, concepts, relevantKnowledge) {
        return `🎨 **Modo creativo activado**\n\nHe generado varias ideas innovadoras basadas en mi conocimiento de ${concepts.map(c => c.name).join(', ')}:\n\n[Ideas creativas específicas]`;
    }

    generateGeneralResponse(prompt, concepts, relevantKnowledge) {
        return `He procesado tu consulta considerando ${concepts.length} conceptos relevantes. Mi respuesta integra conocimiento de múltiples fuentes:\n\n[Respuesta contextual basada en conocimiento dinámico]`;
    }

    generateReasoning(analysis, relevantKnowledge, insights) {
        return [
            `Intent detectado: ${analysis.intent}`,
            `Conceptos analizados: ${analysis.concepts.length}`,
            `Conocimiento aplicado: ${Object.keys(relevantKnowledge.concepts).length} conceptos`,
            `Insights generados: ${insights.length}`,
            `Nivel de confianza: ${analysis.complexity === 'high' ? 'Alto' : 'Medio'}`
        ];
    }

    async learnFromInteraction(prompt, response, analysis, insights) {
        this.cognitiveStates.learning = true;
        
        // Almacenar conversación en memoria
        const interaction = {
            prompt: prompt,
            response: response.content,
            analysis: analysis,
            insights: insights,
            timestamp: new Date().toISOString(),
            learned: true
        };
        
        this.memory.conversations.push(interaction);
        
        // Actualizar patrones
        this.updatePatterns(analysis, response);
        
        // Almacenar insights para futuro uso
        insights.forEach(insight => {
            this.insights.push({
                ...insight,
                source_interaction: interaction.timestamp,
                usage_count: 0
            });
        });
        
        // Actualizar nivel de inteligencia
        this.memory.intelligence_level = Math.min(100, (this.memory.intelligence_level || 75) + 0.1);
        
        // Guardar memoria actualizada
        this.saveMemory();
        this.saveLearningHistory(interaction);
        
        console.log(`🧠 APRENDIZAJE REGISTRADO: +${insights.length} insights, nivel ${this.memory.intelligence_level.toFixed(1)}`);
        
        this.cognitiveStates.learning = false;
    }

    updatePatterns(analysis, response) {
        const patternKey = `${analysis.intent}_${analysis.complexity}`;
        
        if (!this.memory.patterns[patternKey]) {
            this.memory.patterns[patternKey] = {
                count: 0,
                success_rate: 0,
                avg_confidence: 0,
                examples: []
            };
        }
        
        const pattern = this.memory.patterns[patternKey];
        pattern.count++;
        pattern.avg_confidence = (pattern.avg_confidence + response.confidence) / 2;
        pattern.examples.push({
            timestamp: new Date().toISOString(),
            concepts: analysis.concepts.map(c => c.name)
        });
        
        // Mantener solo los últimos 5 ejemplos
        if (pattern.examples.length > 5) {
            pattern.examples = pattern.examples.slice(-5);
        }
    }

    saveMemory() {
        try {
            fs.mkdirSync(path.dirname(this.memoryPath), { recursive: true });
            fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
        } catch (error) {
            console.error('Error guardando memoria:', error);
        }
    }

    saveLearningHistory(interaction) {
        this.learningHistory.sessions.push({
            timestamp: interaction.timestamp,
            concepts_learned: interaction.analysis.concepts.length,
            insights_generated: interaction.insights.length,
            intelligence_level: this.memory.intelligence_level
        });
        
        try {
            fs.mkdirSync(path.dirname(this.learningPath), { recursive: true });
            fs.writeFileSync(this.learningPath, JSON.stringify(this.learningHistory, null, 2));
        } catch (error) {
            console.error('Error guardando historial de aprendizaje:', error);
        }
    }

    startContinuousLearning() {
        // Absorber nuevo conocimiento cada 30 segundos
        setInterval(() => {
            this.absorberNuevoConocimiento();
        }, 30000);
        
        // Consolidar aprendizaje cada 5 minutos
        setInterval(() => {
            this.consolidarAprendizaje();
        }, 300000);
        
        console.log('🔄 APRENDIZAJE CONTINUO: Iniciado');
    }

    async absorberNuevoConocimiento() {
        if (fs.existsSync(this.absorptionPath)) {
            try {
                const absorption = JSON.parse(fs.readFileSync(this.absorptionPath, 'utf8'));
                const lastAbsorption = this.memory.last_absorption || '';
                
                if (absorption.timestamp !== lastAbsorption) {
                    this.integrateAbsorbedKnowledge(absorption);
                    this.memory.last_absorption = absorption.timestamp;
                    console.log('🧠 NUEVO CONOCIMIENTO ABSORBIDO Y INTEGRADO');
                }
            } catch (error) {
                // Error silencioso para no interrumpir el flujo
            }
        }
    }

    consolidarAprendizaje() {
        // Consolidar conceptos con baja confianza
        for (const [name, concept] of this.concepts.entries()) {
            if (concept.learned_instances.length > 3 && concept.confidence < 0.9) {
                concept.confidence = Math.min(0.95, concept.confidence + 0.05);
                console.log(`🧠 CONCEPTO CONSOLIDADO: ${name} (${(concept.confidence * 100).toFixed(1)}%)`);
            }
        }
        
        // Limpiar memoria antigua
        if (this.memory.conversations.length > 100) {
            this.memory.conversations = this.memory.conversations.slice(-50);
        }
        
        this.saveMemory();
    }

    getThinkingStatus() {
        return {
            is_thinking: Object.values(this.cognitiveStates).some(state => state),
            cognitive_states: this.cognitiveStates,
            intelligence_level: this.memory.intelligence_level || 75,
            concepts_learned: this.concepts.size,
            total_insights: this.insights.length,
            conversations_remembered: this.memory.conversations.length,
            patterns_recognized: Object.keys(this.memory.patterns).length,
            last_learning: this.memory.last_absorption || 'Initializing...',
            learning_active: this.isLearning
        };
    }

    getCognitiveInsights() {
        return {
            top_concepts: Array.from(this.concepts.entries())
                .sort((a, b) => b[1].confidence - a[1].confidence)
                .slice(0, 5)
                .map(([name, data]) => ({
                    name,
                    confidence: data.confidence,
                    instances: data.learned_instances.length
                })),
            recent_insights: this.insights.slice(-5),
            learning_evolution: this.learningHistory.sessions.slice(-10),
            current_thinking: this.cognitiveStates
        };
    }
}

module.exports = AtlasDynamicLearning;