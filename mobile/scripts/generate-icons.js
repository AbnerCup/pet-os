#!/usr/bin/env node

/**
 * Script para verificar y configurar iconos de la app
 * 
 * Este script ayuda a asegurar que los iconos se vean correctamente
 * tanto en desarrollo (Expo Go) como en la APK construida.
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

console.log('🔧 Verificador de Iconos Pet OS\n');

// Verificar archivos existentes
const files = {
  icon: path.join(ASSETS_DIR, 'icon.png'),
  adaptiveIcon: path.join(ASSETS_DIR, 'adaptive-icon.png'),
  splash: path.join(ASSETS_DIR, 'splash.png'),
  foreground: path.join(ASSETS_DIR, 'adaptive-icon-foreground.png'),
  background: path.join(ASSETS_DIR, 'adaptive-icon-background.png'),
};

console.log('📁 Archivos de iconos:\n');

Object.entries(files).forEach(([name, filepath]) => {
  const exists = fs.existsSync(filepath);
  const status = exists ? '✅' : '❌';
  const filename = path.basename(filepath);
  
  if (exists) {
    const stats = fs.statSync(filepath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`${status} ${filename.padEnd(30)} ${sizeKB} KB`);
  } else {
    console.log(`${status} ${filename.padEnd(30)} NO EXISTE`);
  }
});

console.log('\n📋 Requisitos para iconos correctos:\n');

console.log('1. icon.png (1024x1024)');
console.log('   - Icono principal para iOS');
console.log('   - Fondo verde (#7c9a6b) + huella blanca');
console.log('   - Puede tener fondo incluido\n');

console.log('2. adaptive-icon-foreground.png (1024x1024) ⚠️ IMPORTANTE');
console.log('   - SOLO la huella blanca');
console.log('   - FONDO TRANSPARENTE (PNG con alpha)');
console.log('   - Sin fondo verde incluido\n');

console.log('3. adaptive-icon-background.png (opcional)');
console.log('   - Puede ser un color sólido o imagen');
console.log('   - Se define en app.json como backgroundColor: "#7c9a6b"\n');

// Verificar si hay problemas conocidos
const hasForeground = fs.existsSync(files.foreground);
const hasAdaptiveIcon = fs.existsSync(files.adaptiveIcon);

console.log('🔍 Diagnóstico:\n');

if (!hasForeground && hasAdaptiveIcon) {
  console.log('⚠️  PROBLEMA DETECTADO:');
  console.log('   Tienes adaptive-icon.png pero NO adaptive-icon-foreground.png');
  console.log('   Esto causará que el icono se vea diferente en la APK vs Expo Go.\n');
  console.log('   SOLUCIÓN:');
  console.log('   1. Crea una versión de la huella SIN fondo verde');
  console.log('   2. Guárdala como adaptive-icon-foreground.png');
  console.log('   3. Actualiza app.json para usar foregroundImage\n');
}

// Leer app.json para verificar configuración
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

console.log('📱 Configuración actual en app.json:\n');

const androidConfig = appJson.expo?.android;
if (androidConfig?.adaptiveIcon) {
  console.log('Android Adaptive Icon:');
  console.log(`  foregroundImage: ${androidConfig.adaptiveIcon.foregroundImage}`);
  console.log(`  backgroundColor: ${androidConfig.adaptiveIcon.backgroundColor}`);
} else {
  console.log('❌ No hay configuración de adaptiveIcon para Android');
}

console.log('\n✅ Verificación completada.\n');
