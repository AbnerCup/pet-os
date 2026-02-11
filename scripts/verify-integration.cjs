#!/usr/bin/env node

/**
 * Script de Verificación de Integración Pet-OS
 * Verifica que backend, frontend y mobile estén correctamente configurados
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
    const exists = fs.existsSync(filePath);
    if (exists) {
        log(`✅ ${description}: ${filePath}`, colors.green);
        return true;
    } else {
        log(`❌ ${description} NO ENCONTRADO: ${filePath}`, colors.red);
        return false;
    }
}

function readEnvFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch (error) {
        return null;
    }
}

async function checkEndpoint(url, description) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;

        const req = client.get(url, (res) => {
            if (res.statusCode === 200) {
                log(`✅ ${description}: ${url}`, colors.green);
                resolve(true);
            } else {
                log(`⚠️  ${description} respondió con código ${res.statusCode}: ${url}`, colors.yellow);
                resolve(false);
            }
        });

        req.on('error', (error) => {
            log(`❌ ${description} NO ACCESIBLE: ${url}`, colors.red);
            log(`   Error: ${error.message}`, colors.red);
            resolve(false);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            log(`❌ ${description} TIMEOUT: ${url}`, colors.red);
            resolve(false);
        });
    });
}

async function main() {
    log('\n🔍 VERIFICACIÓN DE INTEGRACIÓN PET-OS\n', colors.cyan);
    log('='.repeat(60), colors.cyan);

    const rootDir = path.join(__dirname, '..');

    // 1. Verificar estructura de carpetas
    log('\n📁 1. ESTRUCTURA DE CARPETAS', colors.blue);
    log('-'.repeat(60));

    const backendDir = path.join(rootDir, 'backend');
    const frontendDir = path.join(rootDir, 'frontend');
    const mobileDir = path.join(rootDir, 'mobile');

    const hasBackend = checkFile(backendDir, 'Backend');
    const hasFrontend = checkFile(frontendDir, 'Frontend');
    const hasMobile = checkFile(mobileDir, 'Mobile');

    // 2. Verificar archivos de configuración
    log('\n⚙️  2. ARCHIVOS DE CONFIGURACIÓN', colors.blue);
    log('-'.repeat(60));

    const backendEnv = path.join(backendDir, '.env');
    const frontendEnv = path.join(frontendDir, '.env.local');
    const backendPackage = path.join(backendDir, 'package.json');
    const frontendPackage = path.join(frontendDir, 'package.json');
    const mobilePackage = path.join(mobileDir, 'package.json');

    checkFile(backendEnv, 'Backend .env');
    checkFile(frontendEnv, 'Frontend .env.local');
    checkFile(backendPackage, 'Backend package.json');
    checkFile(frontendPackage, 'Frontend package.json');
    checkFile(mobilePackage, 'Mobile package.json');

    // 3. Verificar configuración de puertos
    log('\n🔌 3. CONFIGURACIÓN DE PUERTOS Y URLs', colors.blue);
    log('-'.repeat(60));

    const backendEnvVars = readEnvFile(backendEnv);
    const frontendEnvVars = readEnvFile(frontendEnv);

    if (backendEnvVars) {
        log(`Backend PORT: ${backendEnvVars.PORT || '3001 (default)'}`, colors.cyan);
        log(`Backend DATABASE_URL: ${backendEnvVars.DATABASE_URL ? '✅ Configurado' : '❌ No configurado'}`,
            backendEnvVars.DATABASE_URL ? colors.green : colors.red);
        log(`Backend JWT_SECRET: ${backendEnvVars.JWT_SECRET ? '✅ Configurado' : '❌ No configurado'}`,
            backendEnvVars.JWT_SECRET ? colors.green : colors.red);
    }

    if (frontendEnvVars) {
        log(`Frontend API_URL: ${frontendEnvVars.NEXT_PUBLIC_API_URL || 'http://localhost:3001 (default)'}`, colors.cyan);
    }

    // Verificar consistencia de puertos
    const backendPort = backendEnvVars?.PORT || '3001';
    const frontendApiUrl = frontendEnvVars?.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const frontendExpectedPort = frontendApiUrl.match(/:(\d+)/)?.[1] || '3001';

    if (backendPort === frontendExpectedPort) {
        log(`✅ Puertos consistentes: Backend(${backendPort}) = Frontend(${frontendExpectedPort})`, colors.green);
    } else {
        log(`⚠️  INCONSISTENCIA DE PUERTOS: Backend(${backendPort}) ≠ Frontend(${frontendExpectedPort})`, colors.yellow);
    }

    // 4. Verificar node_modules
    log('\n📦 4. DEPENDENCIAS INSTALADAS', colors.blue);
    log('-'.repeat(60));

    checkFile(path.join(backendDir, 'node_modules'), 'Backend node_modules');
    checkFile(path.join(frontendDir, 'node_modules'), 'Frontend node_modules');
    checkFile(path.join(mobileDir, 'node_modules'), 'Mobile node_modules');

    // 5. Verificar endpoints (si están corriendo)
    log('\n🌐 5. VERIFICACIÓN DE ENDPOINTS', colors.blue);
    log('-'.repeat(60));
    log('Intentando conectar a los servicios...\n');

    const backendUrl = `http://localhost:${backendPort}/api/health-check`;
    const frontendUrl = 'http://localhost:3000';

    await checkEndpoint(backendUrl, 'Backend Health Check');
    await checkEndpoint(frontendUrl, 'Frontend');

    // 6. Verificar archivos clave de API
    log('\n🔗 6. ARCHIVOS DE INTEGRACIÓN', colors.blue);
    log('-'.repeat(60));

    checkFile(path.join(frontendDir, 'lib', 'api.ts'), 'Frontend API Client');
    checkFile(path.join(mobileDir, 'src', 'api', 'config.ts'), 'Mobile API Config');
    checkFile(path.join(mobileDir, 'src', 'api', 'endpoints.ts'), 'Mobile API Endpoints');
    checkFile(path.join(backendDir, 'src', 'routes', 'index.ts'), 'Backend Routes');

    // Resumen final
    log('\n' + '='.repeat(60), colors.cyan);
    log('📊 RESUMEN', colors.cyan);
    log('='.repeat(60), colors.cyan);

    log('\n✅ Para iniciar los servicios:', colors.green);
    log('   Backend:  cd backend && npm run dev', colors.cyan);
    log('   Frontend: cd frontend && npm run dev', colors.cyan);
    log('   Mobile:   cd mobile && npm start', colors.cyan);

    log('\n📖 Para más información, consulta:', colors.yellow);
    log('   INTEGRATION_ANALYSIS.md', colors.cyan);

    log('\n');
}

main().catch(console.error);
