import { prisma } from '../config/database';
import { Pet } from '@prisma/client';
import { sendPushNotification } from './notificationService';

export const seedReminders = async (pet: Pet) => {
    const now = new Date();
    const birthDate = pet.birthDate ? new Date(pet.birthDate) : null;
    const reminders = [];

    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const species = pet.species.toLowerCase();
    console.log(`[DEBUG] Seeding reminders for ${pet.name}, Species: ${species}`);

    // Calcular edad en semanas y meses para precisión de protocolos
    let ageInWeeks = 0;
    let ageInMonths = 0;
    if (birthDate) {
        const diffTime = Math.abs(now.getTime() - birthDate.getTime());
        ageInWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
    }
    console.log(`[DEBUG] Age: ${ageInWeeks} weeks, ${ageInMonths} months`);

    // --- LÓGICA POR ESPECIE ---

    // 1. PERROS (CANI)
    if (species.includes('perro') || species.includes('canino') || species.includes('dog')) {
        console.log('[DEBUG] Matching Dog protocol');
        // Vacuna Anual / Cachorro
        if (birthDate && ageInWeeks < 20) {
            // Regla Cachorro: 3 dosis (semanas 8, 12, 16)
            const weeks = [8, 12, 16];
            weeks.forEach((w, i) => {
                const dueDate = addDays(birthDate, w * 7);
                if (dueDate >= now) {
                    reminders.push({
                        petId: pet.id,
                        type: 'VACUNA',
                        title: `Vacuna Quíntuple (Dosis ${i + 1})`,
                        dueDate,
                        isRecurring: false,
                        status: 'PENDIENTE'
                    });
                }
            });
        } else {
            // Adulto: Refuerzo anual
            reminders.push({
                petId: pet.id,
                type: 'VACUNA',
                title: 'Vacuna Anual (Refuerzo)',
                dueDate: addDays(now, 365),
                isRecurring: true,
                frequencyMonths: 12,
                status: 'PENDIENTE'
            });
        }

        // Desparasitación
        if (birthDate && ageInMonths < 6) {
            // Mensual hasta los 6 meses
            for (let i = 1; i <= (6 - ageInMonths); i++) {
                reminders.push({
                    petId: pet.id,
                    type: 'DESPARASITACION',
                    title: 'Desparasitación Mensual Cachorro',
                    dueDate: addDays(now, i * 30),
                    isRecurring: false,
                    status: 'PENDIENTE'
                });
            }
        } else {
            // Adulto: Cada 3 meses
            reminders.push({
                petId: pet.id,
                type: 'DESPARASITACION',
                title: 'Desparasitación Trimestral',
                dueDate: now,
                isRecurring: true,
                frequencyMonths: 3,
                status: 'PENDIENTE'
            });
        }
    }

    // 2. GATOS (FELI)
    else if (species.includes('gato') || species.includes('felino') || species.includes('cat')) {
        console.log('[DEBUG] Matching Cat protocol');
        // Vacuna Anual / Cachorro
        if (birthDate && ageInWeeks < 15) {
            // Regla Cachorro: 2 dosis (semana 9 y 12)
            const weeks = [9, 12];
            weeks.forEach((w, i) => {
                const dueDate = addDays(birthDate, w * 7);
                if (dueDate >= now) {
                    reminders.push({
                        petId: pet.id,
                        type: 'VACUNA',
                        title: `Vacuna Triple Felina (Dosis ${i + 1})`,
                        dueDate,
                        isRecurring: false,
                        status: 'PENDIENTE'
                    });
                }
            });
        } else {
            // Adulto: Refuerzo anual
            reminders.push({
                petId: pet.id,
                type: 'VACUNA',
                title: 'Vacuna Anual (Refuerzo)',
                dueDate: addDays(now, 365),
                isRecurring: true,
                frequencyMonths: 12,
                status: 'PENDIENTE'
            });
        }

        // Desparasitación
        if (birthDate && ageInMonths < 4) {
            // Mensual hasta los 4 meses
            for (let i = 1; i <= (4 - ageInMonths); i++) {
                reminders.push({
                    petId: pet.id,
                    type: 'DESPARASITACION',
                    title: 'Desparasitación Mensual Gatito',
                    dueDate: addDays(now, i * 30),
                    isRecurring: false,
                    status: 'PENDIENTE'
                });
            }
        } else {
            // Adulto: Cada 4 meses
            reminders.push({
                petId: pet.id,
                type: 'DESPARASITACION',
                title: 'Desparasitación Cuatrimestral',
                dueDate: now,
                isRecurring: true,
                frequencyMonths: 4,
                status: 'PENDIENTE'
            });
        }
    }

    // 3. LOROS (AVES)
    else if (species.includes('loro') || species.includes('ave') || species.includes('parrot') || species.includes('bird')) {
        console.log('[DEBUG] Matching Bird protocol');
        // Revisión Pico/Uñas (Cada 6 meses, solo adultos > 1 año)
        if (!birthDate || ageInMonths >= 12) {
            reminders.push({
                petId: pet.id,
                type: 'HIGIENE',
                title: 'Revisión técnica (Pico y Uñas)',
                dueDate: addDays(now, 180),
                isRecurring: true,
                frequencyMonths: 6,
                status: 'PENDIENTE'
            });
        }

        // Limpieza Profunda (Cada 1 mes, siempre)
        reminders.push({
            petId: pet.id,
            type: 'HIGIENE',
            title: 'Limpieza Profunda de Hábitat',
            dueDate: addDays(now, 30),
            isRecurring: true,
            frequencyMonths: 1,
            status: 'PENDIENTE'
        });
    }

    // Esterilización (Común para perros/gatos)
    if ((species.includes('perro') || species.includes('gato') || species.includes('dog') || species.includes('cat')) && birthDate && ageInMonths < 12) {
        reminders.push({
            petId: pet.id,
            type: 'CASTRACION',
            title: 'Evaluación para Esterilización',
            dueDate: ageInMonths < 6 ? addDays(birthDate, 180) : addDays(now, 30),
            isRecurring: false,
            status: 'PENDIENTE'
        });
    }

    console.log(`[DEBUG] Generated ${reminders.length} reminders`);

    // Insertar y Notificar
    if (reminders.length > 0) {
        try {
            await (prisma as any).reminder.createMany({ data: reminders });
            console.log('[DEBUG] Successfully saved reminders to DB');

            const emojis = ['🐾', '🦴', '✨', '❤️', '🐶', '🐱', '🦜'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            await sendPushNotification(
                pet.userId,
                `¡Plan de Salud para ${pet.name}! ${randomEmoji}`,
                `Hemos preparado ${reminders.length} recordatorios específicos para su especie. ¡Revisa su nuevo calendario!`,
                { petId: pet.id, screen: 'PetDetails' }
            );
        } catch (error) {
            console.error('[DEBUG] Error saving reminders:', error);
        }
    } else {
        console.log('[DEBUG] No reminders to generate for this species/age');
    }
};
