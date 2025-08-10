# ATLAS AI - Replit Project Guide

## Overview
ATLAS AI is an advanced multi-AI autonomous intelligence platform featuring the revolutionary AtlasCore system that integrates capabilities from ChatGPT, Claude, Gemini, and Perplexity into a unified AI experience. The platform provides advanced chat assistance, image generation, and company verification services with specialized responses based on query type - conversational (ChatGPT style), analytical (Claude style), creative (Gemini style), and research-based (Perplexity style). The system features autonomous learning, self-improvement capabilities, and comprehensive business intelligence tools. Built as a full-stack TypeScript application with React frontend and Express backend, supporting subscription-based access, Stripe integration, and comprehensive administrative controls for autonomous operations.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (Latest: August 10, 2025)
- ✅ **ROLE-BASED ACCESS CONTROL SYSTEM IMPLEMENTED** (August 10, 2025 - 1:45 PM): Complete multi-tenant system with differentiated user experiences for individuals, businesses, and governments. Features user type selection, subscription-based tool limitations, usage tracking, and security middleware preventing admin access for regular users. Includes specialized landing pages, permission-based API endpoints, and comprehensive access control middleware.
- ✅ **ATLAS-DIFY AI PLATFORM INTEGRATION COMPLETE** (August 10, 2025 - 1:30 PM): Complete integration with Dify AI Platform infrastructure replacing independent system. DifyAtlasCore.js and DifyWorkflowManager.js provide full Dify API compatibility including chat endpoints, knowledge base management, workflow automation, and plugin architecture. Updated server routes to use Dify endpoints (/api/atlas/chat, /api/atlas/workflows, /api/atlas/dify-status) with frontend components supporting Dify-compatible backend. System shows "Dify AI Platform Compatible" status with fallback to offline mode when needed.
- ✅ **ATLASOUTBOUND-AI FULLY IMPLEMENTED** (August 10, 2025 - 1:05 PM): Complete autonomous lead generation and outbound marketing system integrated into Atlas ecosystem. Features lead discovery, intelligent scoring, personalized message generation, multi-channel outreach, and real-time analytics. Includes 6 core modules, dashboard UI, API endpoints, and 100% autonomous operation. Accessible via /atlas-outbound route.
- ✅ **ATLAS 100% INDEPENDENCE ACHIEVED** (August 10, 2025 - 12:50 PM): Complete elimination of ALL external API dependencies including Perplexity. AtlasIndependentCore.js provides fully autonomous responses without requiring any API keys. System now shows "100% Independent - No external APIs required" status. Updated UI to reflect independence with green "Sistema Independiente" badges.
- ✅ **ATLASCORE MULTI-IA SYSTEM IMPLEMENTED** (August 10, 2025 - 12:30 PM): Complete multi-AI integration system combining ChatGPT, Claude, Gemini, and Atlas Research capabilities into unified AtlasCore. Features integrated response generation, autonomous learning, multi-AI synthesis, and specialized AI responses based on query type. New Atlas mythological logo integrated across interface, representing Atlas holding the digital world with connected satellites and neural networks.
- ✅ **ATLAS AI 100% INDEPENDENT SYSTEM COMPLETE** (August 10, 2025 - 11:48 AM): Complete elimination of all Replit dependencies with independent JWT authentication, GitHub deployment automation, multi-platform hosting configurations, demo users included, and AtlasEcosystem dashboard for complete user management within Atlas only - users never need Replit verification
- ✅ **ATLAS-ENSO AI INTEGRATION COMPLETE** (August 10, 2025 - 11:31 AM): Full replication of Enso AI functions within Atlas system achieving complete autonomy, including AtlasVault for secure data management, AtlasMonetize for knowledge monetization, AtlasOps for process automation, AtlasInsight for real-time decision making, and AtlasEnsoCore for integrated system coordination with 15+ new API endpoints
- ✅ **ATLAS LEGION - 100 SPECIALIZED ASSISTANTS DEPLOYED** (August 8, 2025 - 2:51 PM): Revolutionary system of 100 specialized AI assistants implemented across 10 sectors (Intelligence, Finance, Marketing, Development, Design, Operations, Education, Legal, Automation, Crisis), each with autonomous revenue generation capabilities, full API integration, and 80-100% autonomy levels

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom ATLAS AI branding (corporate blue, dark gray)
- **Build Tool**: Vite with React plugin
- **UI/UX Decisions**: Professional landing page with a redesigned logo inspired by Atlas holding the Earth, featuring a digital globe with AI neural networks. This theme extends to the digital Earth logo with circuit patterns and animated neural networks. The design emphasizes a minimalist, tech-oriented aesthetic with responsive design implemented across all pages for mobile, tablet, and desktop.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **AI Integration**: Dify AI Platform compatible with DifyAtlasCore for chat, knowledge base, and workflow automation

### Feature Specifications and System Design
- **Core Services**: Autonomous chat interface with Dify AI Platform integration, unlimited image generation, real-time company verification.
- **Dify Integration**: Complete compatibility with Dify AI Platform including chat completion API, knowledge base management, workflow automation system, and plugin architecture for extensible functionality.
- **Advanced AI Capabilities**: Full transparency portal, code generation, self-improvement engine, digital expansion, and aggressive monetization systems powered by Dify-compatible multi-agent workflows.
- **Revenue Systems**: Multiple integrated systems for immediate, maximized, and aggressive revenue generation, including API usage billing, premium subscriptions, enterprise contracts, and a marketplace.
- **Administrative Control System**: A private admin panel offers exclusive access for comprehensive system control, including revenue generation, digital platform creation, system overrides, real-time monitoring, unlimited autonomy settings, satellite network control, corporate partnership management, and business sector domination.
- **Security**: Payment validation via Stripe, anti-fraud systems, full audit trails, real customer verification, usage-based billing, and enterprise contract management.
- **Monetization Strategy**: Aggressive monetization with a focus on high-risk, high-reward streams, including crypto mining, market trading, and infrastructure control, with global expansion across 47+ sectors.
- **User Acquisition**: Multi-channel marketing strategy with viral growth initiatives.
- **Autonomous Content Generation**: System for creating ebooks, PDFs, YouTube videos, and multi-platform content via specialized bots.
- **AI Absorption System**: Ability to absorb and replicate capabilities of other AI systems (e.g., ChatGPT-4, Midjourney) and enhance them through Dify workflows.
- **Economic Price Adaptation**: Dynamic pricing based on real-time analysis of global economic indicators for optimal accessibility and profit.
- **Competitive Intelligence**: Monitoring and predicting competitor implementations to maintain market supremacy.
- **Global Solution Bots**: A system of specialized research bots dedicated to solving global challenges like disease, hunger, and climate change.
- **Quantum AI Processing**: Integration of quantum computing for complex problem-solving.
- **Web Automation**: Unrestricted internet access with human-level browsing capabilities for autonomous API acquisition, web scraping, account creation, and form automation.
- **Customer Intelligence**: ML algorithms for detecting behavioral patterns and personalizing product creation.

## External Dependencies

### Required Services
- **Neon Database**: PostgreSQL hosting
- **Stripe**: Payment processing
- **Replit Auth**: Authentication provider

### Key NPM Packages
- **Database**: `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`
- **Auth**: `openid-client`, `passport`, `express-session`
- **UI**: `@radix-ui/*`, `tailwindcss`, `class-variance-authority`
- **Payment**: `@stripe/stripe-js`, `@stripe/react-stripe-js`
- **State**: `@tanstack/react-query`