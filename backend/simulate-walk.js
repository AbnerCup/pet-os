const http = require('http');

const BASE = 'http://localhost:3001/api';
// ID de la mascota a simular (Buddy creada en test anterior o cambiar por la real)
// Puedes obtener el ID corriendo: node test-location.js primero
const PET_ID = 'cmliika0g00028vvtyo6yv3h0'; // Buddy de ejemplo
const TOKEN = '...'; // Necesitaríamos el token, pero el script de test ya lo obtiene

// Mejor hagamos un script interactivo que hace login y luego simula
async function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE + path);
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers,
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🚶 SIMULADOR DE PASEO - PET OS\n');

    // 1. Login
    console.log('🔑 Login con gps-test@test.com...');
    const login = await request('POST', '/auth/login', {
        email: 'gps-test@test.com',
        password: '123456'
    });

    if (!login.body?.data?.token) {
        console.error('❌ Login falló. Asegúrate de haber corrido node test-location.js primero.');
        return;
    }

    const token = login.body.data.token;

    // 2. Buscar mascota
    const pets = await request('GET', '/pets', null, token);
    if (!pets.body?.data || pets.body.data.length === 0) {
        console.error('❌ No tienes mascotas.');
        return;
    }

    const pet = pets.body.data[0];
    console.log(`🐶 Simulando paseo para: ${pet.name} (${pet.id})`);
    console.log('   (Abre la app móvil y ve al mapa de rastreo para ver el movimiento)\n');

    // 3. Simular ruta
    // Centro aproximado de Santa Cruz
    let lat = -17.7833;
    let lng = -63.1821;
    let battery = 95;

    console.log('🚀 Iniciando simulación (Ctrl+C para detener)...');

    while (true) {
        // Mover un poco (caminata aleatoria hacia el noreste)
        lat += (Math.random() - 0.3) * 0.0005;
        lng += (Math.random() - 0.3) * 0.0005;
        battery -= 0.1;

        const res = await request('POST', '/location', {
            petId: pet.id,
            latitude: lat,
            longitude: lng,
            accuracy: 5 + Math.random() * 5,
            battery: Math.floor(battery)
        }, token);

        if (res.status === 201) {
            const time = new Date().toLocaleTimeString();
            console.log(`[${time}] 📍 lat:${lat.toFixed(6)} lng:${lng.toFixed(6)} bat:${Math.floor(battery)}%`);
        } else {
            console.log('⚠️ Error enviando ubicación:', res.status);
        }

        await sleep(3000); // Cada 3 segundos
    }
}

main().catch(console.error);
