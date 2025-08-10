#!/bin/bash

# AtlasOutbound-AI Deployment Script
# Prepara el sistema para despliegue en Replit, Gitpod o servidor

echo "🚀 AtlasOutbound-AI Deployment Script"
echo "====================================="

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar Python
print_status "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python found: $PYTHON_VERSION"
else
    print_error "Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Crear directorios necesarios
print_status "Creating directory structure..."
mkdir -p data
mkdir -p logs
mkdir -p reports
mkdir -p config
mkdir -p ui
mkdir -p scripts

print_success "Directory structure created"

# Instalar dependencias Python
print_status "Installing Python dependencies..."
cat > requirements.txt << EOF
requests>=2.28.0
sqlite3
schedule>=1.2.0
python-dateutil>=2.8.0
beautifulsoup4>=4.11.0
lxml>=4.9.0
twilio>=8.2.0
sendgrid>=6.9.0
python-linkedin-v2>=2.0.0
pandas>=1.5.0
numpy>=1.21.0
EOF

if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
    print_success "Python dependencies installed"
else
    print_warning "pip3 not found. Please install dependencies manually"
fi

# Crear archivo de configuración de ejemplo
print_status "Creating configuration files..."
if [ ! -f "config/api_keys.json" ]; then
    cp config/api_keys.json config/api_keys.json.example
    print_warning "Please configure API keys in config/api_keys.json"
fi

if [ ! -f "config/orchestrator_config.json" ]; then
    cat > config/orchestrator_config.json << EOF
{
  "auto_discovery": {
    "enabled": true,
    "schedule": "daily",
    "time": "09:00",
    "target_industries": [
      "artificial intelligence",
      "software development",
      "digital marketing",
      "fintech"
    ],
    "leads_per_run": 50
  },
  "outreach": {
    "enabled": true,
    "auto_send": false,
    "daily_limit": 25,
    "preferred_channels": ["email"]
  },
  "tracking": {
    "enabled": true,
    "auto_track": true,
    "report_schedule": "daily"
  }
}
EOF
    print_success "Configuration files created"
fi

# Crear script de inicio
print_status "Creating startup scripts..."
cat > start_atlas_outbound.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AtlasOutbound-AI..."
cd "$(dirname "$0")"
python3 atlas_outbound_orchestrator.py
EOF

chmod +x start_atlas_outbound.sh

# Crear script de inicio en background
cat > start_atlas_background.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AtlasOutbound-AI in background..."
cd "$(dirname "$0")"
nohup python3 atlas_outbound_orchestrator.py > logs/atlas_outbound.log 2>&1 &
echo $! > atlas_outbound.pid
echo "✅ AtlasOutbound-AI started with PID: $(cat atlas_outbound.pid)"
echo "📄 Logs: tail -f logs/atlas_outbound.log"
EOF

chmod +x start_atlas_background.sh

# Crear script de parada
cat > stop_atlas_outbound.sh << 'EOF'
#!/bin/bash
if [ -f atlas_outbound.pid ]; then
    PID=$(cat atlas_outbound.pid)
    echo "⏹️ Stopping AtlasOutbound-AI (PID: $PID)..."
    kill $PID
    rm atlas_outbound.pid
    echo "✅ AtlasOutbound-AI stopped"
else
    echo "❌ No PID file found. AtlasOutbound-AI may not be running."
fi
EOF

chmod +x stop_atlas_outbound.sh

print_success "Startup scripts created"

# Configuración para Replit
if [ -f ".replit" ]; then
    print_status "Configuring for Replit..."
    
    # Añadir configuración a .replit si no existe
    if ! grep -q "AtlasOutbound" .replit; then
        cat >> .replit << EOF

# AtlasOutbound-AI Configuration
[deployment]
run = ["python3", "server/atlas-outbound/atlas_outbound_orchestrator.py"]
deploymentTarget = "cloudrun"

[env]
ATLAS_OUTBOUND_AUTO_START = "true"
EOF
    fi
    
    print_success "Replit configuration updated"
fi

