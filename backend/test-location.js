const http = require('http');

const BASE = 'http://localhost:3001/api';

function request(method, path, body, token) {
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

async function main() {
    console.log('═══════════════════════════════════════');
    console.log('  TEST DE API DE UBICACIÓN (V2) - PET OS');
    console.log('═══════════════════════════════════════\n');

    let token, userId;
    const testUser = {
        email: 'gps-test@test.com',
        password: '123456',
        name: 'GPS Tester'
    };

    // 1. Intentar Login con gps-test
    console.log(`🔑 1. Login con ${testUser.email}...`);
    let loginRes = await request('POST', '/auth/login', {
        email: testUser.email,
        password: testUser.password
    });

    if (loginRes.body?.data?.token) {
        token = loginRes.body.data.token;
        userId = loginRes.body.data.user?.id;
        const userPlan = loginRes.body.data.user?.plan;
        console.log(`   ✅ Login OK - Plan: ${userPlan}`);

        if (userPlan === 'FREE') {
            console.log('   ⚠️  ALERTA: El usuario es FREE. Los endpoints de ubicación podrían fallar (403 Forbidden).');
            console.log('   Ejecuta "npx ts-node update-user-plan.ts" para actualizar a BASIC.');
        }
    } else {
        // Si login falla, intentar registro
        console.log('   ❌ Login falló. Registrando usuario nuevo...');
        const regRes = await request('POST', '/auth/register', testUser);

        if (regRes.body?.data?.token) {
            token = regRes.body.data.token;
            userId = regRes.body.data.user?.id;
            console.log(`   ✅ Registrado - Plan: ${regRes.body.data.user?.plan}`);
            console.log('   ⚠️  NUEVO USUARIO FREE. Ejecuta "npx ts-node update-user-plan.ts" y vuelve a correr este test.');
            return;
        } else {
            console.error('   ❌ No se pudo registrar ni loguear. Abortando.');
            console.error('   Respuesta:', JSON.stringify(regRes.body));
            return;
        }
    }

    console.log(`   User ID: ${userId}\n`);

    // 2. Obtener mascotas
    console.log('🐾 2. Obteniendo mascotas...');
    const petsRes = await request('GET', '/pets', null, token);

    let petId, petName;

    if (petsRes.body?.data && petsRes.body.data.length > 0) {
        petId = petsRes.body.data[0].id;
        petName = petsRes.body.data[0].name;
        console.log(`   Mascotas encontradas: ${petsRes.body.data.length}`);
        petsRes.body.data.forEach(p => console.log(`   - ${p.name} (${p.id})`));
    } else {
        console.log('   No hay mascotas. Creando una...');
        const createPet = await request('POST', '/pets', {
            name: 'Buddy',
            species: 'dog',
            breed: 'Labrador',
            weight: 25
        }, token);

        if (createPet.body?.data) {
            petId = createPet.body.data.id;
            petName = createPet.body.data.name;
            console.log(`   ✅ Mascota creada: ${petName}`);
        } else {
            console.error('   ❌ No se pudo crear mascota');
            return;
        }
    }

    console.log(`   → Usando: ${petName} (${petId})\n`);

    // 3. Registrar ubicación individual
    console.log('📍 3. POST /location (registrar ubicación)...');
    const loc1 = await request('POST', '/location', {
        petId,
        latitude: -17.7833,
        longitude: -63.1821,
        accuracy: 10,
        battery: 85
    }, token);

    if (loc1.status === 201) {
        console.log(`   ✅ Registrada: lat:${loc1.body.data?.latitude}, lng:${loc1.body.data?.longitude}`);
    } else {
        console.log(`   ❌ Error ${loc1.status}: ${JSON.stringify(loc1.body)}`);
        if (loc1.status === 403) return;
    }

    // 4. Registrar múltiples ubicaciones (movimiento)
    console.log('\n📍 4. Simulando movimiento (3 posiciones)...');
    const positions = [
        { lat: -17.7835, lng: -63.1825, acc: 8, bat: 83 },
        { lat: -17.7840, lng: -63.1828, acc: 12, bat: 81 },
        { lat: -17.7842, lng: -63.1832, acc: 6, bat: 79 },
    ];

    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const res = await request('POST', '/location', {
            petId,
            latitude: pos.lat,
            longitude: pos.lng,
            accuracy: pos.acc,
            battery: pos.bat
        }, token);
        if (res.status === 201) {
            console.log(`   ${i + 1}. ✅ lat:${pos.lat} lng:${pos.lng}`);
        } else {
            console.log(`   ${i + 1}. ❌ Error ${res.status}`);
        }
    }

    // 5. Última ubicación de todas las mascotas
    console.log('\n🗺️  5. GET /location/latest (overview)...');
    const latestAll = await request('GET', '/location/latest', null, token);
    if (latestAll.body?.data) {
        latestAll.body.data.forEach(item => {
            const loc = item.location;
            console.log(`   🐾 ${item.pet.name}: ${loc ? `✅ lat:${loc.latitude} lng:${loc.longitude}` : 'Sin ubicación'}`);
        });
    }

    // 6. Última ubicación de una mascota
    console.log(`\n📌 6. GET /location/latest/${petId}...`);
    const latestPet = await request('GET', `/location/latest/${petId}`, null, token);
    if (latestPet.body?.data?.location) {
        console.log(`   ✅ Encontrada: lat:${latestPet.body.data.location.latitude}`);
    } else {
        console.log('   ❌ No encontrada');
    }

    // 7. Bulk insert
    console.log('\n📡 7. POST /location/bulk (IoT batch)...');
    const bulkRes = await request('POST', '/location/bulk', {
        locations: [
            { petId, latitude: -17.7850, longitude: -63.1840, accuracy: 5, battery: 76 },
            { petId, latitude: -17.7855, longitude: -63.1845, accuracy: 4, battery: 75 },
        ]
    }, token);
    console.log(`   Status: ${bulkRes.status} - Count: ${bulkRes.body.data?.count}`);

    // 8. Historial
    console.log(`\n📋 8. GET /location?petId=${petId}&limit=5...`);
    const history = await request('GET', `/location?petId=${petId}&limit=5`, null, token);
    console.log(`   Total registros: ${history.body?.data?.length || 0}`);

    console.log('\n✅ PRUEBAS COMPLETADAS');
}

main().catch(console.error);