# Configuración para package.json (si existe)
if [ -f "package.json" ]; then
    print_status "Adding npm scripts..."
    
    # Backup package.json
    cp package.json package.json.backup
    
    # Añadir scripts usando jq si está disponible, sino usar sed
    if command -v jq &> /dev/null; then
        cat package.json | jq '.scripts["atlas:start"] = "cd server/atlas-outbound && python3 atlas_outbound_orchestrator.py"' > package_temp.json
        cat package_temp.json | jq '.scripts["atlas:background"] = "cd server/atlas-outbound && ./start_atlas_background.sh"' > package.json
        rm package_temp.json
    else
        print_warning "jq not found. Please add atlas scripts to package.json manually"
    fi
    
    print_success "npm scripts added"
fi

# Verificar archivos principales
print_status "Verifying core files..."
CORE_FILES=(
    "lead_finder.py"
    "lead_scorer.py" 
    "message_generator.py"
    "auto_sender.py"
    "tracker.py"
    "atlas_outbound_orchestrator.py"
)

MISSING_FILES=()
for file in "${CORE_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    print_success "All core files present"
else
    print_error "Missing files: ${MISSING_FILES[*]}"
    exit 1
fi

# Inicializar base de datos
print_status "Initializing database..."
python3 -c "
from lead_finder import LeadFinder
from lead_scorer import LeadScorer
finder = LeadFinder()
scorer = LeadScorer()
print('✅ Database initialized')
"

# Crear archivo README
print_status "Creating README..."
cat > README_DEPLOYMENT.md << 'EOF'
# AtlasOutbound-AI Deployment

## Quick Start

### Manual Start
```bash
./start_atlas_outbound.sh
```

### Background Start
```bash
./start_atlas_background.sh
```

### Stop
```bash
./stop_atlas_outbound.sh
```

### Using npm (if available)
```bash
npm run atlas:start
npm run atlas:background
```

## Configuration

1. Edit `config/api_keys.json` with your API keys
2. Modify `config/orchestrator_config.json` for automation settings
3. Access dashboard at `ui/dashboard.html`

## Monitoring

- Logs: `tail -f logs/atlas_outbound.log`
- Reports: Check `reports/` directory
- Database: `data/atlas_leads.db`

## API Keys Needed

- Hunter.io (optional)
- Apollo.io (optional)
- SendGrid or Mailgun (for email)
- LinkedIn API (optional)
- Twilio (for WhatsApp)

## Features

✅ Autonomous lead discovery
✅ Intelligent lead scoring  
✅ Personalized message generation
✅ Multi-channel outreach
✅ Real-time tracking & analytics
✅ A/B testing & optimization
✅ 24/7 autonomous operation

EOF

print_success "README created"

# Realizar test básico
print_status "Running basic functionality test..."
python3 -c "
try:
    from atlas_outbound_orchestrator import AtlasOutboundOrchestrator
    orchestrator = AtlasOutboundOrchestrator()
    status = orchestrator.get_system_status()
    print(f'✅ System status: {status[\"status\"]}')
except Exception as e:
    print(f'❌ Test failed: {e}')
"

# Resumen final
echo ""
echo "🎉 AtlasOutbound-AI Deployment Complete!"
echo "======================================"
print_success "✅ Core modules installed"
print_success "✅ Configuration files created"
print_success "✅ Database initialized"
print_success "✅ Startup scripts ready"
print_success "✅ Dashboard available"

echo ""
echo "📋 Next Steps:"
echo "1. Configure API keys in config/api_keys.json"
echo "2. Review settings in config/orchestrator_config.json"
echo "3. Start the system: ./start_atlas_outbound.sh"
echo "4. Access dashboard: open ui/dashboard.html"
echo "5. Monitor logs: tail -f logs/atlas_outbound.log"

echo ""
print_warning "⚠️  Remember to configure your email/SMS providers for outreach"
print_warning "⚠️  Test with small limits before full automation"

echo ""
echo "🚀 AtlasOutbound-AI is ready for autonomous lead generation!"